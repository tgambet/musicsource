// import { Injectable } from '@angular/core';
// import { AudioService } from '@app/services/audio.service';
// import { Album } from '@app/models/album.model';
// import { LibraryFacade } from '@app/store/library/library.facade';
// import { concatMap, filter, map, take, tap } from 'rxjs/operators';
// import { SongWithCover$ } from '@app/models/song.model';
// import { Router } from '@angular/router';
// import { combineLatest, Observable, ReplaySubject, Subject } from 'rxjs';
// import { FileEntry } from '@app/models/entry.model';
// import { reduceArray } from '@app/utils/reduceArray.util';
//
// @Injectable({
//   providedIn: 'root',
// })
// export class PlayerService {
//   songs$: Subject<SongWithCover$[]> = new ReplaySubject(1);
//   currentSong$: Subject<SongWithCover$> = new ReplaySubject(1);
//
//   // https://bugs.chromium.org/p/chromium/issues/detail?id=1146886&q=component%3ABlink%3EStorage%3EFileSystem&can=2
//   private handle?: any;
//
//   constructor(
//     private audio: AudioService,
//     private library: LibraryFacade,
//     private router: Router
//   ) {}
//
//   getDuration$() {
//     return this.audio.duration$.asObservable();
//   }
//
//   getTimeUpdate$() {
//     return this.audio.timeUpdate$.asObservable();
//   }
//
//   getPlaying$() {
//     return this.audio.playing$.asObservable();
//   }
//
//   seek(n: number) {
//     this.audio.seek(n);
//   }
//
//   playAlbum(album: Album) {
//     return this.library.getAlbumTitles(album).pipe(
//       reduceArray(),
//       tap((songs) => this.songs$.next(songs)),
//       tap(() =>
//         this.router.navigate(
//           ['/', { outlets: { player: ['album', album.hash] } }],
//           { replaceUrl: true }
//         )
//       ),
//       filter(
//         (songs): songs is [SongWithCover$, ...SongWithCover$[]] =>
//           songs.length > 0
//       ),
//       tap((songs) => this.currentSong$.next(songs[0])),
//       concatMap((songs) => this.playSong(songs[0]))
//     );
//   }
//
//   playNextSong() {
//     return combineLatest([this.songs$, this.currentSong$]).pipe(
//       take(1),
//       map(([songs, currentSong]) => {
//         const currentIndex = songs.indexOf(currentSong);
//         return songs[currentIndex + 1];
//       }),
//       filter((nextSong) => !!nextSong),
//       tap((nextSong) => this.currentSong$.next(nextSong)),
//       concatMap((nextSong) => this.playSong(nextSong))
//     );
//   }
//
//   playPreviousSong() {
//     return combineLatest([this.songs$, this.currentSong$]).pipe(
//       take(1),
//       map(([songs, currentSong]) => {
//         const currentIndex = songs.indexOf(currentSong);
//         return songs[currentIndex - 1];
//       }),
//       filter((nextSong) => !!nextSong),
//       tap((nextSong) => this.currentSong$.next(nextSong)),
//       concatMap((nextSong) => this.playSong(nextSong))
//     );
//   }
//
//   playIndex(index: number) {
//     return this.songs$.pipe(
//       take(1),
//       map((songs) => songs[index]),
//       filter((nextSong) => !!nextSong),
//       tap((nextSong) => this.currentSong$.next(nextSong)),
//       concatMap((nextSong) => this.playSong(nextSong))
//     );
//   }
//
//   hasNextSong(): Observable<boolean> {
//     return combineLatest([this.songs$, this.currentSong$]).pipe(
//       map(([songs, currentSong]) => {
//         const currentIndex = songs.indexOf(currentSong);
//         return !!songs[currentIndex + 1];
//       })
//     );
//   }
//
//   hasCurrentSong(): Observable<boolean> {
//     return this.currentSong$.pipe(map((currentSong) => !!currentSong));
//   }
//
//   hasPreviousSong(): Observable<boolean> {
//     return combineLatest([this.songs$, this.currentSong$]).pipe(
//       map(([songs, currentSong]) => {
//         const currentIndex = songs.indexOf(currentSong);
//         return !!songs[currentIndex - 1];
//       })
//     );
//   }
//
//   pause(): void {
//     this.audio.pause();
//   }
//
//   async resume() {
//     if (this.handle) {
//       await this.library.requestPermission(this.handle).toPromise();
//       const file = await this.handle.getFile();
//       await this.audio.resume();
//     } else {
//       await this.playCurrent();
//     }
//   }
//
//   async playCurrent() {
//     console.log('current');
//     const song = await this.currentSong$
//       .asObservable()
//       .pipe(take(1))
//       .toPromise();
//     await this.playSong(song).toPromise();
//     await this.resume();
//   }
//
//   setCurrentSong(song: SongWithCover$): void {
//     this.currentSong$.next(song);
//   }
//
//   setSongs(songs: SongWithCover$[]): void {
//     this.songs$.next(songs);
//   }
//
//   private playSong(song: SongWithCover$) {
//     return this.library.getEntry(song.entryPath).pipe(
//       filter((entry): entry is FileEntry => !!entry),
//       tap((entry) => (this.handle = entry.handle)),
//       concatMap((entry) =>
//         this.library.requestPermission(entry.handle).pipe(
//           concatMap(() => entry.handle.getFile()),
//           concatMap((file) => this.audio.setSrc(file))
//         )
//       )
//     );
//   }
// }
