import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { concatMap, Observable, of, switchMap } from 'rxjs';
import {
  selectPictureAll,
  selectPictureByFolder,
  selectPictureByKey,
  selectPictureTotal,
} from '@app/database/pictures/picture.selectors';
import { Picture, PictureId } from '@app/database/pictures/picture.model';
import { map, tap } from 'rxjs/operators';
import { Album } from '@app/database/albums/album.model';
import { SongFacade } from '@app/database/songs/song.facade';
import { Song } from '@app/database/songs/song.model';
import { Artist } from '@app/database/artists/artist.model';
import { ArtistFacade } from '@app/database/artists/artist.facade';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { longestCommonPath } from '@app/core/utils/longest-common-prefix.util';
import { DatabaseService } from '@app/database/database.service';
import { upsertPicture } from '@app/database/pictures/picture.actions';

@Injectable()
export class PictureFacade {
  constructor(
    private store: Store,
    private songs: SongFacade,
    private artists: ArtistFacade,
    private albums: AlbumFacade,
    private database: DatabaseService
  ) {}

  put(picture: Picture): Observable<IDBValidKey> {
    const uniq = <T>(value: T, i: number, arr: T[]) => arr.indexOf(value) === i;

    return this.database.db$.pipe(
      concatMap((db) => db.transaction$('pictures', 'readwrite')),
      concatMap((transaction) => transaction.objectStore$<Picture>('pictures')),
      concatMap((store) =>
        store.get$(picture.id).pipe(
          map((stored) =>
            stored
              ? {
                  ...stored,
                  sources: [...stored.sources, ...picture.sources],
                  entries: [...stored.entries, ...picture.entries].filter(uniq),
                  songs: [...stored.songs, ...picture.songs].filter(uniq),
                  artists: [...stored.artists, ...picture.artists].filter(uniq),
                  albums: [...stored.albums, ...picture.albums].filter(uniq),
                }
              : picture
          ),
          concatMap((updated) =>
            store
              .put$(updated)
              .pipe(tap(() => this.store.dispatch(upsertPicture({ picture }))))
          )
        )
      )
    );
  }

  getByKey(key: PictureId): Observable<Picture | undefined> {
    return this.store.select(selectPictureByKey(key));
  }

  getPictureBySize(
    picture?: Picture,
    size = 0
  ): Observable<string | undefined> {
    return size === 0
      ? this.getOriginalPicture(picture)
      : of(picture && picture.sources.find((p) => p.height === size)?.src);
  }

  getOriginalPicture(picture?: Picture): Observable<string | undefined> {
    if (!picture) {
      return of(undefined);
    }
    return this.database
      .get$<Picture>('pictures', picture.id)
      .pipe(map((pict) => pict && pict.original));
  }

  getCover(key?: PictureId, size = 0): Observable<string | undefined> {
    return !key
      ? of(undefined)
      : this.store
          .select(selectPictureByKey(key))
          .pipe(concatMap((picture) => this.getPictureBySize(picture, size)));
  }

  getFolderPicture(
    folder: string,
    size = 0,
    names: string[]
  ): Observable<string | undefined> {
    return this.store
      .select(selectPictureByFolder(folder, names))
      .pipe(concatMap((picture) => this.getPictureBySize(picture, size)));
  }

  getAll(): Observable<Picture[]> {
    return this.store.select(selectPictureAll);
  }

  getTotal(): Observable<number> {
    return this.store.select(selectPictureTotal);
  }

  // -------------------------------------------------------

  /**
   * Get cover from folder or first song that has a picture
   */
  getAlbumCover(album: Album, size = 0): Observable<string | undefined> {
    return this.getFolderPicture(album.folder, size, [
      'folder',
      'cover',
      'discart',
    ]).pipe(
      switchMap((folderPict) =>
        folderPict
          ? of(folderPict)
          : this.songs.getByAlbumKey(album.id).pipe(
              map(
                (songs) =>
                  songs && songs.find((song) => !!song.pictureId)?.pictureId
              ),
              switchMap((pictureId) =>
                pictureId ? this.getCover(pictureId, size) : of(undefined)
              )
            )
      )
    );
  }

  getSongCover(song: Song, size = 0): Observable<string | undefined> {
    return this.getCover(song.pictureId, size).pipe(
      switchMap((picture) =>
        picture
          ? of(picture)
          : this.getFolderPicture(song.folder, size, ['folder', 'cover'])
      )
    );
  }

  getArtistCover(
    artist: Artist,
    size = 0,
    names = ['folder', 'cover', 'fanart']
  ): Observable<string | undefined> {
    return this.albums.getByArtistKey(artist.id).pipe(
      map((albums) => albums && albums.map((a) => a.folder)),
      map((folders) => folders && longestCommonPath(folders)),
      switchMap((folder) =>
        !folder ? of(undefined) : this.getFolderPicture(folder, size, names)
      )
    );
  }

  getArtistBanner(artist: Artist, size = 0): Observable<string | undefined> {
    return this.getArtistCover(artist, size, ['fanart', 'folder']);
  }

  // addOrUpdatePicture = (
  //   id: PictureId,
  //   name: string,
  //   path: string,
  //   blob: Blob
  // ): Observable<Action> =>
  //   this.pictures.getByKey(id).pipe(
  //     first(),
  //     concatMap((stored) => {
  //       if (!stored) {
  //         if (name.toLowerCase().includes('fanart')) {
  //           return readAsDataURL(blob).pipe(
  //             map((src) => ({
  //               id,
  //               original: src,
  //               sources: [],
  //               name,
  //               entries: [path],
  //             })),
  //             map((picture) => saveImage({ picture }))
  //           );
  //         }
  //
  //         return this.resizer
  //           .resize(blob, [
  //             // { height: 32 },
  //             // { height: 40 },
  //             // { height: 56 },
  //             // { height: 160 },
  //             // { height: 226 },
  //             // { height: 264 },
  //             // { height: 1100 },
  //           ])
  //           .pipe(
  //             map((sources) => {
  //               const picture: Picture = {
  //                 id,
  //                 // original: src,
  //                 sources,
  //                 name,
  //                 entries: [path],
  //               };
  //               return saveImage({ picture });
  //             })
  //           );
  //       } else {
  //         const picture = {
  //           ...stored,
  //           entries: [...stored.entries, path],
  //         };
  //         return of(saveImage({ picture }));
  //       }
  //     }),
  //     tapError((err) => console.error(err, path, name))
  //   );
}
