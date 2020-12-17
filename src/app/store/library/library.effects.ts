import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  EffectNotification,
  ofType,
  OnRunEffects,
} from '@ngrx/effects';
import { Observable } from 'rxjs';
import { StorageService } from '@app/services/storage.service';
import { Store } from '@ngrx/store';
import {
  loadEntries,
  loadPictures,
  loadSongs,
  setEntries,
  setPictures,
  setSongs,
} from '@app/store/library/library.actions';
import { concatMapTo, map } from 'rxjs/operators';
import { Entry } from '@app/utils/entry.util';
import { Picture, Song } from '@app/services/extractor.service';

@Injectable()
export class LibraryEffects implements OnRunEffects {
  loadEntries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadEntries),
      concatMapTo(this.storageService.getDb()),
      this.storageService.openTransaction(['entries']),
      this.storageService.getAll<Entry>('entries'),
      map((entries) => setEntries({ entries }))
    )
  );

  loadSongs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSongs),
      concatMapTo(this.storageService.getDb()),
      this.storageService.openTransaction(['songs']),
      this.storageService.getAll<Song>('songs'),
      map((songs) => setSongs({ songs }))
    )
  );

  loadPictures$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPictures),
      concatMapTo(this.storageService.getDb()),
      this.storageService.openTransaction(['pictures']),
      this.storageService.getAll<Picture>('pictures'),
      map((pictures) => setPictures({ pictures }))
    )
  );

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

  constructor(
    private store: Store,
    private actions$: Actions, // private appRef: ApplicationRef,
    private storageService: StorageService
  ) {}

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
