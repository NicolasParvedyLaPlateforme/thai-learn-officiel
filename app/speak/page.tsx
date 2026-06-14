import { getLightweightSpeakLessons } from '../actions/speak_course';
import SpeakClientPage from '../components/SpeakClientPage';

export default async function SpeakPage() {
  const lightweightLessons = await getLightweightSpeakLessons();
  return <SpeakClientPage lightweightLessons={lightweightLessons} />;
}
