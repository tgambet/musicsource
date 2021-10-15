export interface ScannerState {
  state?: 'scanning' | 'extracting' | 'success' | 'error';
  error?: any;
  label?: string;
  scannedCount: number;
  extractedCount: number;
}

export const initialState: ScannerState = {
  scannedCount: 0,
  extractedCount: 0,
};
