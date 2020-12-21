import { Inject, Injectable } from '@angular/core';
import { defer, from, Observable, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { Either, left, right } from '@app/utils/either.util';
import { DOCUMENT } from '@angular/common';
import { FileEntry } from '@app/utils/entry.util';
import { ICommonTagsResult, IPicture } from 'music-metadata/lib/type';
import { hash } from '@app/utils/hash.util';

export type Song = Omit<ICommonTagsResult, 'picture'> & {
  entryPath: string;
  pictureKey?: IDBValidKey;
};

export type Picture = Omit<IPicture, 'data'> & {
  data: string;
  hash: string;
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
      catchError((error) => of(left(error)))
    );
  }

  toPicture(pictures?: IPicture[]): Picture[] | undefined {
    return pictures?.map((pict) => {
      const data = pict.data.toString('base64');
      return {
        ...pict,
        data,
        hash: hash(data),
      };
    });
  }
}
