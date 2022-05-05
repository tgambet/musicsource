import * as _buffer from 'buffer';
import * as process from 'process';

Object.assign(self, {
  process,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Buffer: _buffer.Buffer,
});

import * as mm from 'music-metadata-browser';
import { FileEntry } from '@app/database/entries/entry.model';
import { Artist, getArtistId } from '@app/database/artists/artist.model';
import { Album, getAlbumId } from '@app/database/albums/album.model';
import { getSongId, Song } from '@app/database/songs/song.model';
import { getPictureId } from '@app/database/pictures/picture.model';
import { readAsDataURL } from '@app/core/utils/read-as-data-url.util';
import { firstValueFrom } from 'rxjs';

addEventListener('message', async ({ data }) => {
  const { id, entry }: { id: number; entry: FileEntry } = data;

  const file = await entry.handle.getFile();

  const { common: tags, format } = await mm.parseBlob(file);

  if (
    tags.albumartist === undefined ||
    tags.album === undefined ||
    tags.artists === undefined ||
    tags.title === undefined
  ) {
    postMessage({ id, error: 'empty tags' });
    return;
  }

  const updatedOn = Date.now();

  const artists: Artist[] = tags.artists.map((name) => ({
    id: getArtistId(name),
    name,
    updatedOn,
  }));

  const albumArtist: Artist = {
    id: getArtistId(tags.albumartist),
    name: tags.albumartist,
    updatedOn,
  };

  const album: Album = {
    id: getAlbumId(albumArtist.name, tags.album),
    title: tags.album,
    albumArtist: {
      name: albumArtist.name,
      id: albumArtist.id,
    },
    artists: artists.map((a) => a.id),
    updatedOn,
    year: tags.year,
    folder: entry.parent,
  };

  const song: Song = {
    entryPath: getSongId(entry.path),
    folder: entry.parent,
    title: tags.title,
    artists: artists.map((a) => ({ name: a.name, id: a.id })),
    album: { title: album.title, id: album.id },
    lastModified: file.lastModified,
    format,
    updatedOn,
    duration: format.duration,
    tags,
    // pictureId: pictures[0]?.id,
  };

  const pictures = await Promise.all(
    (tags.picture || []).map(async (picture) => {
      const blob = new Blob([picture.data], { type: picture.format });
      const original = await firstValueFrom(readAsDataURL(blob));
      return {
        id: getPictureId(picture.data.toString()),
        name: picture.name || picture.description,
        original,
        sources: [],
        entries: [entry],
        songs: [song.entryPath],
        albums: [album.id],
        artists: [albumArtist.id],
      };
    })
  );

  postMessage({ id, result: { album, artists, song, pictures } });
});
