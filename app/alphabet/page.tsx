import AlphabetClientPage from './components/AlphabetClientPage';
import { getLightweightLessons } from '../actions/course';

export default async function AlphabetPage() {
  const lightweightLessons = await getLightweightLessons();
  return <AlphabetClientPage lightweightLessons={lightweightLessons} />;
}
