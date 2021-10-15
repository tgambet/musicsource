import { hash } from '@app/core/utils';
import { Opaque } from 'type-fest';
import { PictureId } from '@app/database/pictures/picture.model';

export type ArtistId = Opaque<string, Artist>;

export const getArtistId = (name: string): ArtistId => hash(name) as ArtistId;

export type Artist = {
  id: ArtistId;
  likedOn?: number;
  name: string;
  pictureKey?: PictureId;
  updatedOn: number;
};
