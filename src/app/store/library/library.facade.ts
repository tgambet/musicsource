import { Injectable } from '@angular/core';
import { DirectoryEntry, Entry } from '@app/models/entry.model';
import { EMPTY, from, Observable, of, Subject, throwError } from 'rxjs';
import { concatMap, map, tap } from 'rxjs/operators';
import { StorageService } from '@app/services/storage.service';
import { Album, AlbumWithCover } from '@app/models/album.model';
import {
  Artist,
  ArtistWithCover,
  ArtistWithCover$,
} from '@app/models/artist.model';
import { getCover, Picture } from '@app/models/picture.model';
import { Song, SongWithCover$ } from '@app/models/song.model';
import { Playlist } from '@app/models/playlist.model';

@Injectable()
export class LibraryFacade {
  albums$: Observable<AlbumWithCover> = this.storage
    .open$(['albums', 'pictures'])
    .pipe(
      concatMap((transaction) =>
        this.storage.walk$<Album>(transaction, 'albums').pipe(
          map(({ value }) => value),
          concatMap((album) =>
            album.pictureKey
              ? this.storage
                  .exec$<Picture>(
                    transaction.objectStore('pictures').get(album.pictureKey)
                  )
                  .pipe(
                    map((picture) => ({
                      ...album,
                      cover: picture ? getCover(picture) : undefined,
                    }))
                  )
              : of(album)
          )
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
    direction: IDBCursorDirection = 'next'
  ): Observable<AlbumWithCover> {
    return this.storage.open$(['albums', 'pictures']).pipe(
      concatMap((transaction) =>
        this.storage
          .walk$<Album>(transaction, 'albums', index, query, direction)
          .pipe(
            map(({ value }) => value),
            concatMap((album) =>
              album.pictureKey
                ? this.storage
                    .exec$<Picture>(
                      transaction.objectStore('pictures').get(album.pictureKey)
                    )
                    .pipe(
                      map((picture) => ({
                        ...album,
                        cover: picture ? getCover(picture) : undefined,
                      }))
                    )
                : of(album)
            )
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

  getArtistByHash = (hash: string): Observable<Artist | undefined> =>
    this.storage.get$('artists', hash, 'hash');

  getAlbum = (id: string): Observable<Album | undefined> =>
    this.storage.get$('albums', id);

  getAlbumByHash = (hash: string): Observable<Album | undefined> =>
    this.storage.get$('albums', hash, 'hash');

  getPicture = (id: IDBValidKey | undefined): Observable<Picture | undefined> =>
    id ? this.storage.get$('pictures', id) : of(undefined);

  getAlbumTitles = (album: Album): Observable<Song> =>
    this.storage.open$(['songs']).pipe(
      concatMap((t) =>
        this.storage.walk$<Song>(t, 'songs', 'album', album.name)
      ),
      map(({ value }) => value)
      // filter(
      //   (song) =>
      //     song.albumartist === album.artist || song.artist === album.artist
      // )
    );

  getArtistAlbums(artist: Artist): Observable<AlbumWithCover> {
    return this.storage.open$(['albums', 'pictures']).pipe(
      concatMap((transaction) =>
        this.storage
          .walk$<Album>(transaction, 'albums', 'albumArtist', artist.name)
          .pipe(
            map(({ value }) => value),
            concatMap((album) =>
              album.pictureKey
                ? this.storage
                    .exec$<Picture>(
                      transaction.objectStore('pictures').get(album.pictureKey)
                    )
                    .pipe(
                      map((picture) => ({
                        ...album,
                        cover: picture ? getCover(picture) : undefined,
                      }))
                    )
                : of(album)
            )
          )
      )
    );
  }

  getAlbumsWithArtist(artist: Artist): Observable<AlbumWithCover> {
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
            concatMap((album) =>
              album.pictureKey
                ? this.storage
                    .exec$<Picture>(
                      transaction.objectStore('pictures').get(album.pictureKey)
                    )
                    .pipe(
                      map((picture) => ({
                        ...album,
                        cover: picture ? getCover(picture) : undefined,
                      }))
                    )
                : of(album)
            )
          )
      )
    );
  }

  getArtistTitles(artist: Artist): Observable<Song> {
    return this.storage.open$(['songs']).pipe(
      concatMap((transaction) =>
        this.storage.walk$<Song>(transaction, 'songs', 'artists', artist.name)
      ),
      map(({ value }) => value)
    );
  }

  async requestPermissionPromise(
    fileHandle: FileSystemHandle,
    readWrite = false
  ) {
    let options = {};
    if (readWrite) {
      options = { mode: 'readwrite' };
    }
    // Check if permission was already granted. If so, return true.
    if ((await fileHandle.queryPermission(options)) === 'granted') {
      return true;
    }
    // Request permission. If the user grants permission, return true.
    if ((await fileHandle.requestPermission(options)) === 'granted') {
      return true;
    }
    // The user didn't grant permission, so return false.
    return false;
  }

  requestPermission(handle: FileSystemHandle): Observable<void> {
    return from(this.requestPermissionPromise(handle)).pipe(
      concatMap((perm) => (perm ? of(void 0) : throwError('Permission denied')))
    );
  }

  toggleSongFavorite(song: Song): Observable<void> {
    return this.storage
      .update$<Song>(
        'songs',
        { likedOn: !!song.likedOn ? undefined : new Date() },
        song.entryPath
      )
      .pipe(map(() => void 0));
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
    return this.storage.get$<Playlist>('playlists', title);
  }

  getPlaylists(): Observable<Playlist> {
    return this.storage.open$(['playlists']).pipe(
      concatMap((t) => this.storage.walk$<Playlist>(t, 'playlists')),
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
      ...partial,
    };
    return this.storage
      .add$('playlists', playlist)
      .pipe(tap(() => this.playlistsSubject.next(playlist)));
  }
}
