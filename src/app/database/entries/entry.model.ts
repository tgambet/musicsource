import { from, Observable, of, throwError } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { Opaque } from 'type-fest';
import { hash } from '@app/core/utils';

export type EntryId = Opaque<string, Entry>;

export const getEntryId = (path: string): EntryId => hash(path) as EntryId;

export type FileEntry = {
  id: EntryId;
  kind: 'file';
  name: string;
  path: string;
  parent: string;
  handle: FileSystemFileHandle;
};

export type DirectoryEntry = {
  id: EntryId;
  kind: 'directory';
  name: string;
  path: string;
  parent?: string;
  handle: FileSystemDirectoryHandle;
};

export type Entry = FileEntry | DirectoryEntry;

// export const isFile = (entry: Entry): entry is FileEntry =>
//   entry.kind === 'file';
//
// export const isDirectory = (entry: Entry): entry is DirectoryEntry =>
//   entry.kind === 'directory';
//
// export const isDirectChild = (parent: DirectoryEntry, child: Entry): boolean =>
//   parent.path === child.parent;
//
// export const isChild = (parent: DirectoryEntry, child: Entry): boolean =>
//   !!child.path?.startsWith(parent.path + '/');

export const requestPermissionPromise = async (
  fileHandle: FileSystemHandle,
  readWrite = false
): Promise<boolean> => {
  let options = {};
  if (readWrite) {
    options = { mode: 'readwrite' };
  }
  // Check if permission was already granted. If so, return true.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
};

export const requestPermission = (handle: FileSystemHandle): Observable<void> =>
  from(requestPermissionPromise(handle)).pipe(
    concatMap((perm) =>
      perm ? of(void 0) : throwError(() => 'Permission denied')
    )
  );

export const entryFromHandle = (
  handle: FileSystemHandle,
  parent?: string
): Entry => {
  const path = parent ? `${parent}/${handle.name}` : handle.name;

  return {
    id: getEntryId(path),
    kind: handle.kind,
    name: handle.name,
    parent: parent as any,
    path,
    handle: handle as any,
  };
};
