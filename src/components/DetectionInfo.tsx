import React from 'react';
import { Hash, ArrowLeftRight, CheckCircle2, AlertCircle, Plus, Minus, Check, CornerDownLeft } from 'lucide-react';
import { DetectedListInfo, NumberFormatStyle, NumeralType } from '../types';
import { formatNumberWithNumeralType } from '../utils/detector';

interface DetectionInfoProps {
  info: DetectedListInfo;
  nextNumber: number;
  onNextNumberChange: (num: number) => void;
  formatStyle: NumberFormatStyle;
  onFormatStyleChange: (style: NumberFormatStyle) => void;
  numeralType: NumeralType;
  onNumeralTypeChange: (type: NumeralType) => void;
  preferFillEmptySlots: boolean;
  onPreferFillEmptySlotsChange: (val: boolean) => void;
  filledSlotNumbers: number[];
  filledInEmptySlots: boolean;
}

export const DetectionInfo: React.FC<DetectionInfoProps> = ({
  info,
  nextNumber,
  onNextNumberChange,
  formatStyle,
  onFormatStyleChange,
  numeralType,
  onNumeralTypeChange,
  preferFillEmptySlots,
  onPreferFillEmptySlotsChange,
  filledSlotNumbers,
  filledInEmptySlots,
}) => {
  const hasNumbers = info.highestNumber > 0 || info.lastFoundNumber > 0;

  const formattedAssignedSlots = filledSlotNumbers.map((num) =>
    formatNumberWithNumeralType(num, numeralType, info.detectedNumeralType)
  );

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top metrics bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Detected Last Number */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
          <div className="text-xs text-slate-500 font-medium mb-1 flex items-center justify-center gap-1">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            <span>آخر رقم تم رصده</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            {hasNumbers ? formatNumberWithNumeralType(info.lastFoundNumber, numeralType, info.detectedNumeralType) : '0'}
          </div>
        </div>

        {/* Assigned Numbers / Filled Slots */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <div className="text-xs text-emerald-800 font-medium mb-1 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{filledInEmptySlots ? 'الخانات التي ملئت' : 'الأرقام المحددة'}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {!filledInEmptySlots && (
              <button
                type="button"
                onClick={() => onNextNumberChange(Math.max(1, nextNumber - 1))}
                disabled={nextNumber <= 1}
                className="w-7 h-7 rounded-lg bg-emerald-200/70 hover:bg-emerald-300 active:bg-emerald-400 disabled:opacity-40 text-emerald-900 flex items-center justify-center transition-colors cursor-pointer"
                title="إنقاص الرقم"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="text-lg sm:text-xl font-black text-emerald-900 px-1">
              {formattedAssignedSlots.length > 0 ? (
                formattedAssignedSlots.join('، ')
              ) : (
                <span className="text-sm font-normal text-slate-400">بانتظار الأسماء</span>
              )}
            </div>
            {!filledInEmptySlots && (
              <button
                type="button"
                onClick={() => onNextNumberChange(nextNumber + 1)}
                className="w-7 h-7 rounded-lg bg-emerald-200/70 hover:bg-emerald-300 active:bg-emerald-400 text-emerald-900 flex items-center justify-center transition-colors cursor-pointer"
                title="زيادة الرقم"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Empty slots status / Preserved */}
        <div className="col-span-2 sm:col-span-1 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-center flex flex-col justify-center">
          <div className="text-xs text-amber-800 font-medium mb-1 flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>الخانات الفارغة المرصودة</span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-amber-900">
            {info.hasEmptySlots ? (
              <span className="text-amber-800">
                وجد {info.emptySlotsCount} خانات (مثل {info.emptySlotNumbers.slice(0, 3).join('، ')}..)
              </span>
            ) : (
              <span className="text-slate-500 font-normal">لا توجد خانات فارغة مسبقاً</span>
            )}
          </div>
        </div>
      </div>

      {/* Mode Selector: Fill Empty Slots vs Append at end */}
      {info.hasEmptySlots && (
        <div className="p-3 bg-emerald-50/70 border border-emerald-300/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <div className="text-xs sm:text-sm text-emerald-950 font-semibold">
              توجد خانات فارغة ({info.emptySlotNumbers.join('، ')})
            </div>
          </div>
          <div className="inline-flex rounded-lg border border-emerald-300 bg-white p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onPreferFillEmptySlotsChange(true)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                preferFillEmptySlots
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>ملء الخانات الفارغة مباشرة</span>
            </button>
            <button
              type="button"
              onClick={() => onPreferFillEmptySlotsChange(false)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                !preferFillEmptySlots
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CornerDownLeft className="w-3 h-3" />
              <span>إضافة في نهاية القائمة فقط</span>
            </button>
          </div>
        </div>
      )}

      {/* Format Style Selector */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="font-semibold text-slate-700 flex items-center gap-1.5">
          <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
          <span>تنسيق السطر:</span>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onFormatStyleChange('prefix_hyphen')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              formatStyle === 'prefix_hyphen'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            1- الاسم
          </button>

          <button
            type="button"
            onClick={() => onFormatStyleChange('prefix_space_hyphen')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              formatStyle === 'prefix_space_hyphen'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            1 - الاسم
          </button>

          <button
            type="button"
            onClick={() => onFormatStyleChange('suffix_hyphen')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              formatStyle === 'suffix_hyphen'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            الاسم - 1
          </button>
        </div>
      </div>

      {/* Numeral Digits Selector (Western 123 vs Arabic-Indic ١٢٣) */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-600">
        <span>نوع الأرقام:</span>
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
          <button
            type="button"
            onClick={() => onNumeralTypeChange('auto')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              numeralType === 'auto' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            تلقائي ({info.detectedNumeralType === 'arabic_indic' ? 'شرقية' : 'غربية'})
          </button>
          <button
            type="button"
            onClick={() => onNumeralTypeChange('western')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              numeralType === 'western' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            1, 2, 3
          </button>
          <button
            type="button"
            onClick={() => onNumeralTypeChange('arabic_indic')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              numeralType === 'arabic_indic' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            ١، ٢، ٣
          </button>
        </div>
      </div>
    </div>
  );
};
