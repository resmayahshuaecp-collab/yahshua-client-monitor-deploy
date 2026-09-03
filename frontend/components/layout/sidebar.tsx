"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Bot, ChevronDown, ChevronRight, CircleHelp, FileText, Gauge, LayoutDashboard, MessageCircle, Settings, Video, Wrench } from "lucide-react";
import { cn } from "@/lib/cn";

type Child = { label: string; href?: string; subtext?: string; disabled?: boolean };
type Group = { label: string; icon: typeof Video; href: string; children: Child[] };

const GROUPS: Group[] = [
  { label: "Consultant Onboarding", icon: Video, href: "/training", children: [
    { label: "Training Videos", href: "/training/videos", subtext: "YBO Features & Modules" },
    { label: "Training Materials", href: "/training/materials" },
    { label: "Client Contracts", href: "/training/contracts", subtext: "SME & Globe" },
  ] },
  { label: "Subscription Client (Monitoring)", icon: BarChart3, href: "/globe", children: [
    { label: "Globe", href: "/globe" }, { label: "SME", href: "/sme" },
  ] },
  { label: "Communication", icon: MessageCircle, href: "/communication", children: [
    { label: "CLIENT" }, { label: "Globe Group Chat", href: "/communication/globe-chat" }, { label: "SME Group Chat", href: "/communication/sme-chat" },
  ] },
  { label: "Client Concerns", icon: Wrench, href: "/concerns", children: [
    { label: "Bugs", href: "/bugs" }, { label: "Request for System Customization", href: "/rsc" }, { label: "Book Meetings", href: "/meetings" },
  ] },
  { label: "Reports", icon: FileText, href: "/reports", children: [
    { label: "Bugs", href: "/reports/bugs" }, { label: "RSC", href: "/reports/rsc" }, { label: "Contracts Monitoring", href: "/reports/contracts" },
  ] },
];

function isActive(pathname: string, href?: string) { return Boolean(href && pathname.startsWith(href)); }

export function Sidebar() {
  const pathname = usePathname();
  const activeGroup = GROUPS.find((group) => isActive(pathname, group.href))?.label;
  const [openGroups, setOpenGroups] = useState<string[]>(activeGroup ? [activeGroup] : []);

  function toggleGroup(label: string) {
    setOpenGroups((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label]);
  }

  return (
    <nav aria-label="Sections" className="flex w-56 shrink-0 flex-col bg-[#101e46] p-3 text-white">
      <div className="mb-5 flex items-center gap-3 px-2"><div className="grid size-8 place-items-center rounded-lg bg-white/10 text-blue-200"><Gauge size={16} /></div><div><p className="text-sm font-bold tracking-wide">YAHSHUA</p><p className="text-[9px] text-blue-200/70">Outsourcing Worldwide, Inc.</p></div></div>
      <div className="space-y-1">
        <Link href="/dashboard" aria-current={pathname.startsWith("/dashboard") ? "page" : undefined} className={cn("flex items-center gap-2 rounded-lg px-2 py-2 text-[11px] font-semibold", pathname.startsWith("/dashboard") ? "bg-[#4164e8]" : "text-blue-100/80 hover:bg-white/10")}><LayoutDashboard size={14} /> Dashboard</Link>
        {GROUPS.map((group) => {
          const Icon = group.icon;
          const isOpen = openGroups.includes(group.label);
          return <section key={group.label}><button type="button" aria-expanded={isOpen} onClick={() => toggleGroup(group.label)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[11px] font-semibold text-blue-100/85 hover:bg-white/10"><Icon size={14} /><span className="min-w-0 flex-1 truncate">{group.label}</span>{isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</button>{isOpen && <div className="ml-3 border-l border-white/15 py-1 pl-3">{group.children.map((child, index) => child.href ? child.disabled ? <span key={`${child.label}-${index}`} aria-disabled="true" className="block cursor-not-allowed px-2 py-1.5 text-[10px] text-blue-100/45">{child.label}</span> : <Link key={child.label} href={child.href} aria-current={isActive(pathname, child.href) ? "page" : undefined} className={cn("block rounded-md px-2 py-1.5 text-[10px] text-blue-100/75 hover:bg-white/10", isActive(pathname, child.href) && "bg-white/10 text-white")}><span className="block">{child.label}</span>{child.subtext && <span className="block text-[9px] text-blue-100/45">{child.subtext}</span>}</Link> : <span key={`${child.label}-${index}`} className="block px-2 pb-1 pt-2 text-[9px] font-semibold tracking-wide text-blue-100/40">{child.label}</span>)}</div>}</section>;
        })}
        <Link href="/ai-support" className="flex items-center gap-2 rounded-lg px-2 py-2 text-[11px] font-semibold text-blue-100/80 hover:bg-white/10"><Bot size={14} /> AI Support</Link>
      </div>
      <div className="mt-auto border-t border-white/10 pt-4"><span className="flex items-center gap-2 px-2 py-2 text-[11px] text-blue-100/80"><Settings size={14} /> Settings</span><span className="flex items-center gap-2 px-2 py-2 text-[11px] text-blue-100/80"><CircleHelp size={14} /> Help &amp; Support</span></div>
    </nav>
  );
}
