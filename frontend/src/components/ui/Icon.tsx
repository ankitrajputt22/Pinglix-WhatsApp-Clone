import type { SVGProps } from "react";

export type IconName =
  | "alert"
  | "arrow-left"
  | "arrow-right"
  | "chat"
  | "check"
  | "eye"
  | "eye-off"
  | "health"
  | "lock"
  | "logout"
  | "mail"
  | "network"
  | "plus-chat"
  | "profile"
  | "refresh"
  | "search"
  | "shield"
  | "users";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export function Icon({ name, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {name === "alert" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5v5" />
          <path d="M12 16.5h.01" />
        </>
      ) : null}
      {name === "arrow-left" ? (
        <>
          <path d="M19 12H5" />
          <path d="m10 7-5 5 5 5" />
        </>
      ) : null}
      {name === "arrow-right" ? (
        <>
          <path d="M5 12h14" />
          <path d="m14 7 5 5-5 5" />
        </>
      ) : null}
      {name === "chat" ? (
        <>
          <path d="M5 5.5h14v10H9l-4 3v-13Z" />
          <path d="M8.5 9h7" />
          <path d="M8.5 12h4.5" />
        </>
      ) : null}
      {name === "check" ? (
        <path d="m5 12.5 4.2 4.2L19 7" />
      ) : null}
      {name === "eye" ? (
        <>
          <path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" />
          <circle cx="12" cy="12" r="2.2" />
        </>
      ) : null}
      {name === "eye-off" ? (
        <>
          <path d="m3 3 18 18" />
          <path d="M10.5 7.1A10 10 0 0 1 12 7c6 0 9.5 5 9.5 5a14 14 0 0 1-2.1 2.5" />
          <path d="M6.2 6.2C3.8 7.7 2.5 12 2.5 12s3.5 5 9.5 5c1 0 2-.1 2.8-.4" />
        </>
      ) : null}
      {name === "health" ? (
        <>
          <path d="M4 12h3l2-5 4 10 2-5h5" />
          <path d="M12 21a9 9 0 1 0-9-9" />
        </>
      ) : null}
      {name === "lock" ? (
        <>
          <rect x="5.5" y="10" width="13" height="10" rx="2" />
          <path d="M8.5 10V7a3.5 3.5 0 0 1 7 0v3" />
          <path d="M12 14v2" />
        </>
      ) : null}
      {name === "logout" ? (
        <>
          <path d="M10 5H5v14h5" />
          <path d="M14 8l4 4-4 4" />
          <path d="M8 12h10" />
        </>
      ) : null}
      {name === "mail" ? (
        <>
          <rect x="3" y="5.5" width="18" height="13" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </>
      ) : null}
      {name === "network" ? (
        <>
          <circle cx="12" cy="5" r="2" />
          <circle cx="5" cy="15" r="2" />
          <circle cx="19" cy="15" r="2" />
          <circle cx="12" cy="19" r="2" />
          <path d="m10.8 6.6-4.6 6.8M13.2 6.6l4.6 6.8M7 15h10M12 7v10" />
        </>
      ) : null}
      {name === "plus-chat" ? (
        <>
          <path d="M4 5h16v11H9l-5 3V5Z" />
          <path d="M12 8v5M9.5 10.5h5" />
        </>
      ) : null}
      {name === "profile" ? (
        <>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c.7-4 3.1-6 7-6s6.3 2 7 6" />
        </>
      ) : null}
      {name === "refresh" ? (
        <>
          <path d="M20 6v5h-5" />
          <path d="M18.2 15.5A7 7 0 1 1 19 9l1 2" />
        </>
      ) : null}
      {name === "search" ? (
        <>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 4 4" />
        </>
      ) : null}
      {name === "shield" ? (
        <>
          <path d="M12 3 5.5 6v5.2c0 4.2 2.5 7.7 6.5 9.8 4-2.1 6.5-5.6 6.5-9.8V6L12 3Z" />
          <path d="m9 12 2 2 4-4" />
        </>
      ) : null}
      {name === "users" ? (
        <>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c.5-3.5 2.3-5.5 5.5-5.5s5 2 5.5 5.5" />
          <path d="M15 6.5a3 3 0 0 1 0 5.8M16 14c2.7.4 4 2.1 4.5 5" />
        </>
      ) : null}
    </svg>
  );
}
