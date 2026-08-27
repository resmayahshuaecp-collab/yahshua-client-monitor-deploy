/**
 * The six cards named in the plan's Milestone 0 story. Every value is a
 * placeholder; Milestone 1 wires the first four and Milestone 2 the last
 * two.
 *
 * Lives here rather than in the page module: a Next.js page module may
 * only export `default` plus a fixed set of framework fields (`metadata`,
 * `generateStaticParams`, etc). Exporting anything else -- including this
 * constant, previously exported straight from `page.tsx` so the test could
 * import it -- fails `next build` outright with "is not a valid Page
 * export field."
 */
export const DASHBOARD_STATS = [
  { label: "Total Subscription Clients", hint: "Globe and SME combined" },
  { label: "Globe Clients", hint: "Active, expiring and expired" },
  { label: "SME Clients", hint: "Active, expiring and expired" },
  { label: "Active Contracts", hint: "Not expiring within 30 days" },
  { label: "Open Client Concerns", hint: "Bugs and RSC not yet resolved" },
  { label: "Meetings This Week", hint: "Booked, Monday to Sunday" },
] as const;
