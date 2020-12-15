import { Injectable } from '@angular/core';
import { EffectNotification, OnRunEffects } from '@ngrx/effects';
import { Observable } from 'rxjs';

@Injectable()
export class LibraryEffects implements OnRunEffects {
  // loadLibrary$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(loadLibrary),
  //     concatMap(() =>
  //       this.storageService
  //         .execute<any[]>(
  //           ['songs', 'albums', 'artists', 'covers'],
  //           'readonly',
  //           this.storageService.getAll<Song>('songs'),
  //           this.storageService.getAll<Album>('albums'),
  //           this.storageService.getAll<Artist>('artists'),
  //           this.storageService.getAll<Cover>('covers')
  //         )
  //         .pipe(
  //           reduce(
  //             (result: any, models, index) => {
  //               switch (index) {
  //                 case 0:
  //                   return {
  //                     ...result,
  //                     songs: models,
  //                   };
  //                 case 1:
  //                   return {
  //                     ...result,
  //                     albums: models,
  //                   };
  //                 case 2:
  //                   return {
  //                     ...result,
  //                     artists: models,
  //                   };
  //                 case 3:
  //                   return {
  //                     ...result,
  //                     covers: models,
  //                   };
  //               }
  //             },
  //             {
  //               songs: [] as Song[],
  //               albums: [] as Album[],
  //               artists: [] as Artist[],
  //               covers: [] as Cover[],
  //             }
  //           ),
  //           map((result) =>
  //             loadLibrarySuccess({
  //               folders: [],
  //               songs: result.songs,
  //               albums: result.albums,
  //               artists: result.artists,
  //               covers: result.covers,
  //             })
  //           )
  //         )
  //     )
  //   )
  // );

  constructor() // private store: Store, // private actions$: Actions, // private appRef: ApplicationRef,
  // private storageService: StorageService,
  // private files: FileService
  {}

  ngrxOnRunEffects(
    resolvedEffects$: Observable<EffectNotification>
  ): Observable<EffectNotification> {
    /*return this.appRef.isStable.pipe(
      first(isStable => isStable),
      concatMapTo(resolvedEffects$)
    );*/
    return resolvedEffects$;
  }
}
