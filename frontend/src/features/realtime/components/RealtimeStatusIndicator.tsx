import type { RealtimeConnectionStatus } from "../types/realtime.types";

type RealtimeStatusIndicatorProps = {
  status: RealtimeConnectionStatus;
  compact?: boolean;
};

const statusDetails: Record<
  RealtimeConnectionStatus,
  { label: string; color: string }
> = {
  idle: { label: "Connecting...", color: "bg-amber-400" },
  connecting: { label: "Connecting...", color: "bg-amber-400" },
  connected: { label: "Live", color: "bg-emerald-500" },
  disconnected: { label: "Disconnected", color: "bg-slate-400" },
  reconnecting: { label: "Reconnecting...", color: "bg-amber-400" },
  error: { label: "Disconnected", color: "bg-rose-500" }
};

export function RealtimeStatusIndicator({
  status,
  compact = false
}: RealtimeStatusIndicatorProps) {
  const details = statusDetails[status];

  return (
    <span
      role="status"
      aria-live="polite"
      title="Real-time connection status"
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white font-semibold text-muted shadow-sm ${
        compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${details.color}`}
      />
      {details.label}
    </span>
  );
}
