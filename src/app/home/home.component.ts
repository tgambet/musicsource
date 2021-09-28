// import { ChangeDetectionStrategy, Component } from '@angular/core';
// import { EMPTY, Observable } from 'rxjs';
// import { AlbumWithCover$ } from '@app/database/album.model';
// import { hash } from '@app/core/utils/hash.util';
//
// @Component({
//   selector: 'app-home',
//   template: `
//     <app-container-home>
//       <app-title>Albums</app-title>
//       <app-h-list buttonsTopPosition="113px">
//         <div class="album" appHListItem *ngFor="let album of albums$ | async">
//           <app-album [album]="album"></app-album>
//         </div>
//       </app-h-list>
//       <app-title>Artists</app-title>
//       <app-h-list buttonsTopPosition="113px">
//         <div
//           class="artist"
//           appHListItem
//           *ngFor="let artist of artists$ | async"
//         >
//           <app-artist
//             [name]="artist.name"
//             [cover]="artist.cover"
//             [artistRouterLink]="['/', 'artist', artist.hash]"
//           ></app-artist>
//         </div>
//       </app-h-list>
//     </app-container-home>
//   `,
//   styles: [
//     `
//       :host {
//         display: block;
//         padding: 32px 0;
//       }
//       .album,
//       .artist {
//         margin: 0 24px 0 0;
//         width: 226px;
//       }
//       .album:last-child,
//       .artist:last-child {
//         margin-right: 0;
//       }
//       app-title {
//         margin-bottom: 40px;
//       }
//       app-h-list {
//         margin: 0 0;
//         min-height: 320px;
//       }
//     `,
//   ],
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class HomeComponent {
//   albums$: Observable<AlbumWithCover$[]> = EMPTY;
//
//   artists$ = EMPTY;
//
//   getHash(albumArtist: string): string {
//     return hash(albumArtist);
//   }
// }
