export type InsertionMode = 'fill_empty_slots' | 'append_at_end';

export type NumberFormatStyle = 'prefix_hyphen' | 'prefix_space_hyphen' | 'prefix_dot' | 'suffix_hyphen';

export type NumeralType = 'western' | 'arabic_indic' | 'auto';

export interface AddedPerson {
  id: string;
  name: string;
  city: string;
  status: string;
}

export interface EmptySlot {
  lineIndex: number;
  number: number;
  originalLine: string;
  prefix: string; // e.g. "13-", "13 - ", "13. ", "13) "
  numRaw: string;
}

export interface DetectedListInfo {
  totalLines: number;
  numberedLinesCount: number;
  highestNumber: number;
  lastFoundNumber: number;
  hasEmptySlots: boolean;
  emptySlotsCount: number;
  emptySlots: EmptySlot[];
  emptySlotNumbers: number[];
  detectedPrefixStyle: 'prefix' | 'suffix' | 'unknown';
  detectedNumeralType: 'western' | 'arabic_indic';
}
