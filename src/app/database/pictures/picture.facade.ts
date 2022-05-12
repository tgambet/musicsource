import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { concatMap, from, Observable, of } from 'rxjs';
import { Picture } from '@app/database/pictures/picture.model';
import { catchError, filter, first, map, switchMap, tap } from 'rxjs/operators';
import { AlbumId } from '@app/database/albums/album.model';
import { SongFacade } from '@app/database/songs/song.facade';
import { Song } from '@app/database/songs/song.model';
import { ArtistId } from '@app/database/artists/artist.model';
import { ArtistFacade } from '@app/database/artists/artist.facade';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { DatabaseService } from '@app/database/database.service';
import { upsertPicture } from '@app/database/pictures/picture.actions';
import { concatTap, tapError } from '@app/core/utils';
import { ResizerService } from '@app/scanner/resizer.service';
import {
  selectPictureByAlbum,
  selectPictureBySong,
  selectPicturesByArtist,
  selectPicturesLoaded,
} from '@app/database/pictures/picture.selectors';
import { uniq } from '@app/core/utils/uniq.util';
import { Playlist } from '@app/database/playlists/playlist.model';

export type PictureSize = 0 | 32 | 40 | 56 | 160 | 226 | 264 | 1100;

@Injectable()
export class PictureFacade {
  constructor(
    private store: Store,
    private songs: SongFacade,
    private artists: ArtistFacade,
    private albums: AlbumFacade,
    private database: DatabaseService,
    private resizer: ResizerService
  ) {}

  put(picture: Picture): Observable<IDBValidKey> {
    return this.database.db$.pipe(
      concatMap((db) => db.transaction$('pictures', 'readwrite')),
      concatMap((transaction) => transaction.objectStore$<Picture>('pictures')),
      concatMap((store) =>
        store.get$(picture.id).pipe(
          map((stored) =>
            stored
              ? {
                  ...stored,
                  sources: [...stored.sources, ...picture.sources].filter(
                    uniq((e) => e.height)
                  ),
                  entries: [...stored.entries, ...picture.entries].filter(
                    uniq()
                  ),
                  songs: [...stored.songs, ...picture.songs].filter(uniq()),
                  artists: [...stored.artists, ...picture.artists].filter(
                    uniq()
                  ),
                  albums: [...stored.albums, ...picture.albums].filter(uniq()),
                }
              : picture
          ),
          tap((updated) =>
            this.store.dispatch(upsertPicture({ picture: updated }))
          ),
          concatMap((updated) => store.put$(updated))
        )
      )
    );
  }

  getAlbumCover(
    albumId: AlbumId,
    size: PictureSize
  ): Observable<string | undefined> {
    return this.waitForPicturesLoaded().pipe(
      switchMap(() => this.store.select(selectPictureByAlbum(albumId))),
      first(),
      concatMap((picture) =>
        picture
          ? of(picture)
          : this.database
              .get$<Picture>('pictures', albumId, 'albums')
              .pipe(
                tap(
                  (p) => p && this.store.dispatch(upsertPicture({ picture: p }))
                )
              )
      ),
      this.getPictureBySize(size),
      tapError((err) => console.error(err)),
      catchError(() => of(undefined))
    );
  }

  getSongCover(song: Song, size: PictureSize): Observable<string | undefined> {
    return this.waitForPicturesLoaded().pipe(
      switchMap(() => this.store.select(selectPictureBySong(song.id))),
      first(),
      concatMap((picture) =>
        picture
          ? of(picture)
          : this.database
              .get$<Picture>('pictures', song.id, 'songs')
              .pipe(
                tap(
                  (p) => p && this.store.dispatch(upsertPicture({ picture: p }))
                )
              )
      ),
      this.getPictureBySize(size),
      tapError((err) => console.error(err)),
      catchError(() => of(undefined))
    );
  }

  getArtistCover(
    artistId: ArtistId,
    size: PictureSize
    // names = ['folder', 'cover', 'fanart']
  ): Observable<string | undefined> {
    return this.waitForPicturesLoaded().pipe(
      switchMap(() => this.store.select(selectPicturesByArtist(artistId))),
      first(),
      concatMap((pictures) =>
        pictures
          ? of(pictures[Math.floor(Math.random() * pictures.length)])
          : this.database
              .getAll$<Picture>('pictures', 'artists', artistId)
              .pipe(
                map((picts) => picts[Math.floor(Math.random() * picts.length)]),
                tap(
                  (p) => p && this.store.dispatch(upsertPicture({ picture: p }))
                )
              )
      ),
      this.getPictureBySize(size),
      tapError((err) => console.error(err)),
      catchError(() => of(undefined))
    );
  }

  getPlaylistCover(
    playlist: Playlist,
    size: PictureSize
  ): Observable<string | undefined> {
    return this.waitForPicturesLoaded().pipe(
      switchMap(() => {
        const albums = playlist.albums.filter(uniq());
        const artists = playlist.artists.filter(uniq());

        if (artists.length === 1 && albums.length > 1) {
          return this.getArtistCover(artists[0], size);
        } else if (albums.length > 0) {
          return this.getAlbumCover(albums[0], size);
        } else {
          return of(undefined);
        }
      })
    );
  }

  getCoverColor(
    cover: string
  ): Observable<[number, number, number] | undefined> {
    return from(import('node-vibrant')).pipe(
      concatMap((vibrant) => vibrant.default.from(cover).getPalette()),
      map((palette) => palette.Muted?.getRgb())
    );
  }

  // getArtistBanner(
  //   artist: Artist,
  //   size: number
  // ): Observable<string | undefined> {
  //   return this.getArtistCover(artist, size, ['fanart', 'folder']);
  // }

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

  private getPictureBySize = (size: PictureSize) =>
    concatMap(
      (picture: Picture | undefined) =>
        picture
          ? of(picture.sources.find((s) => s.height === size)?.src).pipe(
              concatMap((source) =>
                source
                  ? of(source)
                  : this.resizer
                      .resizeOne(picture, {
                        height: size,
                      })
                      .pipe(
                        concatTap((result) =>
                          this.database.db$.pipe(
                            concatMap((db) =>
                              db.transaction$('pictures', 'readwrite')
                            ),
                            concatMap((transaction) =>
                              transaction.objectStore$<Picture>('pictures')
                            ),
                            concatMap((store) =>
                              store.get$(picture.id).pipe(
                                filter((pict): pict is Picture => !!pict),
                                map((pict) => ({
                                  ...pict,
                                  sources: [...pict.sources, result].filter(
                                    (value, index, arr) =>
                                      arr.findIndex(
                                        (v) => v.height === value.height
                                      ) === index
                                  ),
                                })),
                                tap((p) =>
                                  this.store.dispatch(
                                    upsertPicture({ picture: p })
                                  )
                                ),
                                concatMap((pict: Picture) => store.put$(pict))
                              )
                            )
                          )
                        ),
                        map((result) => result.src)
                      )
              )
            )
          : of(undefined) // throwError(() => 'picture not found')
    );

  private waitForPicturesLoaded(): Observable<boolean> {
    return this.store
      .select(selectPicturesLoaded)
      .pipe(first((loaded) => loaded));
  }
}
