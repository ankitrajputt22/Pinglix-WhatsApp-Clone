import { useCallback, useEffect, useRef } from "react";

import { stompClient } from "../../../lib/stomp-client";

export function useTypingIndicator(
  conversationId: number,
  enabled = true
) {
  const active = useRef(false);

  const stopTyping = useCallback(() => {
    if (!active.current) {
      return;
    }
    stompClient.publish(
      `/app/conversations/${conversationId}/typing.stop`
    );
    active.current = false;
  }, [conversationId]);

  const startTyping = useCallback(() => {
    if (!enabled || active.current) {
      return;
    }
    if (stompClient.publish(
      `/app/conversations/${conversationId}/typing.start`
    )) {
      active.current = true;
    }
  }, [conversationId, enabled]);

  useEffect(() => () => stopTyping(), [stopTyping]);

  return { startTyping, stopTyping };
}
