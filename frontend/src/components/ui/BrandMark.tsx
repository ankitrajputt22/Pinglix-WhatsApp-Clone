import { Icon } from "./Icon";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({
  compact = false,
  className = ""
}: BrandMarkProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pinglix-700 text-white shadow-sm">
        <Icon name="chat" className="h-6 w-6" />
      </span>
      {compact ? null : (
        <span className="text-2xl font-bold tracking-[-0.04em] text-pinglix-800">
          Pinglix
        </span>
      )}
    </div>
  );
}
