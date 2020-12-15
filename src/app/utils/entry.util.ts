export type FileEntry = {
  kind: 'file';
  name: string;
  path: string;
  parent?: string;
  handle: FileSystemFileHandle;
};

export type DirectoryEntry = {
  kind: 'directory';
  name: string;
  path: string;
  parent?: string;
  handle: FileSystemDirectoryHandle;
};

export type Entry = FileEntry | DirectoryEntry;

export const isFile = (entry: Entry): entry is FileEntry =>
  entry.kind === 'file';

export const isDirectory = (entry: Entry): entry is DirectoryEntry =>
  entry.kind === 'directory';

export const isDirectChild = (parent: DirectoryEntry, child: Entry): boolean =>
  parent.path === child.parent;

export const isChild = (parent: DirectoryEntry, child: Entry): boolean =>
  !!child.parent?.startsWith(parent.path + '/');
