import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatabaseService } from '@app/database/database.service';
import { Artist } from '@app/database/artists/artist.model';
import { Song } from '@app/database/songs/song.model';

@Injectable()
export class LibraryFacade {
  // private playlistsSubject: Subject<Playlist> = new Subject<Playlist>();

  constructor(private storage: DatabaseService) {}
  //
  // getAlbums(
  //   index?: string,
  //   query?: IDBValidKey | IDBKeyRange | null,
  //   direction?: IDBCursorDirection,
  //   predicate?: (_: Album) => boolean
  // ): Observable<Album> {
  //   return this.storage
  //     .walk$<Album>('albums', index, query, direction || 'next', predicate)
  //     .pipe(map(({ value }) => value));
  // }
  //
  // getArtists(
  //   index?: string,
  //   query?: IDBValidKey | IDBKeyRange | null,
  //   direction?: IDBCursorDirection,
  //   predicate?: (_: Artist) => boolean
  // ): Observable<Artist> {
  //   return this.storage
  //     .walk$<Artist>('artists', index, query, direction || 'next', predicate)
  //     .pipe(map(({ value }) => value));
  // }

  // getSong(entryPath: string): Observable<Song> {
  //   return this.storage
  //     .get$('songs', entryPath)
  //     .pipe(filter((s): s is Song => !!s));
  // }

  getSongs(
    index?: string,
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection,
    predicate?: (song: Song) => boolean
  ): Observable<{
    value: Song;
    key: IDBValidKey;
    primaryKey: IDBValidKey;
  }> {
    return this.storage.walk$<Song>(
      'songs',
      index,
      query,
      direction || 'next',
      predicate
    );
  }

  // getPlaylistSongs(playlist: Playlist): Observable<Song> {
  //   return this.storage.getAllValues$<Song>(
  //     [...playlist.songs].reverse(),
  //     'songs'
  //   );
  // }

  // getEntry = (path: string): Observable<Entry | undefined> =>
  //   this.storage.get$('entries', path);

  // getRootEntry(): Observable<Entry | undefined> {
  //   return this.storage
  //     .open$(['entries'])
  //     .pipe(
  //       concatMap((t) =>
  //         this.storage.find$<Entry>(
  //           t,
  //           'entries',
  //           (entry) => entry.parent === undefined
  //         )
  //       )
  //     );
  // }

  // getChildrenEntries = (directory: DirectoryEntry): Observable<Entry[]> =>
  //   this.storage.open$(['entries']).pipe(
  //     this.storage.exec<Entry[]>((t) =>
  //       t.objectStore('entries').index('parents').getAll(directory.path)
  //     )
  //   );

  // getArtist = (name: string): Observable<Artist | undefined> =>
  //   this.storage.get$('artists', name);

  // getArtistByHash = (h: string): Observable<Artist | undefined> =>
  //   this.storage.get$('artists', h);

  // getAlbum = (title: string): Observable<Album | undefined> =>
  //   this.storage.get$('albums', title);

  // getAlbumByHash = (h: string): Observable<Album | undefined> =>
  //   this.storage.get$('albums', h);

  // getPicture = (id: IDBValidKey | undefined): Observable<Picture | undefined> =>
  //   id
  //     ? this.pictures
  //         .getByHash(id as string)
  //         .pipe
  //         //filter((p) => !!p)
  //         // first(),
  //         // concatMap((p) =>
  //         //   p
  //         //     ? concat(of(p), this.pictures.getByHash(id as string))
  //         //     : concat(
  //         //         this.storage.get$<Picture>('pictures', id),
  //         //         this.pictures
  //         //           .getByHash(id as string)
  //         //           .pipe(filter((p2) => !!p2))
  //         //       )
  //         // )
  //         ()
  //     : // race<[Picture | undefined, Picture | undefined]>(
  //       //     this.pictures.getByHash(id as string).pipe(filter((p) => !!p)),
  //       //     this.storage.get$<Picture>('pictures', id)
  //       //   ).pipe(first())
  //       of(undefined);

  // getCover(
  //   pictureKey: IDBValidKey | undefined
  // ): Observable<string | undefined> {
  //   return this.getPicture(pictureKey).pipe(
  //     map((picture) => (picture ? getCover(picture) : undefined))
  //   );
  // }

  // getAlbumTitles = (album: Album): Observable<Song> =>
  //   this.getSongs('albumHash', album.hash).pipe(map(({ value }) => value));
  //
  // getAlbumTracks = (album: Album): Observable<Song[]> =>
  //   this.getAlbumTitles(album).pipe(
  //     toArray(),
  //     map((songs) =>
  //       songs.sort((s1, s2) => (s1.track.no || 0) - (s2.track.no || 0))
  //     )
  //   );

  // getArtistAlbums(artist: Artist): Observable<Album> {
  //   return this.storage
  //     .walk$<Album>('albums', 'albumArtist', artist.name)
  //     .pipe(map(({ value }) => value));
  // }

  // getAlbumsWithArtist(artist: Artist): Observable<Album> {
  //   return this.storage
  //     .walk$<Album>(
  //       'albums',
  //       'artists',
  //       artist.name,
  //       'next',
  //       (album) => album.albumArtist !== artist.name
  //     )
  //     .pipe(map(({ value }) => value));
  // }

  getArtistTitles(artist: Artist): Observable<Song> {
    return this.getSongs('artists', artist.name).pipe(
      map(({ value }) => value)
    );
  }

  // requestPermission(handle: FileSystemHandle): Observable<void> {
  //   return from(requestPermissionPromise(handle)).pipe(
  //     concatMap((perm) =>
  //       perm ? of(void 0) : throwError(() => 'Permission denied')
  //     )
  //   );
  // }

  // toggleSongFavorite(song: Song): Observable<Song> {
  //   const update = { likedOn: !!song.likedOn ? undefined : new Date() };
  //   return this.storage.update$<Song>('songs', update, song.entryPath).pipe(
  //     map(() => ({
  //       ...song,
  //       ...update,
  //     }))
  //   );
  // }

  // toggleLikedAlbum(album: Album): void {
  //   const update = { likedOn: !!album.likedOn ? undefined : new Date() };
  //   return this.albums.update({ key: album.hash, changes: update });
  //   // return this.storage.update$<Album>('albums', update, album.name).pipe(
  //   //   map(() => ({
  //   //     ...album,
  //   //     ...update,
  //   //   }))
  //   // );
  // }

  // toggleArtistFavorite(artist: Artist): void {
  //   const update = { likedOn: !!artist.likedOn ? undefined : new Date() };
  //   return this.artists.update({ key: artist.hash, changes: update });
  //
  //   // return this.storage
  //   //   .update$<Artist>(
  //   //     'artists',
  //   //     { likedOn: !!artist.likedOn ? undefined : new Date() },
  //   //     artist.name
  //   //   )
  //   //   .pipe(map(() => void 0));
  // }

  // getPlaylist(title: string): Observable<Playlist | undefined> {
  //   return this.storage.get$<Playlist>('playlists', title, 'title');
  // }

  // getPlaylists(
  //   index?: string,
  //   query?: IDBValidKey | IDBKeyRange | null,
  //   direction?: IDBCursorDirection,
  //   predicate?: (playlist: Playlist) => boolean
  // ): Observable<Playlist> {
  //   return this.storage
  //     .walk$<Playlist>('playlists', index, query, direction, predicate)
  //     .pipe(map(({ value }) => value));
  // }

  // getNewlyCreatedPlaylists(): Observable<Playlist> {
  //   return this.playlistsSubject.asObservable();
  // }

  // createPlaylist(
  //   partial: Pick<Playlist, 'title' | 'description'>
  // ): Observable<IDBValidKey> {
  //   const playlist: Playlist = {
  //     songs: [],
  //     createdOn: new Date(),
  //     hash: hash(partial.title),
  //     ...partial,
  //   };
  //   return this.storage.add$<Playlist>('playlists', playlist).pipe(
  //     tap({
  //       next: (key) => console.log(key),
  //       error: (err) => console.log(err),
  //     })
  //   );
  //   // .pipe(tap(() => this.playlistsSubject.next(playlist)));
  // }

  // createTempPlaylist(songs: Song[]): Observable<IDBValidKey> {
  //   const playlist: TempPlaylist = {
  //     songs: songs.map((s) => s.entryPath),
  //     createdOn: new Date(),
  //     hash: hash(new Date().toISOString()),
  //   };
  //   return this.storage.add$('playlists', playlist);
  // }

  // togglePlaylistFavorite(playlist: Playlist): Observable<void> {
  //   return this.storage
  //     .update$<Playlist>(
  //       'playlists',
  //       { likedOn: !!playlist.likedOn ? undefined : new Date() },
  //       playlist.hash
  //     )
  //     .pipe(map(() => void 0));
  // }

  // addSongsToPlaylist(songs: Song[], title: string): Observable<IDBValidKey> {
  //   return this.storage.get$('playlists', title, 'title').pipe(
  //     filter((playlist): playlist is Playlist => !!playlist),
  //     concatMap((playlist) =>
  //       this.storage.update$(
  //         'playlists',
  //         {
  //           songs: [...playlist.songs, ...songs.map((song) => song.entryPath)],
  //           pictureKey:
  //             playlist.pictureKey ||
  //             songs.find((song) => song.pictureKey)?.pictureKey,
  //         },
  //         playlist.hash
  //       )
  //     )
  //   );
  // }

  // getPlaylistByHash(h: string): Observable<Playlist | undefined> {
  //   return this.storage.get$<Playlist>('playlists', h);
  // }
}
