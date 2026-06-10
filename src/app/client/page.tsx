import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth';
import { getClientFeedbacks, getClientSuggestedLocations } from '@/actions/client';
import ClientDashboard from './ClientDashboard';

export const revalidate = 0;

export default async function ClientPage() {
  const currentUser = await getCurrentUser();

  // Route security checks
  if (!currentUser) {
    redirect('/login');
  }

  // Operators/Drivers/Admins go to the admin dashboard
  if (currentUser.role !== 'CLIENT') {
    redirect('/dashboard');
  }

  // Fetch initial client logs
  const initialFeedbacks = await getClientFeedbacks(currentUser.name);
  const initialSuggestedLocations = await getClientSuggestedLocations();

  return (
    <ClientDashboard
      currentUser={currentUser}
      initialFeedbacks={initialFeedbacks}
      initialSuggestedLocations={initialSuggestedLocations}
    />
  );
}
