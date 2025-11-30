import { redirect } from 'next/navigation';

// E-book content is managed through Sanity Studio
export default function AdminNewEbookPage() {
  redirect('/admin');
}
