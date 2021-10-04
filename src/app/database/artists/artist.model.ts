import { Observable } from 'rxjs';
import { hash } from '@app/core/utils';

export type Artist = {
  hash: string;
  name: string;
  pictureKey?: IDBValidKey;
  likedOn?: Date;
  listenedOn?: Date;
  lastModified: Date;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Artist = {
  getHash: (name: string): string => hash(name),
};

export type ArtistWithCover$ = Omit<Artist, 'pictureKey'> & {
  cover$: Observable<string | undefined>;
};
