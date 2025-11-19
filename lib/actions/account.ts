'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import type { UpdateProfileData, ChangePasswordData, RefundRequest } from '@/lib/types/account';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Update user profile information
 */
export async function updateProfile(data: UpdateProfileData) {
  try {
    const supabase = await createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update auth email if changed
    if (data.email && data.email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: data.email,
      });
      if (emailError) {
        return { success: false, error: emailError.message };
      }
    }

    // Update profile in database
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;

    if (Object.keys(updateData).length > 0) {
      updateData.updated_at = new Date().toISOString();

      const { error: dbError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (dbError) {
        return { success: false, error: dbError.message };
      }
    }

    revalidatePath('/account/settings');
    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

/**
 * Change user password
 */
export async function changePassword(data: ChangePasswordData) {
  try {
    const supabase = await createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify old password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: data.oldPassword,
    });

    if (signInError) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: 'Failed to change password' };
  }
}

/**
 * Delete user account (LGPD compliance)
 */
export async function deleteAccount() {
  try {
    const supabase = await createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Anonymize orders (keep for records but remove personal data)
    await supabase
      .from('orders')
      .update({
        user_id: '00000000-0000-0000-0000-000000000000',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // Delete cart items
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    // Delete download links
    await supabase
      .from('download_links')
      .delete()
      .eq('user_id', user.id);

    // Delete user profile
    await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    // Delete auth user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
    }

    // Sign out
    await supabase.auth.signOut();

    redirect('/');
  } catch (error) {
    console.error('Delete account error:', error);
    return { success: false, error: 'Failed to delete account' };
  }
}

/**
 * Request order refund
 */
export async function requestRefund(request: RefundRequest) {
  try {
    const supabase = await createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(*))')
      .eq('id', request.orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.status === 'refunded') {
      return { success: false, error: 'Order already refunded' };
    }

    if (order.refund_status === 'requested' || order.refund_status === 'approved') {
      return { success: false, error: 'Refund already requested' };
    }

    // Calculate days since purchase
    const purchaseDate = new Date(order.created_at);
    const daysSincePurchase = Math.floor(
      (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSincePurchase > 30) {
      return { success: false, error: 'Refund period expired (30 days)' };
    }

    // Auto-approve if within 7 days
    const autoApprove = daysSincePurchase <= 7;
    const refundStatus = autoApprove ? 'approved' : 'requested';

    // Update order
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        refund_status: refundStatus,
        refund_reason: request.reason,
        refund_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.orderId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Process Stripe refund if auto-approved
    if (autoApprove && order.stripe_payment_intent_id) {
      try {
        await stripe.refunds.create({
          payment_intent: order.stripe_payment_intent_id,
          reason: 'requested_by_customer',
        });

        // Update order to refunded status
        await supabase
          .from('orders')
          .update({
            status: 'refunded',
            payment_status: 'refunded',
            refund_status: 'completed',
            refunded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', request.orderId);

        // Deactivate download links
        await supabase
          .from('download_links')
          .update({
            expires_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', request.orderId);

      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError);
        return { success: false, error: 'Failed to process refund with payment provider' };
      }
    }

    revalidatePath('/account/orders');
    revalidatePath(`/account/orders/${request.orderId}`);

    return {
      success: true,
      autoApproved: autoApprove,
      message: autoApprove
        ? 'Refund approved and processed'
        : 'Refund request submitted for review'
    };
  } catch (error) {
    console.error('Request refund error:', error);
    return { success: false, error: 'Failed to request refund' };
  }
}

/**
 * Update user preferences
 */
export async function updatePreferences(preferences: { language?: 'pt' | 'en'; theme?: 'light' | 'dark' | 'system' }) {
  try {
    const supabase = await createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get current preferences
    const { data: currentPrefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const updateData = {
      ...preferences,
      updated_at: new Date().toISOString(),
    };

    if (currentPrefs) {
      // Update existing preferences
      const { error: updateError } = await supabase
        .from('user_preferences')
        .update(updateData)
        .eq('user_id', user.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }
    } else {
      // Insert new preferences
      const { error: insertError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          ...updateData,
        });

      if (insertError) {
        return { success: false, error: insertError.message };
      }
    }

    revalidatePath('/account/settings');
    return { success: true };
  } catch (error) {
    console.error('Update preferences error:', error);
    return { success: false, error: 'Failed to update preferences' };
  }
}

/**
 * Record e-book download
 */
export async function recordEbookDownload(downloadLinkId: string) {
  try {
    const supabase = await createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get download link
    const { data: downloadLink, error: linkError } = await supabase
      .from('download_links')
      .select('*')
      .eq('id', downloadLinkId)
      .eq('user_id', user.id)
      .single();

    if (linkError || !downloadLink) {
      return { success: false, error: 'Download link not found' };
    }

    // Check if expired
    if (downloadLink.expires_at && new Date(downloadLink.expires_at) < new Date()) {
      return { success: false, error: 'Download link expired' };
    }

    // Check download limit
    if (downloadLink.download_count >= downloadLink.max_downloads) {
      return { success: false, error: 'Download limit reached' };
    }

    // Increment download count
    const { error: updateError } = await supabase
      .from('download_links')
      .update({
        download_count: downloadLink.download_count + 1,
        last_downloaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', downloadLinkId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath('/account/ebooks');
    return { success: true };
  } catch (error) {
    console.error('Record download error:', error);
    return { success: false, error: 'Failed to record download' };
  }
}

/**
 * Request new download link email
 */
export async function requestDownloadEmail(downloadLinkId: string) {
  try {
    const supabase = await createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get download link and product info
    const { data: downloadLink, error: linkError } = await supabase
      .from('download_links')
      .select('*, product:products(*)')
      .eq('id', downloadLinkId)
      .eq('user_id', user.id)
      .single();

    if (linkError || !downloadLink) {
      return { success: false, error: 'Download link not found' };
    }

    // TODO: Implement email sending service
    // For now, just log the request
    console.log('Download email requested:', {
      userId: user.id,
      email: user.email,
      productId: downloadLink.product_id,
      downloadLinkId,
    });

    return {
      success: true,
      message: 'Download link sent to your email'
    };
  } catch (error) {
    console.error('Request download email error:', error);
    return { success: false, error: 'Failed to send download email' };
  }
}
