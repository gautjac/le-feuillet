// Small inline icon set — crisp, 1.6px strokes, currentColor.
type P = { className?: string };
const S = (props: { children: React.ReactNode } & P) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    aria-hidden="true"
  >
    {props.children}
  </svg>
);

export const IconBold = (p: P) => (
  <S {...p}>
    <path d="M6 4h7a4 4 0 0 1 0 8H6zM6 12h8a4 4 0 0 1 0 8H6z" />
  </S>
);
export const IconItalic = (p: P) => (
  <S {...p}>
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </S>
);
export const IconUnderline = (p: P) => (
  <S {...p}>
    <path d="M6 3v7a6 6 0 0 0 12 0V3" />
    <line x1="4" y1="21" x2="20" y2="21" />
  </S>
);
export const IconStrike = (p: P) => (
  <S {...p}>
    <path d="M16 5H9.5a3.5 3.5 0 0 0-1.4 6.7" />
    <path d="M8 19h6.5a3.5 3.5 0 0 0 1.4-6.7" />
    <line x1="4" y1="12" x2="20" y2="12" />
  </S>
);
export const IconLink = (p: P) => (
  <S {...p}>
    <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
    <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
  </S>
);
export const IconH1 = (p: P) => (
  <S {...p}>
    <path d="M4 6v12M12 6v12M4 12h8" />
    <path d="M17 10l3-2v10" />
  </S>
);
export const IconH2 = (p: P) => (
  <S {...p}>
    <path d="M4 6v12M11 6v12M4 12h7" />
    <path d="M15 9a2.5 2.5 0 1 1 4 2c-1 1.2-4 3-4 3v1h5" />
  </S>
);
export const IconH3 = (p: P) => (
  <S {...p}>
    <path d="M4 6v12M11 6v12M4 12h7" />
    <path d="M15 8.5a2 2 0 1 1 2.5 2.5A2 2 0 1 1 15 15" />
  </S>
);
export const IconQuote = (p: P) => (
  <S {...p}>
    <path d="M7 7H4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2v3a2 2 0 0 1-2 2" />
    <path d="M18 7h-3a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2v3a2 2 0 0 1-2 2" />
  </S>
);
export const IconList = (p: P) => (
  <S {...p}>
    <line x1="9" y1="6" x2="20" y2="6" />
    <line x1="9" y1="12" x2="20" y2="12" />
    <line x1="9" y1="18" x2="20" y2="18" />
    <circle cx="4" cy="6" r="1" />
    <circle cx="4" cy="12" r="1" />
    <circle cx="4" cy="18" r="1" />
  </S>
);
export const IconOrdered = (p: P) => (
  <S {...p}>
    <line x1="10" y1="6" x2="20" y2="6" />
    <line x1="10" y1="12" x2="20" y2="12" />
    <line x1="10" y1="18" x2="20" y2="18" />
    <path d="M4 6V4l-1 .5M3 18h2M4 14v3" />
  </S>
);
export const IconCode = (p: P) => (
  <S {...p}>
    <polyline points="8 7 3 12 8 17" />
    <polyline points="16 7 21 12 16 17" />
  </S>
);
export const IconRule = (p: P) => (
  <S {...p}>
    <line x1="3" y1="12" x2="21" y2="12" />
  </S>
);
export const IconImage = (p: P) => (
  <S {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M3 16l5-4 4 3 3-2 6 5" />
  </S>
);
export const IconSearch = (p: P) => (
  <S {...p}>
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" />
  </S>
);
export const IconPlus = (p: P) => (
  <S {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </S>
);
export const IconPublish = (p: P) => (
  <S {...p}>
    <path d="M12 19V6" />
    <path d="m6 12 6-6 6 6" />
    <path d="M5 21h14" />
  </S>
);
export const IconEye = (p: P) => (
  <S {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </S>
);
export const IconCopy = (p: P) => (
  <S {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </S>
);
export const IconDownload = (p: P) => (
  <S {...p}>
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M5 21h14" />
  </S>
);
export const IconRename = (p: P) => (
  <S {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </S>
);
export const IconTrash = (p: P) => (
  <S {...p}>
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
  </S>
);
export const IconSpark = (p: P) => (
  <S {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4Z" />
  </S>
);
export const IconBook = (p: P) => (
  <S {...p}>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
    <path d="M4 19a2 2 0 0 1 2-2h13" />
  </S>
);
