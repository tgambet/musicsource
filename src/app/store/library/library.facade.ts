import { Injectable } from '@angular/core';
import { DirectoryEntry, Entry } from '@app/models/entry.model';
import { Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { StorageService } from '@app/services/storage.service';
import { Album, AlbumWithCover } from '@app/models/album.model';
import { Artist, ArtistWithCover } from '@app/models/artist.model';
import { getCover, Picture } from '@app/models/picture.model';

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

  constructor(private storage: StorageService) {}

  getEntry = (path: string): Observable<Entry | undefined> =>
    this.storage.get$('entries', path);

  getChildrenEntries = (directory: DirectoryEntry): Observable<Entry[]> =>
    this.storage.open$(['entries']).pipe(
      this.storage.exec<Entry[]>((t) =>
        t.objectStore('entries').index('parents').getAll(directory.path)
      )
    );
}
