export interface Artist {
  id: string;
  name?: string;
  images?: {
    height: number;
    width: number;
    url: string;
  }[];
  thumbnail?: string;
  spotifyId?: string;
}
