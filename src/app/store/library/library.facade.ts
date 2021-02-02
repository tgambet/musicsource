import { Injectable } from '@angular/core';
import {
  DirectoryEntry,
  Entry,
  requestPermissionPromise,
} from '@app/models/entry.model';
import { EMPTY, from, Observable, of, Subject, throwError } from 'rxjs';
import { concatMap, filter, map, tap } from 'rxjs/operators';
import { StorageService } from '@app/services/storage.service';
import { Album, AlbumWithCover$ } from '@app/models/album.model';
import {
  Artist,
  ArtistWithCover,
  ArtistWithCover$,
} from '@app/models/artist.model';
import { getCover, Picture } from '@app/models/picture.model';
import { Song, SongWithCover$ } from '@app/models/song.model';
import { Playlist } from '@app/models/playlist.model';
import { hash } from '@app/utils/hash.util';
import { reduceArray } from '@app/utils/reduce-array.util';

@Injectable()
export class LibraryFacade {
  albums$: Observable<AlbumWithCover$> = this.storage
    .open$(['albums', 'pictures'])
    .pipe(
      concatMap((transaction) =>
        this.storage.walk$<Album>(transaction, 'albums').pipe(
          map(({ value }) => value),
          map((album) => ({
            ...album,
            cover$: album.pictureKey
              ? this.storage
                  .exec$<Picture>(
                    transaction.objectStore('pictures').get(album.pictureKey)
                  )
                  .pipe(
                    map((picture) => (picture ? getCover(picture) : undefined))
                  )
              : of(undefined),
          }))
        )
      )
    );

  artists$: Observable<ArtistWithCover> = this.storage
    .open$(['artists', 'pictures'])
    .pipe(
      concatMap((transaction) =>
        this.storage.walk$<Artist>(transaction, 'artists').pipe(
          map(({ value }) => value),
          concatMap((artist) =>
            artist.pictureKey
              ? this.storage
                  .exec$<Picture>(
                    transaction.objectStore('pictures').get(artist.pictureKey)
                  )
                  .pipe(
                    map((picture) => ({
                      ...artist,
                      cover: picture ? getCover(picture) : undefined,
                    }))
                  )
              : of(artist)
          )
        )
      )
    );

  private playlistsSubject: Subject<Playlist> = new Subject<Playlist>();

  constructor(private storage: StorageService) {}

  getAlbums(
    index?: string,
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection,
    predicate?: (_: Album) => boolean
  ): Observable<AlbumWithCover$> {
    return this.storage.open$(['albums', 'pictures']).pipe(
      concatMap((transaction) =>
        this.storage
          .walk$<Album>(
            transaction,
            'albums',
            index,
            query,
            direction || 'next',
            predicate
          )
          .pipe(
            map(({ value }) => value),
            map((album) => ({
              ...album,
              cover$: album.pictureKey
                ? this.storage
                    .exec$<Picture>(
                      transaction.objectStore('pictures').get(album.pictureKey)
                    )
                    .pipe(
                      map((picture) =>
                        picture ? getCover(picture) : undefined
                      )
                    )
                : of(undefined),
            }))
          )
      )
    );
  }

  getArtists(
    index?: string,
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection,
    predicate?: (_: Artist) => boolean
  ): Observable<ArtistWithCover$> {
    return this.storage.open$(['artists']).pipe(
      concatMap((transaction) =>
        this.storage
          .walk$<Artist>(
            transaction,
            'artists',
            index,
            query,
            direction || 'next',
            predicate
          )
          .pipe(
            map(({ value }) => value),
            map((artist) => ({
              ...artist,
              cover$: artist.pictureKey
                ? this.storage
                    .get$('pictures', artist.pictureKey)
                    .pipe(map((picture) => getCover(picture as Picture)))
                : EMPTY,
            }))
          )
      )
    );
  }

  getSong(entryPath: string): Observable<Song> {
    return this.storage
      .get$('songs', entryPath)
      .pipe(filter((s): s is Song => !!s));
  }

  getSongs(
    index?: string,
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection,
    predicate?: (song: Song) => boolean
  ): Observable<{
    value: SongWithCover$;
    key: IDBValidKey;
    primaryKey: IDBValidKey;
  }> {
    return this.storage.open$(['songs']).pipe(
      concatMap((transaction) =>
        this.storage
          .walk$<Song>(
            transaction,
            'songs',
            index,
            query,
            direction || 'next',
            predicate
          )
          .pipe(
            map(({ value: song, key, primaryKey }) => ({
              value: {
                ...song,
                cover$: song.pictureKey
                  ? this.storage
                      .get$('pictures', song.pictureKey)
                      .pipe(map((picture) => getCover(picture as Picture)))
                  : EMPTY,
              },
              key,
              primaryKey,
            }))
          )
      )
    );
  }

  getPlaylistSongs(playlist: Playlist): Observable<SongWithCover$> {
    return this.storage
      .getAllValues$<Song>([...playlist.songs].reverse(), 'songs')
      .pipe(
        map((song) => ({
          ...song,
          cover$: song.pictureKey
            ? this.storage
                .get$('pictures', song.pictureKey)
                .pipe(map((picture) => getCover(picture as Picture)))
            : EMPTY,
        }))
      );
  }

  getEntry = (path: string): Observable<Entry | undefined> =>
    this.storage.get$('entries', path);

  getRootEntry(): Observable<Entry | undefined> {
    return this.storage
      .open$(['entries'])
      .pipe(
        concatMap((t) =>
          this.storage.find$<Entry>(
            t,
            'entries',
            (entry) => entry.parent === undefined
          )
        )
      );
  }

  getChildrenEntries = (directory: DirectoryEntry): Observable<Entry[]> =>
    this.storage.open$(['entries']).pipe(
      this.storage.exec<Entry[]>((t) =>
        t.objectStore('entries').index('parents').getAll(directory.path)
      )
    );

  getArtist = (name: string): Observable<Artist | undefined> =>
    this.storage.get$('artists', name);

  getArtistByHash = (h: string): Observable<Artist | undefined> =>
    this.storage.get$('artists', h, 'hash');

  getAlbum = (title: string): Observable<Album | undefined> =>
    this.storage.get$('albums', title);

  getAlbumByHash = (h: string): Observable<Album | undefined> =>
    this.storage.get$('albums', h, 'hash');

  getPicture = (id: IDBValidKey | undefined): Observable<Picture | undefined> =>
    id ? this.storage.get$('pictures', id) : of(undefined);

  getCover(
    pictureKey: IDBValidKey | undefined
  ): Observable<string | undefined> {
    return this.getPicture(pictureKey).pipe(
      map((picture) => (picture ? getCover(picture) : undefined))
    );
  }

  getAlbumTitles = (album: Album): Observable<SongWithCover$> =>
    this.getSongs('album', album.name).pipe(map(({ value }) => value));

  getAlbumTracks = (album: Album): Observable<SongWithCover$[]> =>
    this.getAlbumTitles(album).pipe(
      reduceArray(),
      map((songs) =>
        songs.sort((s1, s2) => (s1.track.no || 0) - (s2.track.no || 0))
      )
    );

  getArtistAlbums(artist: Artist): Observable<AlbumWithCover$> {
    return this.storage.open$(['albums', 'pictures']).pipe(
      concatMap((transaction) =>
        this.storage
          .walk$<Album>(transaction, 'albums', 'albumArtist', artist.name)
          .pipe(
            map(({ value }) => value),
            map((album) => ({
              ...album,
              cover$: album.pictureKey
                ? this.storage
                    .exec$<Picture>(
                      transaction.objectStore('pictures').get(album.pictureKey)
                    )
                    .pipe(
                      map((picture) =>
                        picture ? getCover(picture) : undefined
                      )
                    )
                : of(undefined),
            }))
          )
      )
    );
  }

  getAlbumsWithArtist(artist: Artist): Observable<AlbumWithCover$> {
    return this.storage.open$(['albums', 'pictures']).pipe(
      concatMap((transaction) =>
        this.storage
          .walk$<Album>(
            transaction,
            'albums',
            'artists',
            artist.name,
            'next',
            (album) => album.albumArtist !== artist.name
          )
          .pipe(
            map(({ value }) => value),
            map((album) => ({
              ...album,
              cover$: album.pictureKey
                ? this.storage
                    .exec$<Picture>(
                      transaction.objectStore('pictures').get(album.pictureKey)
                    )
                    .pipe(
                      map((picture) =>
                        picture ? getCover(picture) : undefined
                      )
                    )
                : of(undefined),
            }))
          )
      )
    );
  }

  getArtistTitles(artist: Artist): Observable<SongWithCover$> {
    return this.getSongs('artists', artist.name).pipe(
      map(({ value }) => value)
    );
  }

  requestPermission(handle: FileSystemHandle): Observable<void> {
    return from(requestPermissionPromise(handle)).pipe(
      concatMap((perm) => (perm ? of(void 0) : throwError('Permission denied')))
    );
  }

  toggleSongFavorite(song: Song): Observable<Song> {
    const update = { likedOn: !!song.likedOn ? undefined : new Date() };
    return this.storage.update$<Song>('songs', update, song.entryPath).pipe(
      map(() => ({
        ...song,
        ...update,
      }))
    );
  }

  toggleLikedAlbum(album: Album): Observable<Album> {
    const update = { likedOn: !!album.likedOn ? undefined : new Date() };
    return this.storage.update$<Album>('albums', update, album.name).pipe(
      map(() => ({
        ...album,
        ...update,
      }))
    );
  }

  toggleArtistFavorite(artist: Artist): Observable<void> {
    return this.storage
      .update$<Artist>(
        'artists',
        { likedOn: !!artist.likedOn ? undefined : new Date() },
        artist.name
      )
      .pipe(map(() => void 0));
  }

  getPlaylist(title: string): Observable<Playlist | undefined> {
    return this.storage.get$<Playlist>('playlists', title, 'title');
  }

  getPlaylists(
    index?: string,
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection,
    predicate?: (playlist: Playlist) => boolean
  ): Observable<Playlist> {
    return this.storage.open$(['playlists']).pipe(
      concatMap((t) =>
        this.storage.walk$<Playlist>(
          t,
          'playlists',
          index,
          query,
          direction,
          predicate
        )
      ),
      map(({ value }) => value)
    );
  }

  getNewlyCreatedPlaylists(): Observable<Playlist> {
    return this.playlistsSubject.asObservable();
  }

  createPlaylist(
    partial: Pick<Playlist, 'title' | 'description'>
  ): Observable<IDBValidKey> {
    const playlist: Playlist = {
      songs: [],
      createdOn: new Date(),
      hash: hash(partial.title),
      ...partial,
    };
    return this.storage
      .add$('playlists', playlist)
      .pipe(tap(() => this.playlistsSubject.next(playlist)));
  }

  // createTempPlaylist(songs: Song[]): Observable<IDBValidKey> {
  //   const playlist: TempPlaylist = {
  //     songs: songs.map((s) => s.entryPath),
  //     createdOn: new Date(),
  //     hash: hash(new Date().toISOString()),
  //   };
  //   return this.storage.add$('playlists', playlist);
  // }

  togglePlaylistFavorite(playlist: Playlist): Observable<void> {
    return this.storage
      .update$<Playlist>(
        'playlists',
        { likedOn: !!playlist.likedOn ? undefined : new Date() },
        playlist.hash
      )
      .pipe(map(() => void 0));
  }

  addSongsToPlaylist(songs: Song[], title: string) {
    return this.storage.get$('playlists', title, 'title').pipe(
      filter((playlist): playlist is Playlist => !!playlist),
      concatMap((playlist) =>
        this.storage.update$(
          'playlists',
          {
            songs: [...playlist.songs, ...songs.map((song) => song.entryPath)],
            pictureKey:
              playlist.pictureKey ||
              songs.find((song) => song.pictureKey)?.pictureKey,
          },
          playlist.hash
        )
      )
    );
  }

  getPlaylistByHash(h: string): Observable<Playlist | undefined> {
    return this.storage.get$<Playlist>('playlists', h);
  }
}
