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
import { getPictureId, Picture } from '@app/database/pictures/picture.model';

addEventListener('message', async ({ data }) => {
  const { id, entry }: { id: number; entry: FileEntry } = data;

  try {
    const file = await entry.handle.getFile();

    const { common: tags, format } = await mm.parseBlob(file, {
      duration: false,
      skipCovers: false,
      skipPostHeaders: false,
    });

    // if (
    //   tags.albumartist === undefined ||
    //   tags.album === undefined ||
    //   tags.artists === undefined ||
    //   tags.title === undefined
    // ) {
    //   postMessage({ id, error: 'empty tags' });
    //   return;
    // }

    const artistsTags = tags.artists || [];
    const albumArtistName = tags.albumartist || 'Unknown artist';
    const albumTitle = tags.album || 'Unknown album';
    const title = tags.title || entry.name;

    const updatedOn = Date.now();

    const artists: Artist[] = artistsTags.map((name) => ({
      id: getArtistId(name),
      name,
      updatedOn,
    }));

    const albumArtist: Artist = {
      id: getArtistId(albumArtistName),
      name: albumArtistName,
      updatedOn,
    };

    if (artists.length === 0) {
      artists.push(albumArtist);
    }

    const album: Album = {
      id: getAlbumId(albumArtist.name, albumTitle),
      title: albumTitle,
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
      title,
      artists: artists.map((a) => ({ name: a.name, id: a.id })),
      album: { title: album.title, id: album.id },
      lastModified: file.lastModified,
      format,
      updatedOn,
      duration: format.duration,
      tags,
    };

    const pictures: Picture[] = (tags.picture || []).map((picture) => ({
      id: getPictureId(picture.data.toString()),
      name: picture.name || picture.description,
      data: picture.data,
      format: picture.format,
      sources: [],
      entries: [entry],
      songs: [song.entryPath],
      albums: [album.id],
      artists: [albumArtist.id],
    }));

    delete tags.picture;

    postMessage({ id, result: { album, artists, song, pictures } });
  } catch (e) {
    postMessage({ id, error: e });
  }
});
