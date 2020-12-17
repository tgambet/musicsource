import { Inject, Injectable } from '@angular/core';
import { defer, from, Observable, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { Either, left, right } from '@app/utils/either.util';
import { DOCUMENT } from '@angular/common';
import { FileEntry } from '@app/utils/entry.util';
import { ICommonTagsResult, IPicture } from 'music-metadata/lib/type';

// export interface ParseResult {
//   entry: FileEntry;
//   trackNumber: number | null;
//   title?: string;
//   album?: string;
//   artist?: string;
//   albumArtist?: string;
//   genre?: string[];
//   duration?: number;
//   year?: number;
//   picture?: {
//     base64: string;
//     format: string;
//   };
// }

export type Song = Omit<ICommonTagsResult, 'picture'> & {
  entryPath: string;
  pictureKey?: IDBValidKey;
};
export type Picture = Omit<IPicture, 'data'> & {
  data: string;
  key?: number;
};

@Injectable()
export class ExtractorService {
  constructor(@Inject(DOCUMENT) private document: Document) {
    const win = document.defaultView;
    if (!win) {
      return;
    }
    import('process')
      .then((process) => {
        (win as any).process = process;
        (win as any).global = window;
        return import('buffer');
      })
      .then((buffer) => {
        (win as any).Buffer = buffer.Buffer;
      });
  }

  extract(
    entry: FileEntry
  ): Observable<Either<{ song: Song; pictures?: Picture[] }>> {
    return defer(() => from(entry.handle.getFile())).pipe(
      // filter(file => this.supportedTypes.includes(file.type)),
      concatMap((file) =>
        import('music-metadata-browser').then((musicMetadata) =>
          musicMetadata.parseBlob(file /*{duration: true}*/)
        )
      ),
      map(({ common }) => {
        const pictures = this.toPicture(common.picture);
        delete common.picture;
        return right({
          song: {
            ...common,
            entryPath: entry.path,
          },
          pictures,
        });
      }),
      // map((metadata) =>
      //   right({
      //     entry,
      //     trackNumber: metadata.common.track.no,
      //     title: metadata.common.title,
      //     album: metadata.common.album,
      //     artist: metadata.common.artist,
      //     albumArtist: metadata.common.albumartist || metadata.common.artist,
      //     genre: metadata.common.genre,
      //     duration: metadata.format.duration,
      //     year: metadata.common.year,
      //     picture:
      //       metadata.common.picture && metadata.common.picture.length > 0
      //         ? {
      //             base64: metadata.common.picture[0].data.toString('base64'),
      //             format: metadata.common.picture[0].format,
      //           }
      //         : undefined,
      //   })
      // ),
      catchError((error) => of(left(error)))
    );
  }

  toPicture(pictures?: IPicture[]): Picture[] | undefined {
    return pictures?.map((pict) => ({
      ...pict,
      data: pict.data.toString('base64'),
    }));
  }
}
