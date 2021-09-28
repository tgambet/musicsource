export interface Playlist {
  title: string;
  hash: string;
  description?: string;
  songs: string[];
  pictureKey?: string;
  createdOn: Date;
  likedOn?: Date;
}
