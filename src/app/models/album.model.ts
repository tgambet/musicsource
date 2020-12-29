import { Except } from '@app/utils/types.util';

export interface Album {
  name: string;
  hash: string;
  albumArtist?: string;
  artists: string[];
  year?: number;
  pictureKey?: IDBValidKey;
  lastModified: Date;
}

export type AlbumWithCover = Except<Album, 'pictureKey'> & { cover?: string };
