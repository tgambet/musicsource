import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of, switchMap } from 'rxjs';
import {
  selectPictureAll,
  selectPictureByFolder,
  selectPictureByKey,
  selectPictureTotal,
} from '@app/database/pictures/picture.selectors';
import { Picture, PictureId } from '@app/database/pictures/picture.model';
import { map } from 'rxjs/operators';
import { Album } from '@app/database/albums/album.model';
import { SongFacade } from '@app/database/songs/song.facade';
import { Song } from '@app/database/songs/song.model';
import { Artist } from '@app/database/artists/artist.model';
import { ArtistFacade } from '@app/database/artists/artist.facade';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { longestCommonPath } from '@app/core/utils/longest-common-prefix.util';

@Injectable()
export class PictureFacade {
  constructor(
    private store: Store,
    private songs: SongFacade,
    private artists: ArtistFacade,
    private albums: AlbumFacade
  ) {}

  getByKey(key: PictureId): Observable<Picture | undefined> {
    return this.store.select(selectPictureByKey(key));
  }

  getPictureBySize(picture?: Picture, size = 0): string | undefined {
    return (
      picture &&
      (size === 0
        ? picture.original
        : picture.sources.find((p) => p.height === size)?.src)
    );
  }

  getCover(key?: PictureId, size = 0): Observable<string | undefined> {
    return !key
      ? of(undefined)
      : this.store
          .select(selectPictureByKey(key))
          .pipe(map((picture) => this.getPictureBySize(picture, size)));
  }

  getFolderPicture(
    folder: string,
    size = 0,
    names: string[]
  ): Observable<string | undefined> {
    return this.store
      .select(selectPictureByFolder(folder, names))
      .pipe(map((picture) => this.getPictureBySize(picture, size)));
  }

  getAll(): Observable<Picture[]> {
    return this.store.select(selectPictureAll);
  }

  getTotal(): Observable<number> {
    return this.store.select(selectPictureTotal);
  }

  // -------------------------------------------------------

  /**
   * Get cover from folder or first song that has a picture
   */
  getAlbumCover(album: Album, size = 0): Observable<string | undefined> {
    return this.getFolderPicture(album.folder, size, [
      'folder',
      'cover',
      'discart',
    ]).pipe(
      switchMap((folderPict) =>
        folderPict
          ? of(folderPict)
          : this.songs.getByAlbumKey(album.id).pipe(
              map(
                (songs) =>
                  songs && songs.find((song) => !!song.pictureId)?.pictureId
              ),
              switchMap((pictureId) =>
                pictureId ? this.getCover(pictureId, size) : of(undefined)
              )
            )
      )
    );
  }

  getSongCover(song: Song, size = 0): Observable<string | undefined> {
    return this.getCover(song.pictureId, size).pipe(
      switchMap((picture) =>
        picture
          ? of(picture)
          : this.getFolderPicture(song.folder, size, ['folder', 'cover'])
      )
    );
  }

  getArtistCover(
    artist: Artist,
    size = 0,
    names = ['folder', 'cover', 'fanart']
  ): Observable<string | undefined> {
    return this.albums.getByArtistKey(artist.id).pipe(
      map((albums) => albums && albums.map((a) => a.folder)),
      map((folders) => folders && longestCommonPath(folders)),
      switchMap((folder) =>
        !folder ? of(undefined) : this.getFolderPicture(folder, size, names)
      )
    );
  }

  getArtistBanner(artist: Artist, size = 0): Observable<string | undefined> {
    return this.getArtistCover(artist, size, ['fanart', 'folder']);
  }
}
