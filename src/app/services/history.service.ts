import { Injectable } from '@angular/core';
import { Album, AlbumWithCover$ } from '@app/models/album.model';
import { StorageService } from '@app/services/storage.service';
import { Artist, ArtistWithCover$ } from '@app/models/artist.model';
import { Observable } from 'rxjs';
import { LibraryFacade } from '@app/store/library/library.facade';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  constructor(
    private storage: StorageService,
    private library: LibraryFacade
  ) {}

  latestPlayedAlbums$(): Observable<AlbumWithCover$> {
    return this.library.getAlbums('listenedOn', undefined, 'prev');
  }

  latestPlayedArtists$(): Observable<ArtistWithCover$> {
    return this.library.getArtists('listenedOn', undefined, 'prev');
  }

  albumPlayed(album: Album): void {
    this.storage
      .update$<Album>('albums', { listenedOn: new Date() }, album.name)
      .subscribe();
  }

  artistPlayed(artist: Artist): void {
    this.storage
      .update$<Artist>('artists', { listenedOn: new Date() }, artist.name)
      .subscribe();
  }
}
