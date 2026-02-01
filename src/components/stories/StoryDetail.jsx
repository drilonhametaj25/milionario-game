import { cn } from '../../lib/utils';
import Button from '../ui/Button';

/**
 * Dettagli completi di una storia
 * @param {{
 *   story: import('../../lib/stories/types').Story,
 *   played?: boolean,
 *   onSelect?: () => void,
 *   onBack?: () => void,
 *   loading?: boolean
 * }} props
 */
export default function StoryDetail({
  story,
  played = false,
  onSelect,
  onBack,
  loading = false
}) {
  if (!story) return null;

  return (
    <div className="space-y-6">
      {/* Header con back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Torna alle storie</span>
        </button>
      )}

      {/* Hero section */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className={cn(
          'absolute inset-0 opacity-20',
          played
            ? 'bg-gradient-to-br from-green-500 to-green-700'
            : 'bg-gradient-to-br from-amber-500 to-amber-700'
        )} />

        <div className="relative z-10">
          <div className="flex items-start gap-6">
            {/* Large emoji */}
            <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-black/20 flex items-center justify-center text-6xl">
              {story.emoji || '🎭'}
            </div>

            {/* Title and meta */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-white">
                  {story.title}
                </h1>
                {played ? (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    Completata
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Da giocare
                  </span>
                )}
              </div>

              {story.tagline && (
                <p className="text-xl text-white/80 mt-2 italic">
                  "{story.tagline}"
                </p>
              )}

              {/* Meta badges */}
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/20 text-white/70 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {story.min_players}-{story.max_players} giocatori
                </div>

                {story.setting && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/20 text-white/70 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {story.setting}
                  </div>
                )}

                {story.has_accomplice && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 text-sm">
                    <span>🤝</span>
                    Complice ({story.accomplice_threshold}+ giocatori)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {story.description && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Descrizione
          </h2>
          <p className="text-white/80 whitespace-pre-line leading-relaxed">
            {story.description}
          </p>
        </div>
      )}

      {/* Action button */}
      {onSelect && (
        <div className="flex justify-center">
          <Button
            onClick={onSelect}
            disabled={loading}
            size="lg"
            className="px-12"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Caricamento...
              </span>
            ) : played ? (
              'Gioca di nuovo'
            ) : (
              'Seleziona questa storia'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Mini preview della storia per la lobby/create
 */
export function StoryPreview({ story, className = '' }) {
  if (!story) return null;

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10',
      className
    )}>
      <span className="text-2xl">{story.emoji || '🎭'}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white truncate">{story.title}</div>
        {story.tagline && (
          <div className="text-xs text-white/50 truncate">{story.tagline}</div>
        )}
      </div>
    </div>
  );
}
