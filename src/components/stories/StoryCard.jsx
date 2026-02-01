import { cn } from '../../lib/utils';

/**
 * Card per visualizzare una storia nella lista di selezione
 * @param {{
 *   story: import('../../lib/stories/types').Story,
 *   played: boolean,
 *   onClick: () => void,
 *   selected?: boolean,
 *   disabled?: boolean
 * }} props
 */
export default function StoryCard({
  story,
  played = false,
  onClick,
  selected = false,
  disabled = false
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left glass rounded-2xl p-5 transition-all duration-300',
        'border-2 border-transparent',
        'hover:scale-[1.02] hover:border-white/20',
        selected && 'border-amber-400/50 bg-amber-500/10',
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
        !disabled && 'cursor-pointer'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Emoji/Cover */}
        <div className={cn(
          'flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-4xl',
          'bg-gradient-to-br',
          played ? 'from-green-500/20 to-green-600/20' : 'from-amber-500/20 to-amber-600/20'
        )}>
          {story.emoji || '🎭'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white truncate">
              {story.title}
            </h3>
            {/* Status badge */}
            {played ? (
              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                Giocata
              </span>
            ) : (
              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                Nuova
              </span>
            )}
          </div>

          {story.tagline && (
            <p className="text-white/60 text-sm mt-1 line-clamp-2">
              {story.tagline}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {story.min_players}-{story.max_players} giocatori
            </span>
            {story.setting && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {story.setting}
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          'bg-white/5 text-white/40',
          selected && 'bg-amber-500/20 text-amber-400'
        )}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

/**
 * Versione compatta della card per spazi ridotti
 */
export function StoryCardCompact({ story, played = false, onClick, selected = false }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full p-3 rounded-xl glass transition-all',
        'border border-transparent hover:border-white/20',
        selected && 'border-amber-400/50 bg-amber-500/10'
      )}
    >
      <span className="text-2xl">{story.emoji || '🎭'}</span>
      <span className="flex-1 text-left font-medium text-white truncate">
        {story.title}
      </span>
      {played && (
        <span className="text-green-400 text-sm">✓</span>
      )}
    </button>
  );
}
