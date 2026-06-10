import { getAllFeedbacks, getAllSuggestedLocations } from '@/actions/admin';
import FeedbackClient from './FeedbackClient';
import DashboardLayout from '@/components/DashboardLayout';

export const revalidate = 0;

export default async function FeedbackPage() {
  const feedbacks = await getAllFeedbacks();
  const suggestedLocations = await getAllSuggestedLocations();

  return (
    <DashboardLayout>
      <FeedbackClient
        initialFeedbacks={feedbacks}
        initialSuggestedLocations={suggestedLocations}
      />
    </DashboardLayout>
  );
}
