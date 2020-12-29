import { ICommonTagsResult } from 'music-metadata/lib/type';
import { Except } from '@app/utils/types.util';
import { Observable } from 'rxjs';

export type Song = Omit<ICommonTagsResult, 'picture'> & {
  entryPath: string;
  lastModified: Date;
  pictureKey?: IDBValidKey;
  duration?: number;
  likedOn?: Date;
};

export type SongWithCover = Except<Song, 'pictureKey'> & {
  cover?: string;
};

export type SongWithCover$ = Except<Song, 'pictureKey'> & {
  cover$: Observable<string>;
};
