// eslint-disable-next-line no-shadow
export enum ScannerStateEnum {
  idle = 'idle',
  prompted = 'prompted',
  scanning = 'scanning',
  parsing = 'parsing',
  aborted = 'aborted',
  success = 'success',
  error = 'error',
}

export interface ScannerState {
  state: ScannerStateEnum;
  error: any;
  scannedCount: number;
  parsedCount: number;
  latestScanned: string | null;
  latestParsed: string | null;
}

export const initialState: ScannerState = {
  state: ScannerStateEnum.idle,
  error: null,
  scannedCount: 0,
  parsedCount: 0,
  latestScanned: null,
  latestParsed: null,
};
