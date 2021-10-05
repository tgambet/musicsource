import { Injectable } from '@angular/core';
import { Album } from '@app/database/albums/album.model';
import { DatabaseService } from '@app/database/database.service';
import { Artist } from '@app/database/artists/artist.model';
import { Observable } from 'rxjs';
import { LibraryFacade } from '@app/library/store/library.facade';

@Injectable()
export class HistoryService {
  constructor(
    private storage: DatabaseService,
    private library: LibraryFacade
  ) {}

  latestPlayedAlbums$(): Observable<Album> {
    return this.library.getAlbums('listenedOn', undefined, 'prev');
  }

  latestPlayedArtists$(): Observable<Artist> {
    return this.library.getArtists('listenedOn', undefined, 'prev');
  }

  albumPlayed(album: Album): void {
    this.storage
      .update$<Album>('albums', { listenedOn: new Date() }, album.hash)
      .subscribe();
  }

  artistPlayed(artist: Artist): void {
    this.storage
      .update$<Artist>('artists', { listenedOn: new Date() }, artist.hash)
      .subscribe();
  }
}
