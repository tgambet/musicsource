import { Entry } from '@app/utils/entry.util';
import { Picture, Song } from '@app/services/extractor.service';

// eslint-disable-next-line no-shadow
export enum ScannerStateEnum {
  initial = 'initial',
  scanning = 'scanning',
  parsing = 'parsing',
  building = 'building',
  error = 'error',
}

export interface ScannerState {
  state: ScannerStateEnum;
  error: any;
  scannedCount: number;
  parsedCount: number;
  latestScanned: string | null;
  latestParsed: string | null;
  scannedEntries: Entry[];
  parsedEntries: { song: Song; pictures?: Picture[] }[];
}

export const initialState: ScannerState = {
  state: ScannerStateEnum.initial,
  error: null,
  scannedCount: 0,
  parsedCount: 0,
  latestScanned: null,
  latestParsed: null,
  scannedEntries: [],
  parsedEntries: [],
};
