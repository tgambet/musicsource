import { hash } from '@app/core/utils';
import { Opaque } from 'type-fest';
import { EntryId } from '@app/database/entries/entry.model';

export type ArtistId = Opaque<string, Artist>;

export const getArtistId = (name: string): ArtistId => hash(name) as ArtistId;

export type Artist = {
  id: ArtistId;
  entries: EntryId[];
  name: string;
  updatedOn: number;
  likedOn?: number;
};
