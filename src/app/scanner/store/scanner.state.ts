export interface ScannerState {
  state?: 'scanning' | 'extracting' | 'success' | 'error';
  error?: any;
  label?: string;
  progress: number;
  scannedCount: number;
  extractedCount: number;
}

export const initialState: ScannerState = {
  progress: 0,
  scannedCount: 0,
  extractedCount: 0,
};
