import * as React from "react"
import {
  CalendarDays, ChartColumn, ChevronDown, FolderKanban, LayoutDashboard, Menu, Search, Settings, X,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar, Kbd } from "@/components/ui/primitives"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ClientLogo, StatusBadge, TierBadge } from "@/components/shared"
import { CLIENTS, ME } from "@/lib/data"
import { go, type Route } from "@/lib/router"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { TimerControl } from "@/pages/pm-tasks"
import { NotificationCenter } from "@/components/notifications"

const NAV = [
  { id: "pulpit", label: "Pulpit", icon: LayoutDashboard },
  { id: "projekty", label: "Projekty", icon: FolderKanban, count: CLIENTS.length },
]
const SOON = [
  { label: "Kalendarz", icon: CalendarDays },
  { label: "Raporty", icon: ChartColumn },
]

function Sidebar({ route, onNavigate }: { route: Route; onNavigate?: () => void }) {
  const active = route.view === "pulpit" ? "pulpit" : "projekty"
  return (
    <div className="flex h-full flex-col gap-6 px-3 py-4">
      <div className="flex items-center justify-between gap-2 px-2 pt-1">
        <Logo className="h-[26px] w-auto text-[#27398A]" />
        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10.5px] font-semibold text-primary-ink">CRM</span>
      </div>

      <nav className="grid gap-0.5">
        {NAV.map((n) => (
          <a
            key={n.id}
            href={`#${n.id}`}
            onClick={onNavigate}
            className={cn(
              "group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] font-medium text-sidebar-foreground transition",
              active === n.id ? "bg-primary-soft text-foreground" : "hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            <n.icon className={cn("size-4", active === n.id ? "text-primary-ink" : "text-muted-foreground")} />
            {n.label}
            {n.count && <span className="ml-auto text-[11px] text-muted-foreground tnum">{n.count}</span>}
          </a>
        ))}
        {SOON.map((n) => (
          <button key={n.label} onClick={() => toast(`${n.label} pojawi się w kolejnym etapie`)} className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] font-medium text-muted-foreground transition hover:bg-sidebar-accent">
            <n.icon className="size-4" />
            {n.label}
            <span className="ml-auto rounded bg-muted px-1.5 py-px text-[10px] font-medium uppercase tracking-wide">Wkrótce</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto grid gap-2">
        <button onClick={() => toast("Ustawienia pojawią się w kolejnym etapie")} className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] font-medium text-sidebar-foreground transition hover:bg-sidebar-accent">
          <Settings className="size-4 text-muted-foreground" /> Ustawienia
        </button>
        <div className="rounded-2xl bg-sidebar-accent p-3">
          <div className="flex items-center gap-2.5">
            <Avatar name={ME.name} color={ME.color} size="sm" />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[13px] font-medium">{ME.name}</div>
              <div className="text-[11.5px] text-muted-foreground">Project Manager</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AppShell({ route, title, children }: { route: Route; title: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [mobileNav, setMobileNav] = React.useState(false)

  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o) }
    }
    window.addEventListener("keydown", on)
    return () => window.removeEventListener("keydown", on)
  }, [])
  React.useEffect(() => setMobileNav(false), [route.view, route.id, route.tab])

  const pick = (hash: string) => { setOpen(false); go(hash) }

  return (
    <div className="flex h-full">
      <aside className="hidden w-[256px] shrink-0 border-r bg-sidebar lg:block">
        <div className="sticky top-0 h-dvh overflow-y-auto"><Sidebar route={route} /></div>
      </aside>

      {mobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 animate-in fade-in-0" onClick={() => setMobileNav(false)} />
          <div className="absolute inset-y-0 left-0 w-[272px] overflow-y-auto bg-sidebar shadow-2xl animate-in slide-in-from-left">
            <button className="absolute right-3 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-accent" onClick={() => setMobileNav(false)} aria-label="Zamknij menu"><X className="size-4" /></button>
            <Sidebar route={route} onNavigate={() => setMobileNav(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex h-dvh min-h-0 flex-1 flex-col overflow-y-auto bg-shell">
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-white/90 px-4 backdrop-blur-md sm:px-6">
            <Button variant="ghost" size="icon-sm" className="-ml-1 lg:hidden" onClick={() => setMobileNav(true)} aria-label="Menu"><Menu /></Button>
            <div className="flex min-w-0 items-center gap-2 text-[13.5px]">{title}</div>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => setOpen(true)}
                className="hidden h-9 w-64 items-center gap-2 rounded-full border bg-shell px-4 text-[13px] text-muted-foreground transition hover:bg-muted md:flex"
              >
                <Search className="size-4" />
                Szukaj klienta, usługi…
                <span className="ml-auto flex gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
              </button>
              <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setOpen(true)} aria-label="Szukaj"><Search /></Button>
              <TimerControl />
              <NotificationCenter />
              <div className="ml-1.5 hidden items-center gap-2 border-l pl-3 sm:flex">
                <Avatar name={ME.name} color={ME.color} size="sm" />
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </div>
            </div>
          </header>
          <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">{children}</div>
        </main>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Szukaj klienta, usługi lub widoku…" />
        <CommandList>
          <CommandEmpty>Nic nie znaleziono.</CommandEmpty>
          <CommandGroup heading="Klienci">
            {CLIENTS.map((c) => (
              <CommandItem key={c.id} value={`${c.name} ${c.legal} ${c.services.join(" ")}`} onSelect={() => pick(`klient.${c.id}`)}>
                <ClientLogo name={c.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.legal}</div>
                </div>
                <TierBadge tier={c.tier} />
                <StatusBadge status={c.status} />
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Widoki">
            <CommandItem value="pulpit dashboard" onSelect={() => pick("pulpit")}><LayoutDashboard />Pulpit</CommandItem>
            <CommandItem value="projekty lista klientów" onSelect={() => pick("projekty")}><FolderKanban />Projekty</CommandItem>
            <CommandItem value="notatki simple" onSelect={() => pick("klient.simple.notatki")}><FolderKanban />Simple · Notatki</CommandItem>
            <CommandItem value="czat ai simple asystent" onSelect={() => pick("klient.simple.czat")}><FolderKanban />Simple · Czat AI</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
