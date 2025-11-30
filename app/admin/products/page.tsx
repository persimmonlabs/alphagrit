import { redirect } from 'next/navigation';

// Products are now ebooks, managed through Sanity Studio
export default function AdminProductsPage() {
  redirect('/admin');
}
