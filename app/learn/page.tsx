import { getLightweightLessons } from '../actions/course';
import LearnClientPage from '../components/learn/LearnClientPage';

export default async function LearnPage() {
  const lightweightLessons = await getLightweightLessons();
  return <LearnClientPage lightweightLessons={lightweightLessons} />;
}
