import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { DetectionInfo } from './components/DetectionInfo';
import { PersonCustomizer } from './components/PersonCustomizer';
import { OutputView } from './components/OutputView';
import {
  parseList,
  generateUpdatedList,
  SAMPLE_SAFETY_LIST,
} from './utils/detector';
import { loadSavedPersons, savePersonsToStorage, createEmptyPerson } from './utils/storage';
import { AddedPerson, NumberFormatStyle, NumeralType } from './types';

export default function App() {
  const [inputText, setInputText] = useState<string>(SAMPLE_SAFETY_LIST);
  const [manualNextNumber, setManualNextNumber] = useState<number | null>(null);
  const [formatStyle, setFormatStyle] = useState<NumberFormatStyle>('prefix_hyphen');
  const [numeralType, setNumeralType] = useState<NumeralType>('auto');
  const [preferFillEmptySlots, setPreferFillEmptySlots] = useState<boolean>(true);

  // Dynamic user-managed persons loaded from LocalStorage
  const [persons, setPersons] = useState<AddedPerson[]>(() => loadSavedPersons());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Automatically save to localStorage when persons state changes
  useEffect(() => {
    savePersonsToStorage(persons);
  }, [persons]);

  // Parse list dynamically
  const info = useMemo(() => {
    return parseList(inputText);
  }, [inputText]);

  // Compute calculated next number (when appending or if no empty slots)
  const calculatedNextNumber = useMemo(() => {
    const base = info.lastFoundNumber || info.highestNumber || 0;
    return base + 1;
  }, [info]);

  // Effective next number (user override or auto-calculated)
  const effectiveNextNumber = manualNextNumber !== null ? manualNextNumber : calculatedNextNumber;

  // Generate output list with slot-filling logic
  const result = useMemo(() => {
    return generateUpdatedList(
      inputText,
      persons,
      effectiveNextNumber,
      formatStyle,
      numeralType,
      info.detectedNumeralType,
      preferFillEmptySlots
    );
  }, [inputText, persons, effectiveNextNumber, formatStyle, numeralType, info.detectedNumeralType, preferFillEmptySlots]);

  const handleInputChange = (text: string) => {
    setInputText(text);
    setManualNextNumber(null);
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_SAFETY_LIST);
    setManualNextNumber(null);
  };

  const handleClear = () => {
    setInputText('');
    setManualNextNumber(null);
  };

  // Persons management
  const handleAddPerson = () => {
    setPersons((prev) => [...prev, createEmptyPerson()]);
    setHasUnsavedChanges(true);
  };

  const handleRemovePerson = (id: string) => {
    setPersons((prev) => {
      const next = prev.filter((p) => p.id !== id);
      return next.length > 0 ? next : [createEmptyPerson()];
    });
    setHasUnsavedChanges(true);
  };

  const handleUpdatePerson = (id: string, updated: Partial<AddedPerson>) => {
    setPersons((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    setHasUnsavedChanges(true);
  };

  const handleManualSave = () => {
    savePersonsToStorage(persons);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Header
          onLoadSample={handleLoadSample}
          onClear={handleClear}
          hasInput={Boolean(inputText.trim())}
        />

        {/* Dynamic Persons Manager (Saved automatically in device storage) */}
        <PersonCustomizer
          persons={persons}
          formattedLines={result.lines}
          onAddPerson={handleAddPerson}
          onRemovePerson={handleRemovePerson}
          onUpdatePerson={handleUpdatePerson}
          onSave={handleManualSave}
          hasUnsavedChanges={hasUnsavedChanges}
        />

        {/* Input Section */}
        <InputSection
          value={inputText}
          onChange={handleInputChange}
          onClear={handleClear}
          lineCount={info.totalLines}
        />

        {/* Detection Summary & Style Customizer with slot fill notification */}
        <DetectionInfo
          info={info}
          nextNumber={effectiveNextNumber}
          onNextNumberChange={(num) => setManualNextNumber(num)}
          formatStyle={formatStyle}
          onFormatStyleChange={setFormatStyle}
          numeralType={numeralType}
          onNumeralTypeChange={setNumeralType}
          preferFillEmptySlots={preferFillEmptySlots}
          onPreferFillEmptySlotsChange={setPreferFillEmptySlots}
          filledSlotNumbers={result.filledSlotNumbers}
          filledInEmptySlots={result.filledInEmptySlots}
        />

        {/* Output Section with Big Green COPY Button */}
        <OutputView
          finalText={result.updatedText}
          lines={result.lines}
          filledInEmptySlots={result.filledInEmptySlots}
          filledSlotNumbers={result.filledSlotNumbers}
          remainingEmptySlotsCount={result.remainingEmptySlotsCount}
        />

        {/* Footer */}
        <footer className="text-center text-xs text-slate-600 pt-4 pb-8 space-y-1">
          <p className="font-semibold text-slate-700">رسالة الطمأنينة • حفظكم الله جميعاً وأدام الأمن والسلام</p>
          <p>تُحفظ أسماؤك وإعداداتك بأمان داخل متصفح جهازك لسهولة الاستخدام المستمر.</p>
        </footer>
      </div>
    </div>
  );
}
