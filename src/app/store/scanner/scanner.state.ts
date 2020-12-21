// eslint-disable-next-line no-shadow
export enum ScannerStateEnum {
  initial = 'initial',
  scanning = 'scanning',
  extracting = 'extracting',
  building = 'building',
  error = 'error',
}

export interface ScannerState {
  state: ScannerStateEnum;
  error: any;
  log: string | null;
  scannedCount: number;
  extractedCount: number;
}

export const initialState: ScannerState = {
  state: ScannerStateEnum.initial,
  error: null,
  log: null,
  scannedCount: 0,
  extractedCount: 0,
};
