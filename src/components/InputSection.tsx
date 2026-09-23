import React, { useState, useRef } from 'react';
import { ClipboardPaste, Trash2, ListChecks, Check, AlertCircle } from 'lucide-react';

interface InputSectionProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  lineCount: number;
}

export const InputSection: React.FC<InputSectionProps> = ({
  value,
  onChange,
  onClear,
  lineCount,
}) => {
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = async () => {
    // 1. Try modern Async Clipboard API first
    if (navigator?.clipboard?.readText) {
      try {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText.trim()) {
          onChange(clipText);
          setPasteSuccess(true);
          setPasteNotice(null);
          setTimeout(() => setPasteSuccess(false), 2000);
          return;
        } else if (clipText === '') {
          setPasteNotice('الحافظة فارغة حالياً!');
          setTimeout(() => setPasteNotice(null), 3500);
          return;
        }
      } catch (err) {
        console.warn('Clipboard readText blocked or permission denied:', err);
        // Continue to fallback
      }
    }

    // 2. Fallback for browsers/iframes where readText permission is blocked or unsupported:
    // Focus the textarea and prompt user directly or attempt execCommand if available
    if (textareaRef.current) {
      textareaRef.current.focus();
      try {
        const success = document.execCommand('paste');
        if (success) {
          setPasteSuccess(true);
          setPasteNotice(null);
          setTimeout(() => setPasteSuccess(false), 2000);
          return;
        }
      } catch (e) {
        // execCommand paste is often restricted in modern browsers for security
      }

      // If both fail due to browser security policy inside iframe:
      setPasteNotice('اضغط مطولاً داخل المربع أو (Ctrl+V) للصق، حيث يطلب متصفحك إذناً يدوياً');
      setTimeout(() => setPasteNotice(null), 5000);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
      {/* Title & Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <ListChecks className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              القائمة الأصلية (الصق الكشف هنا)
            </h2>
            <p className="text-xs text-slate-500">
              الأسطر السابقة ستبقى كما هي تماماً، وسيتم الحفاظ على الخانات الفارغة (15-20)
            </p>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePaste}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
              pasteSuccess
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 active:bg-emerald-200'
            }`}
            title="لصق النص المنسوخ من الحافظة"
          >
            {pasteSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>تم اللصق بنجاح!</span>
              </>
            ) : (
              <>
                <ClipboardPaste className="w-3.5 h-3.5 text-emerald-700" />
                <span>لصق من الحافظة</span>
              </>
            )}
          </button>

          {value && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors cursor-pointer"
              title="مسح النص"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح</span>
            </button>
          )}
        </div>
      </div>

      {/* Helpful notification if browser blocks automatic clipboard reading */}
      {pasteNotice && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{pasteNotice}</span>
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id="original-safety-list-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={7}
          dir="rtl"
          placeholder={`الصق كشف السلامة هنا، مثل:\n1- فلان / صنعاء / آمن\n2- فلان / إب / آمن\n...`}
          className="w-full p-3.5 sm:p-4 text-sm sm:text-base font-mono text-slate-800 bg-slate-50/60 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-y leading-relaxed placeholder:text-slate-400"
        />

        {/* Counter Badge */}
        {value && (
          <div className="absolute bottom-3 left-3 text-[11px] font-medium bg-white/90 backdrop-blur-xs border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md pointer-events-none">
            {lineCount} أسطر
          </div>
        )}
      </div>
    </div>
  );
};
