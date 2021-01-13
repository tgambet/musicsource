import { Except } from '@app/utils/types.util';
import { Observable } from 'rxjs';

export interface Album {
  name: string;
  hash: string;
  albumArtist?: string;
  artists: string[];
  year?: number;
  pictureKey?: IDBValidKey;
  lastModified: Date;
  likedOn?: Date;
}

export type AlbumWithCover$ = Except<Album, 'pictureKey'> & {
  cover$: Observable<string | undefined>;
};
