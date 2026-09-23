import { AddedPerson, DetectedListInfo, EmptySlot, NumberFormatStyle, NumeralType } from '../types';

export const EASTERN_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toWesternDigits(str: string): string {
  return str.replace(/[٠-٩]/g, (d) => EASTERN_DIGITS.indexOf(d).toString());
}

export function toEasternDigits(num: number | string): string {
  const str = num.toString();
  return str.replace(/[0-9]/g, (d) => EASTERN_DIGITS[parseInt(d, 10)]);
}

export function formatNumberWithNumeralType(
  num: number,
  numeralType: NumeralType,
  detectedType: 'western' | 'arabic_indic'
): string {
  const effectiveType = numeralType === 'auto' ? detectedType : numeralType;
  if (effectiveType === 'arabic_indic') {
    return toEasternDigits(num);
  }
  return num.toString();
}

/**
 * Checks if a string has actual text content (e.g. Arabic or English letters / names)
 * ignoring separators like dashes, dots, spaces, slashes.
 */
export function hasActualContent(text: string): boolean {
  const cleaned = text.replace(/[-–—_.:/\\()\[\]{}|،,\s]/g, '');
  return cleaned.length > 0;
}

export function parseList(text: string): DetectedListInfo {
  if (!text || !text.trim()) {
    return {
      totalLines: 0,
      numberedLinesCount: 0,
      highestNumber: 0,
      lastFoundNumber: 0,
      hasEmptySlots: false,
      emptySlotsCount: 0,
      emptySlots: [],
      emptySlotNumbers: [],
      detectedPrefixStyle: 'unknown',
      detectedNumeralType: 'western',
    };
  }

  const lines = text.split(/\r?\n/);
  const totalLines = lines.length;

  let highestNumber = 0;
  let lastFoundNumber = 0;
  let numberedLinesCount = 0;
  const emptySlots: EmptySlot[] = [];
  let prefixCount = 0;
  let suffixCount = 0;
  let easternCount = 0;
  let westernCount = 0;

  // Regex patterns:
  // 1. Leading number with separator: e.g. "1- Name", "13-", "13 - ", "13. Name", "13) "
  const leadingRegex = /^\s*(?:[-*•#]?\s*)?[\[(]?([0-9\u0660-\u0669]{1,5})[\])]?(\s*[-–—.:\)\/\]]?\s*)(.*)$/;
  // 2. Trailing number: e.g. "Name / Safe - 1"
  const trailingRegex = /^(.*?)\s*[-–—.:\/\(\[]\s*([0-9\u0660-\u0669]{1,5})\s*$/;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Check eastern vs western digits
    const easternMatches = rawLine.match(/[٠-٩]/g);
    const westernMatches = rawLine.match(/[0-9]/g);
    if (easternMatches) easternCount += easternMatches.length;
    if (westernMatches) westernCount += westernMatches.length;

    // Try leading match
    const leadingMatch = trimmed.match(leadingRegex);
    if (leadingMatch) {
      const numRaw = leadingMatch[1];
      const rest = leadingMatch[3]?.trim() || '';
      const numVal = parseInt(toWesternDigits(numRaw), 10);

      // Exclude years
      const isDateHeader = (numVal > 1900 && numVal < 2100) && (trimmed.includes('/') || trimmed.includes('-'));

      if (!isNaN(numVal) && !isDateHeader && numVal > 0) {
        numberedLinesCount++;
        prefixCount++;
        lastFoundNumber = numVal;
        if (numVal > highestNumber) highestNumber = numVal;

        // Check if this slot is empty (e.g. "13-", "13 - ", "13", "13.")
        if (!hasActualContent(rest)) {
          const prefix = trimmed.slice(0, trimmed.length - rest.length).trimEnd();
          emptySlots.push({
            lineIndex: i,
            number: numVal,
            originalLine: rawLine,
            prefix: prefix || `${numRaw}-`,
            numRaw,
          });
        }
        continue;
      }
    }

    // Try trailing match
    const trailingMatch = trimmed.match(trailingRegex);
    if (trailingMatch) {
      const rest = trailingMatch[1]?.trim() || '';
      const numRaw = trailingMatch[2];
      const numVal = parseInt(toWesternDigits(numRaw), 10);
      const isDateHeader = (numVal > 1900 && numVal < 2100);

      if (!isNaN(numVal) && !isDateHeader && numVal > 0) {
        numberedLinesCount++;
        suffixCount++;
        lastFoundNumber = numVal;
        if (numVal > highestNumber) highestNumber = numVal;

        if (!hasActualContent(rest)) {
          emptySlots.push({
            lineIndex: i,
            number: numVal,
            originalLine: rawLine,
            prefix: `${numRaw}-`,
            numRaw,
          });
        }
      }
    }
  }

  const detectedPrefixStyle = prefixCount >= suffixCount ? (prefixCount > 0 ? 'prefix' : 'unknown') : 'suffix';
  const detectedNumeralType = easternCount > westernCount ? 'arabic_indic' : 'western';

  return {
    totalLines,
    numberedLinesCount,
    highestNumber,
    lastFoundNumber: lastFoundNumber || highestNumber,
    hasEmptySlots: emptySlots.length > 0,
    emptySlotsCount: emptySlots.length,
    emptySlots,
    emptySlotNumbers: emptySlots.map((s) => s.number),
    detectedPrefixStyle,
    detectedNumeralType,
  };
}

export function formatLine(
  person: AddedPerson,
  number: number,
  formatStyle: NumberFormatStyle,
  numeralType: NumeralType,
  detectedType: 'western' | 'arabic_indic',
  existingPrefix?: string
): string {
  const parts: string[] = [];
  if (person.name?.trim()) parts.push(person.name.trim());
  if (person.city?.trim()) parts.push(person.city.trim());
  if (person.status?.trim()) parts.push(person.status.trim());
  const personStr = parts.join(' / ');

  // If we already have an existing prefix from the empty line, e.g. "13- " or "13 - "
  if (existingPrefix) {
    const cleanPrefix = existingPrefix.trim();
    return `${cleanPrefix} ${personStr}`;
  }

  const numStr = formatNumberWithNumeralType(number, numeralType, detectedType);

  switch (formatStyle) {
    case 'prefix_hyphen':
      return `${numStr}- ${personStr}`;
    case 'prefix_space_hyphen':
      return `${numStr} - ${personStr}`;
    case 'prefix_dot':
      return `${numStr}. ${personStr}`;
    case 'suffix_hyphen':
      return `${personStr} - ${numStr}`;
    default:
      return `${numStr}- ${personStr}`;
  }
}

export interface FormattedAddedLine {
  id: string;
  line: string;
  number: number;
}

export interface GenerateResult {
  updatedText: string;
  lines: FormattedAddedLine[];
  filledInEmptySlots: boolean;
  filledSlotNumbers: number[];
  remainingEmptySlotsCount: number;
}

export function generateUpdatedList(
  originalText: string,
  persons: AddedPerson[],
  nextNumber: number,
  formatStyle: NumberFormatStyle,
  numeralType: NumeralType,
  detectedType: 'western' | 'arabic_indic',
  preferFillEmptySlots: boolean = true
): GenerateResult {
  // Filter active persons with at least a name
  const validPersons = persons.filter((p) => p.name && p.name.trim().length > 0);

  if (validPersons.length === 0) {
    return {
      updatedText: originalText,
      lines: [],
      filledInEmptySlots: false,
      filledSlotNumbers: [],
      remainingEmptySlotsCount: 0,
    };
  }

  if (!originalText || !originalText.trim()) {
    const lines: FormattedAddedLine[] = validPersons.map((p, idx) => {
      const num = nextNumber + idx;
      return {
        id: p.id,
        number: num,
        line: formatLine(p, num, formatStyle, numeralType, detectedType),
      };
    });

    return {
      updatedText: lines.map((l) => l.line).join('\n'),
      lines,
      filledInEmptySlots: false,
      filledSlotNumbers: lines.map((l) => l.number),
      remainingEmptySlotsCount: 0,
    };
  }

  const info = parseList(originalText);
  const textLines = originalText.split(/\r?\n/);

  // If there are empty slots in the text (like "13-", "14-", "15-", etc.) and user prefers filling them:
  if (preferFillEmptySlots && info.emptySlots.length > 0) {
    const formattedLines: FormattedAddedLine[] = [];
    const filledSlotNumbers: number[] = [];
    const usedLineIndices = new Set<number>();

    // For each person, try to place in an empty slot; if empty slots run out, append
    let emptySlotPtr = 0;
    let fallbackNumber = Math.max(
      nextNumber,
      info.highestNumber + 1,
      (info.emptySlots[info.emptySlots.length - 1]?.number || 0) + 1
    );

    for (let i = 0; i < validPersons.length; i++) {
      const person = validPersons[i];
      if (emptySlotPtr < info.emptySlots.length) {
        const slot = info.emptySlots[emptySlotPtr];
        const line = formatLine(person, slot.number, formatStyle, numeralType, detectedType, slot.prefix);
        textLines[slot.lineIndex] = line;
        usedLineIndices.add(slot.lineIndex);
        filledSlotNumbers.push(slot.number);
        formattedLines.push({
          id: person.id,
          number: slot.number,
          line,
        });
        emptySlotPtr++;
      } else {
        // Run out of empty slots, append at the end with next sequential number
        const num = fallbackNumber++;
        const line = formatLine(person, num, formatStyle, numeralType, detectedType);
        textLines.push(line);
        filledSlotNumbers.push(num);
        formattedLines.push({
          id: person.id,
          number: num,
          line,
        });
      }
    }

    const remainingEmptyCount = Math.max(0, info.emptySlots.length - usedLineIndices.size);

    return {
      updatedText: textLines.join('\n'),
      lines: formattedLines,
      filledInEmptySlots: true,
      filledSlotNumbers,
      remainingEmptySlotsCount: remainingEmptyCount,
    };
  }

  // Otherwise (no empty slots found, or appending at end requested):
  const formattedLines: FormattedAddedLine[] = validPersons.map((p, idx) => {
    const num = nextNumber + idx;
    return {
      id: p.id,
      number: num,
      line: formatLine(p, num, formatStyle, numeralType, detectedType),
    };
  });

  const trimmedEnd = originalText.replace(/[\r\n]+$/, '');
  const updatedText = `${trimmedEnd}\n${formattedLines.map((l) => l.line).join('\n')}`;

  return {
    updatedText,
    lines: formattedLines,
    filledInEmptySlots: false,
    filledSlotNumbers: formattedLines.map((l) => l.number),
    remainingEmptySlotsCount: 0,
  };
}

export const SAMPLE_SAFETY_LIST = `رسالة طمأنينة - كشف الاطمئنان والسلامة
1- علي أحمد الحميري / صنعاء / آمن
2- عمار خالد العبسي / تعز / آمن
3- فؤاد عبدالكريم / عدن / آمن
4- نبيل هزاع / الحديدة / آمن
5- وليد مهيوب / إب / آمن
6- بشير الصلوي / ذمار / آمن
7- صقر المقالح / إب / آمن
8- هيثم المعمري / صنعاء / آمن
9- رشاد الأكوع / صنعاء / آمن
10- حسام الشامي / إب / آمن
11- ماجد العطاب / يريم / آمن
12- حمزة الجبري / إب / آمن
13-
14-
15-
16-
17-
18-
19-
20-`;
