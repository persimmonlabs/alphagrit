import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';

export default async function DashboardLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);

  // Simply render the children - navigation is handled in the template
  return <>{children}</>;
}
