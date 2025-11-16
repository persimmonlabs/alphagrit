import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect to store homepage
  redirect('/store')
}
