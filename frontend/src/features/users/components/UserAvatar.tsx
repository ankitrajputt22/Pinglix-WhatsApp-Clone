type UserAvatarProps = {
  displayName: string;
  profileImageUrl: string | null;
  size?: "small" | "medium" | "large";
};

export function UserAvatar({
  displayName,
  profileImageUrl,
  size = "small"
}: UserAvatarProps) {
  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";
  const resolvedSizing =
    size === "large"
      ? "h-16 w-16 text-xl"
      : size === "medium"
        ? "h-12 w-12 text-sm"
        : "h-10 w-10 text-sm";

  if (profileImageUrl) {
    return (
      <img
        src={profileImageUrl}
        alt={`${displayName} profile`}
        className={`${resolvedSizing} shrink-0 rounded-full border border-slate-200 object-cover shadow-sm`}
      />
    );
  }

  return (
    <span
      aria-label={`${displayName} profile placeholder`}
      className={`${resolvedSizing} flex shrink-0 items-center justify-center rounded-full border border-pinglix-200 bg-pinglix-100 font-bold text-pinglix-800 shadow-sm`}
    >
      {initials}
    </span>
  );
}
