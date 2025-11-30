import { redirect } from 'next/navigation';

// Settings managed through Sanity Studio and env vars
export default function AdminSettingsPage() {
  redirect('/admin');
}
