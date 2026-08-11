import type { MessageStatus } from "../types/message.types";

type MessageStatusIndicatorProps = {
  status: MessageStatus;
};

const labels: Record<MessageStatus, string> = {
  SENT: "Sent",
  DELIVERED: "Delivered",
  READ: "Read"
};

export function MessageStatusIndicator({
  status
}: MessageStatusIndicatorProps) {
  return (
    <span
      aria-label={`Message status: ${labels[status]}`}
      className="text-[10px] font-medium text-pinglix-100"
    >
      {labels[status]}
    </span>
  );
}
