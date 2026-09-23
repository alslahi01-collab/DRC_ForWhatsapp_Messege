import React from 'react';
import { ShieldCheck, RefreshCw, FileText, Info } from 'lucide-react';

interface HeaderProps {
  onLoadSample: () => void;
  onClear: () => void;
  hasInput: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onLoadSample, onClear, hasInput }) => {
  return (
    <header className="mb-6 text-center">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold mb-3 shadow-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>كشف السلامة والاطمئنان التلقائي</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">
        رسالة الطمأنينة
      </h1>

      {/* Subtitle requested by user */}
      <div className="inline-block my-2 px-4 py-1.5 rounded-xl bg-slate-100 border border-slate-200/90 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs">
        برنامج من إعداد م.محمد يحيى الصلاحي - التطبيق معد لمهمة مؤقتة
      </div>

      <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed px-4 mt-1">
        أدخل أسماءك وسيحفظها التطبيق دائماً. الصق كشف السلامة، وسيقوم التطبيق بالتعرف على الأرقام الفارغة (مثل 13- و 14-) ووضع أسمائكم أمامها فوراً، أو إضافتها في نهاية الكشف بالترقيم التالي.
      </p>

      {/* Action shortcuts */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          type="button"
          onClick={onLoadSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-xs cursor-pointer"
          title="تجربة قائمة نموذجية (1-12 معبأة وخانات 13-20 فارغة)"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          <span>تجربة نموذج كشف (1-12 معبأة وخانات 13-20 فارغة)</span>
        </button>

        {hasInput && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
            title="مسح الحقول للبدء من جديد"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>مسح نص الكشف</span>
          </button>
        )}
      </div>
    </header>
  );
};
