export interface ScannerState {
  state: 'idle' | 'scanning' | 'extracting' | 'saving' | 'success' | 'error';
  error?: any;
  label?: string;
  scannedCount: number;
  extractingCount: number;
  extractedCount: number;
  savingCount: number;
  savedCount: number;
}

export const initialState: ScannerState = {
  state: 'idle',
  scannedCount: 0,
  extractingCount: 0,
  extractedCount: 0,
  savingCount: 0,
  savedCount: 0,
};
