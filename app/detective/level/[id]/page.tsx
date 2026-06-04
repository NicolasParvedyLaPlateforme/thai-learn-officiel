import { notFound } from 'next/navigation';
import detectiveData from '../../../data/detective.json';
import { DetectiveLevel } from '../../../types';
import DetectiveClientWrapper from '../../../components/detective/DetectiveClientWrapper';

export default async function DetectiveLevelPage(
  props: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const id = params.id;
  const level = (detectiveData as DetectiveLevel[]).find((l) => l.id === id);

  const isDev = searchParams?.dev === 'dev';
  const diffParam = searchParams?.diff;
  const initialDiff = diffParam === '2' ? 2 : (diffParam === '1' ? 1 : undefined);

  // Si le niveau n'existe pas et qu'on est pas en mode dev, on retourne une 404
  if (!level && !isDev) {
    notFound();
  }

  const effectiveLevel = level || {
    id,
    title: 'Nouveau niveau',
    titleEn: 'New level',
    description: '',
    descriptionEn: '',
    imageUrl: '',
    objects: []
  };

  return <DetectiveClientWrapper level={effectiveLevel} isDev={isDev} initialDiff={initialDiff} />;
}
