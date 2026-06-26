import PageLoadingSkeleton from '@/components/layout/PageLoadingSkeleton';

export default function Loading() {
  return (
    <PageLoadingSkeleton
      heroHeight="h-[280px]"
      progressSegments={4}
      timelineLineLeftDesktop="left-[3.25rem] md:left-[4.25rem]"
      timelineLineDesktopWidth="w-2.5"
    />
  );
}