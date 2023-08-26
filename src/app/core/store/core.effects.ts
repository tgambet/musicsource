import { Injectable } from '@angular/core';
import { EffectNotification, OnRunEffects } from '@ngrx/effects';
import { Observable } from 'rxjs';

@Injectable()
export class CoreEffects implements OnRunEffects {
  /*scanToLibrary$: Observable<Action> = createEffect(() => this.actions$.pipe(
    ofType(parseEntriesSucceeded),
    concatMap(({results}) => {
      const treatResult = (result: ParseResult) => {

        const pict: Observable<string[]> = result.picture ? this.resizerService.resizeSquare(
          `data:${result.picture.format};base64,${result.picture.base64}`, [160, 32]
        ) : of([undefined, undefined]);

        return pict.pipe(
          map(([x160, x32]) => {
            const albumId = hash(`${result.albumArtist}|${result.album}`);

            const album: Album = {
              id: albumId,
              type: LibraryEntryType.ALBUM,
              name: result.album,
              artist: result.albumArtist,
              picture: x160
            };
            const artist: Artist = {
              id: hash(result.albumArtist),
              type: LibraryEntryType.ARTIST,
              name: result.albumArtist
            };
            const song: Song = {
              id: hash(`${result.albumArtist}|${result.album}|${result.title}`),
              type: LibraryEntryType.SONG,
              entry: result.entry,
              number: result.number,
              picture: x32,
              name: result.title,
              artist: result.artist,
              albumArtist: result.albumArtist,
              album: result.album,
              albumId,
              duration: result.duration
            };
            return {song, album, artist};
          })
        );
      };

      return concat(
        concat(...results.map(treatResult)).pipe(
          // concatAll(),
          reduce((all, {song, album, artist}) => ({
            songs: [...all.songs, song],
            albums: [...all.albums, album],
            artists: [...all.artists, artist],
          }),
          {
            songs: [],
            albums: [],
            artists: []
          }),
          map(all => {
            const uniq = (model, index, arr: any[]) => arr.findIndex(m => m.id === model.id) === index;
            const songs = all.songs.filter(uniq);
            const albums = all.albums.filter(uniq);
            const artists = all.artists.filter(uniq);
            return newLibraryEntries({songs, albums, artists});
          })
        ),
      );
    })
  ));*/

  /*saveToDB$ = createEffect(() => this.actions$.pipe(
    ofType(newLibraryEntries),
    concatMap(({songs, albums, artists}) =>
      this.storageService.execute(
        ['songs', 'albums', 'artists'],
        'readwrite',
        ...songs.map(song => this.storageService.put('songs', song, song.id)),
        ...albums.map(album => this.storageService.put('albums', album, album.id)),
        ...artists.map(artist => this.storageService.put('artists', artist, artist.id)),
      )/*.pipe(
        last(),
        map(() => scanLog({message: 'Successfully saved to database.', persist: true}))
      )
    ),
  ), {dispatch: false});*/

  // saveToLocalStorage$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(setSpotifyToken),
  //       tap(({ token, expiresAt }) => {
  //         localStorage.setItem('spotify_token', token);
  //         localStorage.setItem('spotify_expires_at', expiresAt.toString());
  //       })
  //     ),
  //   { dispatch: false }
  // );

  // loadToken$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(loadSpotifyToken),
  //     act({
  //       project: () => {
  //         const token = localStorage.getItem('spotify_token');
  //         const expiresAt = +localStorage.getItem('spotify_expires_at');
  //         return token && expiresAt
  //           ? of(loadSpotifyTokenSuccess({ token, expiresAt }))
  //           : throwError('No token in storage');
  //       },
  //       error: (error) => loadSpotifyTokenFailure({ error }),
  //     })
  //   )
  // );

  // getArtists$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(getArtists),
  //     act({
  //       project: () =>
  //         this.store.pipe(
  //           select(selectArtists),
  //           take(1),
  //           concatMap((artists) =>
  //             artists.map((artist) =>
  //               this.spotifyService.search(artist.name, 'artist').pipe(
  //                 concatMap((response: any) => {
  //                   const items = response.artists.items;
  //                   if (
  //                     items &&
  //                     items.length > 0 &&
  //                     items[0].name.toLowerCase() === artist.name.toLowerCase()
  //                   ) {
  //                     return this.resizerService
  //                       .resizeSquare(items[0].images[0].url, [56])
  //                       .pipe(
  //                         map(([x56]) =>
  //                           updateArtist({
  //                             update: {
  //                               id: artist.id,
  //                               changes: {
  //                                 name: items[0].name,
  //                                 images: items[0].images,
  //                                 thumbnail: x56,
  //                                 spotifyId: items[0].id,
  //                               },
  //                             },
  //                           })
  //                         )
  //                       );
  //                   } else {
  //                     return EMPTY; // TODO
  //                   }
  //                 })
  //               )
  //             )
  //           ),
  //           concatAll()
  //         ),
  //       error: () => getArtistsFailed(),
  //       complete: () => getArtistsSucceeded(),
  //     })
  //   )
  // );

  /*saveArtists$ = createEffect(() => this.actions$.pipe(
    ofType(getArtistsSucceeded),
    concatMap(() => this.store.pipe(
      select(selectArtists),
      take(1),
      concatMap(artists => this.storageService.execute(
        ['artists'],
        'readwrite',
        ...artists.map(artist => this.storageService.put('artists', artist, artist.id))
      )),
      last(),
      map(() => scanLog({message: 'Artists saved'}))
    ))
  ));*/

  // constructor() // private resizerService: ResizerService, // private actions$: Actions, // private appRef: ApplicationRef,
  // // private storageService: StorageService,
  // // private store: Store
  // {}

  ngrxOnRunEffects(
    resolvedEffects$: Observable<EffectNotification>,
  ): Observable<EffectNotification> {
    /*return this.appRef.isStable.pipe(
      first(isStable => isStable),
      concatMapTo(resolvedEffects$)
    );*/
    return resolvedEffects$;
  }
}
