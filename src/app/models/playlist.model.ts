export interface Playlist {
  title: string;
  description?: string;
  songs: string[];
  pictureKey?: string;
  createdOn: Date;
  likedOn?: Date;
}
