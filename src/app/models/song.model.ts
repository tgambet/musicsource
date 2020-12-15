import { FileEntry } from '@app/utils/entry.util';

export interface Song {
  id: string;
  entry: FileEntry;
  trackNumber: number | null;
  name?: string;
  artist?: string;
  artistId: string;
  albumArtist?: string;
  album?: string;
  albumId: string;
  genre?: string[];
  duration?: number;
}
