import { ICommonTagsResult } from 'music-metadata/lib/type';
import { Except } from '@app/utils/types.util';

export type Song = Omit<ICommonTagsResult, 'picture'> & {
  entryPath: string;
  pictureKey?: IDBValidKey;
  duration?: number;
};

export type SongWithCover = Except<Song, 'pictureKey'> & {
  cover?: string;
};
