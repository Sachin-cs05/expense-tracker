const paths = {
  home: "M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9",
  wallet: "M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm14 6.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z",
  trendingUp: "M3 17 9 11l4 4 8-8M15 7h6v6",
  barChart: "M4 20V10M10 20V4M16 20v-7M4 20h16",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-3.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  piggyBank: "M4 12a5 5 0 0 1 5-5h4a5 5 0 0 1 5 4h1.5l.8 2-1.3 1v2a2 2 0 0 1-2 2h-1v2h-3v-2H9v2H6v-2.6A5 5 0 0 1 4 13v-1Zm5-3.5V7",
  repeat: "m17 2 4 4-4 4M3 12v-2a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 12v2a4 4 0 0 1-4 4H3",
  tag: "M3 11V5a2 2 0 0 1 2-2h6l10 10-8 8L3 11Zm5-4.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z",
  grid: "M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z",
  upload: "M12 16V4m0 0 4 4m-4-4-4 4M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8.4-3.5a8.4 8.4 0 0 0-.15-1.6l2.1-1.6-2-3.5-2.5 1a8.3 8.3 0 0 0-2.7-1.6L14.7 2H9.3l-.45 2.7a8.3 8.3 0 0 0-2.7 1.6l-2.5-1-2 3.5 2.1 1.6a8.4 8.4 0 0 0 0 3.2l-2.1 1.6 2 3.5 2.5-1a8.3 8.3 0 0 0 2.7 1.6L9.3 22h5.4l.45-2.7a8.3 8.3 0 0 0 2.7-1.6l2.5 1 2-3.5-2.1-1.6c.1-.5.15-1 .15-1.6Z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  moon: "M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z",
  monitor: "M3 4h18v12H3V4Zm5 16h8m-4-4v4",
  plus: "M12 5v14M5 12h14",
  x: "M6 6l12 12M18 6 6 18",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z",
  trash: "M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35",
  chevronDown: "m6 9 6 6 6-6",
  chevronRight: "m9 18 6-6-6-6",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9ZM13.7 21a2 2 0 0 1-3.4 0",
  user: "M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm-8 9a8 8 0 0 1 16 0",
  logOut: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  check: "M20 6 9 17l-5-5",
  alertTriangle: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4m0 4h.01",
  download: "M12 3v12m0 0 4-4m-4 4-4-4M4 21h16",
  filter: "M22 3H2l8 9.5V19l4 2v-8.5L22 3Z",
  calendar: "M8 2v4M16 2v4M3 9h18M4 5h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  arrowUpRight: "M7 17 17 7M8 7h9v9",
  arrowDownRight: "M7 7l10 10M17 8v9H8",
  creditCard: "M2 8h20M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Zm4 8h4",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 8h.01M11 12h1v5h1",
  mail: "M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z",
  lock: "M5 11h14v10H5V11Zm3 0V7a4 4 0 0 1 8 0v4",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  eyeOff: "M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20",
  arrowRight: "M5 12h14m-6-6 6 6-6 6",
  leaf: "M11 20A7 7 0 0 1 4 13C4 7 11 3 20 3c0 9-4 16-9 17Zm0 0c-1.5-3-1.5-6.5 0-9.5",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
};

export function Icon({ name, size = 18, strokeWidth = 1.8, className = "" }) {
  const path = paths[name];
  if (!path) return null;

  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
