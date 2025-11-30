import { redirect } from 'next/navigation';

// Feature flags managed through env vars
export default function AdminFeaturesPage() {
  redirect('/admin');
}
