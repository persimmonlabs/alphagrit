import { redirect } from 'next/navigation';

// E-book content is managed through Sanity Studio
// Redirect to admin dashboard which has link to Sanity
export default function AdminEbooksPage() {
  redirect('/admin');
}
