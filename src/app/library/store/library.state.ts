// export type ArtistState = EntityState<Artist>;
// export type AlbumState = EntityState<Album>;
// export type SongState = EntityState<Song>;
// export type CoverState = EntityState<Cover>;
// export type EntryState = EntityState<Entry>;
// export type SongState = EntityState<Song>;
// export type PictureState = EntityState<Picture>;

// export const artistAdapter: EntityAdapter<Artist> = createEntityAdapter<Artist>(
//   {
//     selectId: (model) => model.id,
//   }
// );
// export const albumAdapter: EntityAdapter<Album> = createEntityAdapter<Album>({
//   selectId: (model) => model.id,
// });
// export const songAdapter: EntityAdapter<Song> = createEntityAdapter<Song>({
//   selectId: (model) => model.id,
// });
// export const coverAdapter: EntityAdapter<Cover> = createEntityAdapter<Cover>({
//   selectId: (model) => model.id,
// });
// export const entryAdapter: EntityAdapter<Entry> = createEntityAdapter<Entry>({
//   selectId: (model) => model.path,
// });
//
// export const songAdapter: EntityAdapter<Song> = createEntityAdapter<Song>({
//   selectId: (model) => model.entryPath,
// });
//
// export const pictureAdapter: EntityAdapter<Picture> = createEntityAdapter<
//   Picture
// >({
//   selectId: (model) => model.key || 0,
// });

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LibraryState {
  // entries: EntryState;
  // songs: SongState;
  // pictures: PictureState;
  // artists: ArtistState;
  // albums: AlbumState;
  // songs: SongState;
  // covers: CoverState;
}

export const initialState: LibraryState = {
  // entries: entryAdapter.getInitialState(),
  // songs: songAdapter.getInitialState(),
  // pictures: pictureAdapter.getInitialState(),
  // artists: artistAdapter.getInitialState(),
  // albums: albumAdapter.getInitialState(),
  // songs: songAdapter.getInitialState(),
  // covers: coverAdapter.getInitialState(),
};
