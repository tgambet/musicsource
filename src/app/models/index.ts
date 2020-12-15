export interface ExternalImage {
  height: number;
  width: number;
  url: string;
}

export interface InternalImage {
  height: number;
  width: number;
  dataUrl: string;
}

export type CoverImage = InternalImage | ExternalImage;

export interface Cover {
  id: string;
  images: InternalImage[];
}
