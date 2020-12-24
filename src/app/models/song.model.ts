import { ICommonTagsResult } from 'music-metadata/lib/type';

export type Song = Omit<ICommonTagsResult, 'picture'> & {
  entryPath: string;
  pictureKey?: IDBValidKey;
  duration?: number;
};
