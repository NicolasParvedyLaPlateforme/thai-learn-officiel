export interface DetectiveObject {
  id: string;
  th: string;
  fr: string;
  en: string;
  de?: string;
  es?: string;
  it?: string;
  x: number; // percentage
  y: number; // percentage
  radius: number; // percentage
}

export interface DetectiveLevel {
  id: string;
  categoryId?: string;
  title: string;
  titleEn: string;
  titleDe?: string;
  titleEs?: string;
  titleIt?: string;
  description: string;
  descriptionEn: string;
  descriptionDe?: string;
  descriptionEs?: string;
  descriptionIt?: string;
  imageUrl: string;
  objects: DetectiveObject[];
}
