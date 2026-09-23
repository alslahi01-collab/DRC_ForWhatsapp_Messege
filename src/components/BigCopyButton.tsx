import React, { useState } from 'react';
import { Copy, Check, Share2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BigCopyButtonProps {
  textToCopy: string;
  disabled?: boolean;
}

export const BigCopyButton: React.FC<BigCopyButtonProps> = ({ textToCopy, disabled = false }) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopy = async () => {
    if (!textToCopy || disabled) return;

    let success = false;

    // Modern Clipboard API
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        success = true;
      } catch (err) {
        console.warn('Clipboard API writeText failed, attempting fallback...', err);
      }
    }

    // Fallback using textarea + execCommand for iframes / older browsers
    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
    }

    if (success) {
      setCopied(true);
      setCopyError(false);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } else {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  };

  const handleWhatsAppShare = () => {
    if (!textToCopy) return;
    const encoded = encodeURIComponent(textToCopy);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full space-y-3">
      {/* The Big Green COPY Button */}
      <motion.button
        type="button"
        id="big-green-copy-button"
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={handleCopy}
        disabled={disabled}
        className={`w-full relative overflow-hidden py-4 sm:py-5 px-6 rounded-2xl font-bold text-lg sm:text-xl md:text-2xl text-white shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 select-none ${
          disabled
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
            : copied
            ? 'bg-emerald-700 shadow-emerald-700/30'
            : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-emerald-600/35 hover:shadow-emerald-600/50'
        }`}
      >
        {copied ? (
          <>
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <Check className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
            </motion.div>
            <span>تم نسخ القائمة كاملة بنجاح!</span>
          </>
        ) : (
          <>
            <Copy className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            <span>نسخ النتيجة النهائية</span>
            <span className="hidden sm:inline-block text-xs bg-emerald-700/60 px-2.5 py-1 rounded-full font-medium">
              جاهزة للصق فوراً
            </span>
          </>
        )}
      </motion.button>

      {/* Copy Notification Toast / Banner */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>تم الحفظ في الحافظة بنجاح! يمكنك الآن الذهاب إلى تطبيق واتساب والضغط على «لصق» (Paste).</span>
          </motion.div>
        )}
        {copyError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-center text-sm font-medium"
          >
            تعذر النسخ التلقائي بسبب قيود المتصفح. يرجى تحديد النص يدوياً ونسخه.
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Share Button */}
      {!disabled && (
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-emerald-700" />
          <span>إرسال أو مشاركة مباشرة عبر واتساب</span>
        </button>
      )}
    </div>
  );
};
