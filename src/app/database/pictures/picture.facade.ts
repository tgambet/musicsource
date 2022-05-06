import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { concatMap, Observable, of } from 'rxjs';
import { Picture } from '@app/database/pictures/picture.model';
import { catchError, filter, first, map, tap } from 'rxjs/operators';
import { Album } from '@app/database/albums/album.model';
import { SongFacade } from '@app/database/songs/song.facade';
import { Song } from '@app/database/songs/song.model';
import { Artist } from '@app/database/artists/artist.model';
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
} from '@app/database/pictures/picture.selectors';

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
          tap((updated) =>
            this.store.dispatch(upsertPicture({ picture: updated }))
          ),
          concatMap((updated) => store.put$(updated))
        )
      )
    );
  }

  // -------------------------------------------------------

  /**
   * Get cover from folder or first song that has a picture
   */
  getAlbumCover(album: Album, size: number): Observable<string | undefined> {
    return this.store.select(selectPictureByAlbum(album.id)).pipe(
      first(),
      concatMap((picture) =>
        picture
          ? of(picture)
          : this.database
              .get$<Picture>('pictures', album.id, 'albums')
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

  getSongCover(song: Song, size: number): Observable<string | undefined> {
    return this.store.select(selectPictureBySong(song.entryPath)).pipe(
      first(),
      concatMap((picture) =>
        picture
          ? of(picture)
          : this.database
              .get$<Picture>('pictures', song.entryPath, 'songs')
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
    artist: Artist,
    size: number
    // names = ['folder', 'cover', 'fanart']
  ): Observable<string | undefined> {
    return this.store.select(selectPicturesByArtist(artist.id)).pipe(
      first(),
      concatMap((pictures) =>
        pictures
          ? of(pictures[Math.floor(Math.random() * pictures.length)])
          : this.database
              .getAll$<Picture>('pictures', 'artists', artist.id)
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

  private getPictureBySize = (size: number) =>
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
}
