// import {
//   ChangeDetectionStrategy,
//   Component,
//   HostListener,
//   OnInit,
// } from '@angular/core';
// import { HistoryService } from '@app/core/services/history.service';
// import { merge, Observable } from 'rxjs';
// import { map, take } from 'rxjs/operators';
// import { Album } from '@app/database/albums/album.model';
// import { Artist } from '@app/database/artists/artist.model';
// import { scanArray } from '@app/core/utils/scan-array.util';
// import { WithTrigger } from '@app/core/classes/with-trigger';
// import { SetRequired } from 'type-fest';
//
// export type HistoryItem =
//   | (SetRequired<Artist, 'listenedOn'> & { t: 'artist' })
//   | (SetRequired<Album, 'listenedOn'> & { t: 'album' });
//
// @Component({
//   selector: 'app-recent-activity',
//   template: `
//     <div class="container" *ngIf="a$ | async as a">
//       <ng-container *ngIf="a.length > 0">
//         <app-title size="small">Recent activity</app-title>
//         <app-h-list buttonsTopPosition="80px">
//           <div class="item" appHListItem *ngFor="let item of a">
//             <app-album
//               *ngIf="item.t === 'album'"
//               [album]="item"
//               size="small"
//               (menuOpened)="menuOpened($event)"
//             ></app-album>
//             <app-artist
//               *ngIf="item.t === 'artist'"
//               [artist]="item"
//             ></app-artist>
//           </div>
//         </app-h-list>
//       </ng-container>
//     </div>
//   `,
//   styles: [
//     `
//       :host {
//         display: block;
//       }
//       .container {
//         margin-top: 32px;
//         /* margin-bottom: 80px; */
//         min-height: 291px;
//       }
//       app-title {
//         margin-bottom: 16px;
//       }
//       .item {
//         margin: 0 24px 0 0;
//         width: 160px;
//       }
//       .item:last-child {
//         margin-right: 0;
//       }
//     `,
//   ],
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class RecentActivityComponent extends WithTrigger implements OnInit {
//   a$!: Observable<HistoryItem[]>;
//
//   constructor(private history: HistoryService) {
//     super();
//   }
//
//   @HostListener('window:scroll')
//   @HostListener('click')
//   closeMenu(): void {
//     super.closeMenu();
//   }
//
//   ngOnInit(): void {
//     this.a$ = merge(
//       this.history.latestPlayedAlbums$().pipe(
//         take(20),
//         map((m) => ({ ...m, t: 'album' } as HistoryItem))
//       ),
//       this.history.latestPlayedArtists$().pipe(
//         take(20),
//         map((m) => ({ ...m, t: 'artist' } as HistoryItem))
//       )
//     ).pipe(
//       scanArray(),
//       map((r) => r.sort((i1, i2) => i2.listenedOn - i1.listenedOn)),
//       map((r) => r.slice(0, 20))
//     );
//   }
// }
