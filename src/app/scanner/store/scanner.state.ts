export interface ScannerState {
  state: 'idle' | 'scanning' | 'success' | 'error';
  error?: any;
  label: string;
}

export const initialState: ScannerState = {
  state: 'idle',
  label: '',
};
