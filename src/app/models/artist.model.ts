import { Except } from '@app/utils/types.util';

export interface Artist {
  id: string;
  name: string;
  pictureKey?: IDBValidKey;
}

export type ArtistWithCover = Except<Artist, 'pictureKey'> & { cover?: string };
