type UserAvatarProps = {
  displayName: string;
  profileImageUrl: string | null;
  size?: "small" | "large";
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
  const sizing = size === "large" ? "h-16 w-16 text-xl" : "h-11 w-11 text-sm";

  if (profileImageUrl) {
    return (
      <img
        src={profileImageUrl}
        alt={`${displayName} profile`}
        className={`${sizing} shrink-0 rounded-2xl object-cover`}
      />
    );
  }

  return (
    <span
      aria-label={`${displayName} profile placeholder`}
      className={`${sizing} flex shrink-0 items-center justify-center rounded-2xl bg-pinglix-100 font-bold text-pinglix-700`}
    >
      {initials}
    </span>
  );
}
