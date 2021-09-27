// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { Store } from '@ngrx/store';
// import { selectSpotifyToken } from '@app/store/core.selectors';
// import { concatMap, filter, take } from 'rxjs/operators';
//
// @Injectable({
//   providedIn: 'root',
// })
// export class SpotifyService {
//   constructor(private http: HttpClient, private store: Store) {}
//
//   search(query: string, type: string): Observable<object> {
//     return this.store.select(selectSpotifyToken).pipe(
//       take(1),
//       filter((token) => token !== null),
//       concatMap((token) =>
//         this.http.get('https://api.spotify.com/v1/search', {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           params: {
//             q: query,
//             type,
//           },
//           observe: 'body',
//           responseType: 'json',
//         })
//       )
//     );
//   }
// }
