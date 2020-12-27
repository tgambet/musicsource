import { Except } from '@app/utils/types.util';
import { Observable } from 'rxjs';

export interface Artist {
  id: string;
  name: string;
  pictureKey?: IDBValidKey;
}

export type ArtistWithCover = Except<Artist, 'pictureKey'> & { cover?: string };
export type ArtistWithCover$ = Except<Artist, 'pictureKey'> & {
  cover$: Observable<string>;
};
