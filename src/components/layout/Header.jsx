import { useState } from 'react';
import { cn, copyToClipboard, generateShareUrl } from '../../lib/utils';
import { useToast } from '../ui/Toast';

export default function Header({
  roomCode,
  showCode = true,
  title,
  onBack,
  rightContent,
}) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await copyToClipboard(generateShareUrl(roomCode));
      setCopied(true);
      addToast('Link copiato!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Impossibile copiare', 'error');
    }
  };

  return (
    <header className="glass sticky top-0 z-40 px-4 py-3 safe-area-top">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-white/60 hover:text-white transition-colors touch-target"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {title && (
            <h1 className="text-lg font-bold text-white">{title}</h1>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {showCode && roomCode && (
            <button
              onClick={handleCopyCode}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg',
                'bg-white/10 hover:bg-white/20 transition-all',
                copied && 'bg-green-500/20'
              )}
            >
              <span className="font-mono font-bold text-gold">
                {roomCode}
              </span>
              <svg
                className={cn(
                  'w-4 h-4',
                  copied ? 'text-green-400' : 'text-white/60'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {copied ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                )}
              </svg>
            </button>
          )}

          {rightContent}
        </div>
      </div>
    </header>
  );
}
