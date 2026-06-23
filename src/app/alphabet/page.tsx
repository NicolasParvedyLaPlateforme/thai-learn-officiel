import AlphabetClientWrapper from "./components/AlphabetClientWrapper";
import { getLightweightLessons } from "@/actions/course";

export default async function AlphabetPage() {
  const lightweightLessons = await getLightweightLessons();
  return <AlphabetClientWrapper lightweightLessons={lightweightLessons} />;
}
