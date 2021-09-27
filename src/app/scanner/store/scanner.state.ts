export interface ScannerState {
  state?: 'scanning' | 'success' | 'error';
  error?: any;
  step?: string;
  stepSub?: string;
  progress: number;
  progressDisplay?: string;
  progressDisplaySub?: string;
  scannedCount: number;
  extractedCount: number;
  songsCount: number;
  albumsCount: number;
  artistsCount: number;
}

export const initialState: ScannerState = {
  progress: 0,
  scannedCount: 0,
  extractedCount: 0,
  songsCount: 0,
  albumsCount: 0,
  artistsCount: 0,
};
