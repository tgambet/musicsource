import { Except } from '@app/utils/types.util';
import { Observable } from 'rxjs';

export interface Artist {
  hash: string;
  name: string;
  pictureKey?: IDBValidKey;
  likedOn?: Date;
  listenedOn?: Date;
  lastModified: Date;
}

export type ArtistWithCover = Except<Artist, 'pictureKey'> & { cover?: string };

export type ArtistWithCover$ = Except<Artist, 'pictureKey'> & {
  cover$: Observable<string | undefined>;
};
