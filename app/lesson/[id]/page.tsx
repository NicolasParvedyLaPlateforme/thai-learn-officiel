import { getLessonData } from '../../actions/course';
import LessonClientPage from './components/LessonClientPage';

export const dynamic = 'force-dynamic';

export default async function LessonPage({ params }: any) {
  const resolvedParams = await params;
  const lesson = await getLessonData(resolvedParams.id);
  return <LessonClientPage lesson={lesson} />;
}
