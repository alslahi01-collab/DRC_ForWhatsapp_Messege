import React, { useState } from 'react';
import { CheckCheck, Copy, Eye, Check } from 'lucide-react';
import { BigCopyButton } from './BigCopyButton';
import { FormattedAddedLine } from '../utils/detector';

interface OutputViewProps {
  finalText: string;
  lines: FormattedAddedLine[];
  filledInEmptySlots: boolean;
  filledSlotNumbers: number[];
  remainingEmptySlotsCount: number;
}

export const OutputView: React.FC<OutputViewProps> = ({
  finalText,
  lines,
  filledInEmptySlots,
  filledSlotNumbers,
  remainingEmptySlotsCount,
}) => {
  const [copiedPartial, setCopiedPartial] = useState(false);

  const handleCopyNewLinesOnly = async () => {
    const text = lines.map((l) => l.line).join('\n');
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedPartial(true);
      setTimeout(() => setCopiedPartial(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const hasNewLines = lines.length > 0;

  return (
    <div className="bg-white border-2 border-emerald-500/80 rounded-3xl p-5 sm:p-6 shadow-md shadow-emerald-500/10 space-y-5">
      {/* Top Banner */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <CheckCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              النتيجة النهائية جاهزة
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {hasNewLines ? (
                filledInEmptySlots ? (
                  <span className="text-emerald-800 font-semibold">
                    تم وضع البيانات أمام الأرقام الفارغة ({filledSlotNumbers.join('، ')}) مباشرة مع الحفاظ على بقية الخانات!
                  </span>
                ) : (
                  <span>تم إدراج {lines.length} {lines.length === 1 ? 'اسم' : 'أسماء'} في نهاية القائمة بالترقيم التالي بدقة</span>
                )
              ) : (
                <span className="text-slate-500">أدخل اسماً واحداً على الأقل لإدراجه في القائمة</span>
              )}
            </p>
          </div>
        </div>

        {/* Copy only new lines utility */}
        {hasNewLines && (
          <button
            type="button"
            onClick={handleCopyNewLinesOnly}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer"
            title="نسخ الأسطر الجديدة المضافة فقط"
          >
            {copiedPartial ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>نسخ الأسماء المضافة فقط ({lines.length}+)</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* The Big Green COPY Button */}
      <BigCopyButton textToCopy={finalText} disabled={!finalText.trim()} />

      {/* The Final Result Text Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>معاينة النص الكامل المعد للنشر:</span>
          </span>
          <span>{finalText.split(/\r?\n/).length} أسطر</span>
        </div>

        <div className="relative">
          <textarea
            id="final-safety-list-output"
            readOnly
            value={finalText}
            rows={10}
            dir="rtl"
            className="w-full p-4 font-mono text-sm sm:text-base text-slate-800 bg-emerald-50/20 border border-emerald-300 rounded-2xl focus:outline-none leading-relaxed select-all shadow-inner"
          />
        </div>
      </div>
    </div>
  );
};
