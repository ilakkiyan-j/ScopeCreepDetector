import { redirect } from 'next/navigation';

export default function AppRootPage() {
  redirect('/app/dashboard');
}