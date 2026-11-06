import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';

export default async function LoginPage({ searchParams }) {
  const session = await getSession();
  if (session) redirect('/arah');
  return <LoginForm baruDaftar={searchParams?.daftar === 'ok'} />;
}
