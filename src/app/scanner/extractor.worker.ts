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
import { ICommonTagsResult, IFormat } from 'music-metadata/lib/type';

export type ExtractorResult = {
  common: Omit<ICommonTagsResult, 'picture'>;
  format: IFormat;
  lastModified: number;
  // pictures: {
  //   id: PictureId;
  //   name: string;
  //   blob: Blob;
  // }[];
};

const extractAudio = (
  entry: FileEntry,
  result: ExtractorResult,
  updatedOn: number
): {
  artists: Artist[];
  album: Album;
  song: Song;
} => {
  const { common: tags, format, lastModified } = result;

  if (
    tags.albumartist === undefined ||
    tags.album === undefined ||
    tags.artists === undefined ||
    tags.title === undefined
  ) {
    throw new Error('empty tags');
  }

  // const date = new Date();
  // date.setMilliseconds(0);
  // const updatedOn = date.getTime();

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
    lastModified,
    format,
    updatedOn,
    duration: format.duration,
    tags,
    // pictureId: pictures[0]?.id,
  };

  return { album, artists, song };

  //     return merge(
  //       // ...pictures.map(({ id, name, blob }) =>
  //       //   this.addOrUpdatePicture(id, name || entry.name, entry.path, blob)
  //       // ),
  //       this.addOrUpdateAlbum(
  //         album.id,
  //         album.title,
  //         album.albumArtist,
  //         album.artists,
  //         album.updatedOn,
  //         album.folder,
  //         album.year
  //       ),
  //       of(
  //         ...artists.map((artist) => saveArtist({ artist })),
  //         saveSong({ song }),
  //         extractSuccess({
  //           label: `${song.artists[0].name} - ${song.title}`,
  //         })
  //       )
  //     );
  //   }),
  //   tap({ error: (err) => console.error(entry.path, err) }),
  //   catchError((error) => of(extractFailure({ error })))
  //   // map((action) => this.store.dispatch(action)),
  //   // last()
  // );
};

addEventListener('message', ({ data }) => {
  const { id, entry }: { id: number; entry: FileEntry } = data;

  entry.handle
    .getFile()
    .then((file) =>
      mm.parseBlob(file).then(({ common, format }) => {
        // const pictures = (common.picture || []).map((picture) => {
        //   const blob = new Blob([picture.data], { type: picture.format });
        //   return {
        //     id: getPictureId(picture.data.toString()),
        //     name: picture.name || picture.description,
        //     blob,
        //   };
        // });
        delete common.picture;
        return {
          common,
          format,
          lastModified: file.lastModified,
          // pictures,
        };
      })
    )
    .then((result) => extractAudio(entry, result, Date.now()))
    .then((result) => {
      postMessage({ id, result });
    })
    .catch((error) => {
      postMessage({ id, error });
    });
});
