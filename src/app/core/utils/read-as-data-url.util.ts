import { Observable } from 'rxjs';

export const readAsDataURL = (blob: Blob): Observable<string> =>
  new Observable((observer) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      observer.next(e.target?.result as string);
      observer.complete();
    };

    reader.onerror = (e) => {
      observer.error(e.target?.error);
    };

    reader.readAsDataURL(blob);

    return () => {
      reader.abort();
    };
  });
