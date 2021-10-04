import { ICommonTagsResult } from 'music-metadata/lib/type';
import { Observable } from 'rxjs';

export type Song = Omit<ICommonTagsResult, 'picture'> & {
  albumHash: string;
  entryPath: string;
  lastModified: Date;
  pictureKey?: IDBValidKey;
  duration?: number;
  likedOn?: Date;
};

export type SongWithCover$ = Omit<Song, 'pictureKey'> & {
  cover$: Observable<string | undefined>;
};
