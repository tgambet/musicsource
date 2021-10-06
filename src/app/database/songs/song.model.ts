import { ICommonTagsResult } from 'music-metadata/lib/type';

export type Song = Omit<ICommonTagsResult, 'picture'> & {
  albumHash: string;
  entryPath: string;
  lastModified: Date;
  pictureKey?: string;
  duration?: number;
  likedOn?: Date;
};
