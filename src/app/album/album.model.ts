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
  listenedOn?: Date;
}

export type AlbumWithCover$ = Omit<Album, 'pictureKey'> & {
  cover$: Observable<string | undefined>;
};
