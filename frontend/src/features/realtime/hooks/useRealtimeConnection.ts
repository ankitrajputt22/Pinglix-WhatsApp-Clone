import { useCallback, useEffect, useSyncExternalStore } from "react";

import { stompClient } from "../../../lib/stomp-client";

export function useRealtimeConnection(enabled: boolean) {
  const status = useSyncExternalStore(
    stompClient.subscribeToStatus,
    stompClient.getStatus,
    stompClient.getStatus
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    stompClient.connect();
    return () => stompClient.scheduleDisconnect();
  }, [enabled]);

  const disconnect = useCallback(() => stompClient.disconnect(), []);
  return { status, disconnect };
}
