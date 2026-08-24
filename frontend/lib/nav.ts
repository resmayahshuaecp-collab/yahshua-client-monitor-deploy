/**
 * The one list of sections. `built: false` means the route does not exist
 * yet, and the sidebar renders it disabled rather than linking to a 404.
 * Flip the flag in the same change that adds the page -- that is what keeps
 * the nav honest about what is reachable.
 */
export const NAV_SECTIONS = [
  { label: "Dashboard", href: "/dashboard", built: true },
  { label: "Globe Clients", href: "/globe", built: false },
  { label: "SME Clients", href: "/sme", built: false },
  { label: "Bugs", href: "/bugs", built: false },
  { label: "RSC", href: "/rsc", built: false },
  { label: "Meetings", href: "/meetings", built: false },
  { label: "Reports", href: "/reports", built: false },
  { label: "Training", href: "/training", built: false },
] as const;
