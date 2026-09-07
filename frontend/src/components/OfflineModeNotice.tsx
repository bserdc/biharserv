import React from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineModeNotice({ mode }: { mode: 'offline' | 'unavailable' }) {
  return (
    <div className="mx-auto mb-4 flex max-w-7xl items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 shadow-sm">
      <WifiOff className="h-4 w-4 shrink-0 text-amber-700" />
      <span>
        <strong>{mode === 'offline' ? 'Offline / Demo Mode.' : 'Backend unavailable.'}</strong>{' '}
        Live Supabase data is not being displayed; fallback or empty data may be shown.
      </span>
    </div>
  );
}