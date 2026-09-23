import React, { useState } from 'react';
import { UserPlus, Trash2, Users, Save, Check, Sparkles, AlertCircle } from 'lucide-react';
import { AddedPerson } from '../types';
import { FormattedAddedLine } from '../utils/detector';
import { createEmptyPerson } from '../utils/storage';

interface PersonCustomizerProps {
  persons: AddedPerson[];
  formattedLines: FormattedAddedLine[];
  onAddPerson: () => void;
  onRemovePerson: (id: string) => void;
  onUpdatePerson: (id: string, updated: Partial<AddedPerson>) => void;
  onSave: () => void;
  hasUnsavedChanges: boolean;
}

export const PersonCustomizer: React.FC<PersonCustomizerProps> = ({
  persons,
  formattedLines,
  onAddPerson,
  onRemovePerson,
  onUpdatePerson,
  onSave,
  hasUnsavedChanges,
}) => {
  const [justSaved, setJustSaved] = useState(false);

  const handleSaveClick = () => {
    onSave();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const validPersonsCount = persons.filter((p) => p.name.trim().length > 0).length;

  return (
    <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>بيانات الأشخاص المراد إضافتهم</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                {validPersonsCount} {validPersonsCount === 1 ? 'اسم' : 'أسماء'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              أدخل اسماً أو أكثر، وسيتم حفظ بياناتك تلقائياً في جهازك لاستخدامها دائماً.
            </p>
          </div>
        </div>

        {/* Action Buttons: Add person & Save button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onAddPerson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة اسم آخر</span>
          </button>

          <button
            type="button"
            onClick={handleSaveClick}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
              justSaved
                ? 'bg-emerald-700 text-white border-emerald-700'
                : hasUnsavedChanges
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 animate-pulse'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="حفظ الأسماء في هذا المتصفح"
          >
            {justSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>تم الحفظ!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-emerald-600" />
                <span>حفظ البيانات</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Persons Form Cards */}
      <div className="space-y-3">
        {persons.map((person, index) => {
          const isOnlyOne = persons.length === 1;
          const correspondingLine = formattedLines.find((l) => l.id === person.id);

          return (
            <div
              key={person.id}
              className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200/90 shadow-xs space-y-2.5 transition-all hover:border-emerald-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {person.name.trim() ? person.name : `الاسم #${index + 1}`}
                  </span>
                </div>

                {!isOnlyOne && (
                  <button
                    type="button"
                    onClick={() => onRemovePerson(person.id)}
                    className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                    title="حذف هذا الشخص"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                )}
              </div>

              {/* Input Fields: Name, City, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    الاسم الكامل:
                  </label>
                  <input
                    type="text"
                    value={person.name}
                    onChange={(e) => onUpdatePerson(person.id, { name: e.target.value })}
                    placeholder="مثال: أحمد علي"
                    dir="rtl"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    المحافظة / المدينة:
                  </label>
                  <input
                    type="text"
                    value={person.city}
                    onChange={(e) => onUpdatePerson(person.id, { city: e.target.value })}
                    placeholder="مثال: صنعاء، إب، تعز..."
                    dir="rtl"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    الحالة:
                  </label>
                  <input
                    type="text"
                    value={person.status}
                    onChange={(e) => onUpdatePerson(person.id, { status: e.target.value })}
                    placeholder="مثال: آمن"
                    dir="rtl"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Inline Preview */}
              {correspondingLine && (
                <div className="pt-1.5 flex items-center gap-2 text-xs text-slate-600 font-mono bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                  <span className="text-emerald-700 font-bold shrink-0">الشكل الناتج:</span>
                  <span className="text-slate-800 truncate select-all">{correspondingLine.line}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info message if no names filled yet */}
      {validPersonsCount === 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>يرجى كتابة اسم الشخص أولاً ليتم إدراجه تلقائياً أمام الخانة الفارغة أو في نهاية القائمة.</span>
        </div>
      )}

      {/* Auto-save notification note */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span className="flex items-center gap-1 text-emerald-800">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>يتم الحفظ تلقائياً في ذاكرة المتصفح للزيارات القادمة.</span>
        </span>
      </div>
    </div>
  );
};
