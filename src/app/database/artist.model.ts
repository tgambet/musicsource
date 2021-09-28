import { Observable } from 'rxjs';

export interface Artist {
  hash: string;
  name: string;
  pictureKey?: IDBValidKey;
  likedOn?: Date;
  listenedOn?: Date;
  lastModified: Date;
}

export type ArtistWithCover = Omit<Artist, 'pictureKey'> & { cover?: string };

export type ArtistWithCover$ = Omit<Artist, 'pictureKey'> & {
  cover$: Observable<string | undefined>;
};
