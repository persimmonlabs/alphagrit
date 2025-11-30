import { redirect } from 'next/navigation';

// Blog content will be managed through Sanity Studio
export default function AdminNewBlogPage() {
  redirect('/admin');
}
