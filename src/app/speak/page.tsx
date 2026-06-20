import { getLightweightSpeakLessons } from "@/actions/speak_course";
import SpeakClientPage from "@/components/speak/SpeakClientPage";

export default async function SpeakPage() {
  const lightweightLessons = await getLightweightSpeakLessons();
  return <SpeakClientPage lightweightLessons={lightweightLessons} />;
}
