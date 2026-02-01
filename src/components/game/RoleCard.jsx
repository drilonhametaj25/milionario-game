import { useState } from 'react';
import { cn } from '../../lib/utils';
import { ROLES } from '../../lib/roles';

export default function RoleCard({ roleId, collapsed = false, onToggle }) {
  const role = ROLES[roleId];

  if (!role) return null;

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden transition-all duration-300',
        `bg-gradient-to-br ${role.color}`
      )}
    >
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-3 hover:bg-black/10 transition-colors"
      >
        <span className="text-3xl">{role.emoji}</span>
        <div className="flex-1 text-left">
          <h3 className="font-bold text-white text-lg">{role.name}</h3>
          <p className="text-white/70 text-sm">
            {collapsed ? 'Tocca per espandere' : 'Tocca per minimizzare'}
          </p>
        </div>
        <svg
          className={cn(
            'w-6 h-6 text-white/70 transition-transform',
            !collapsed && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Description - collapsible */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <div className="glass-dark rounded-xl p-4">
            <p className="text-white/90 text-sm whitespace-pre-line">
              {role.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
