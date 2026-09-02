/**
 * The one list of sections. `built: false` means the route does not exist
 * yet, and the sidebar renders it disabled rather than linking to a 404.
 * Flip the flag in the same change that adds the page -- that is what keeps
 * the nav honest about what is reachable.
 */
export const NAV_SECTIONS = [
  { label: "Dashboard", href: "/dashboard", built: true },
  { label: "Globe Clients", href: "/globe", built: true },
  { label: "SME Clients", href: "/sme", built: true },
  { label: "Globe Group Chat", href: "/communication/globe-chat", built: true },
  { label: "SME Group Chat", href: "/communication/sme-chat", built: true },
  { label: "Bugs", href: "/bugs", built: true },
  { label: "RSC", href: "/rsc", built: false },
  { label: "Meetings", href: "/meetings", built: false },
  { label: "Reports", href: "/reports", built: true },
  { label: "Training Videos", href: "/training/videos", built: true },
  { label: "Training Materials", href: "/training/materials", built: true },
  { label: "Client Contracts", href: "/training/contracts", built: true },
] as const;
