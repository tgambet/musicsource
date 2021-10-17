import { hash } from '@app/core/utils';
import { Opaque } from 'type-fest';

export type ArtistId = Opaque<string, Artist>;

export const getArtistId = (name: string): ArtistId => hash(name) as ArtistId;

export type Artist = {
  id: ArtistId;
  name: string;
  updatedOn: number;
  likedOn?: number;
};
