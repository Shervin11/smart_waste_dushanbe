import LandingPageClient from './LandingPageClient';
import { getCurrentUser } from '@/actions/auth';

export default async function Home() {
  const currentUser = await getCurrentUser();
  return <LandingPageClient currentUser={currentUser} />;
}
