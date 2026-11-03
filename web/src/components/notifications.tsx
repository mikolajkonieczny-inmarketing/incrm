import * as React from "react"
import { Popover } from "radix-ui"
import { Bell, CalendarClock, CheckCheck, FileText, Link2, ListChecks, Repeat, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar, Tooltip } from "@/components/ui/primitives"
import { CL, PEOPLE } from "@/lib/data"
import { LIVE_NOTIF, NOTIF_KINDS, notifStore, type Notif, type NotifKind } from "@/lib/notifications"
import { CONTENT_STATUS, contentStore } from "@/lib/seo-data"
import { go } from "@/lib/router"
import { suggestTask } from "@/pages/pm-tasks"
import { cn, fmt, TODAY } from "@/lib/utils"

const TODAY_ISO = TODAY.toISOString().slice(0, 10)
const YESTERDAY_ISO = new Date(TODAY.getTime() - 864e5).toISOString().slice(0, 10)
const KIND_ICON: Record<NotifKind, typeof Bell> = { content: FileText, link: Link2, work: ListChecks, recurring: Repeat, client: CalendarClock }
const LIVE_DELAY = 25_000

function when(n: Notif) {
  if (n.id.startsWith("n-live")) return "przed chwilą"
  const [d, t] = n.at.split("T")
  if (d === TODAY_ISO) return `dziś, ${t}`
  if (d === YESTERDAY_ISO) return `wczoraj, ${t}`
  return fmt(d)
}
const groupOf = (n: Notif) => (n.at.startsWith(TODAY_ISO) ? "Dziś" : n.at.startsWith(YESTERDAY_ISO) ? "Wczoraj" : "Wcześniej")

export function NotificationCenter() {
  const [items, setItems] = notifStore.use()
  const [content, setContent] = contentStore.use()
  const [open, setOpen] = React.useState(false)
  const [onlyUnread, setOnlyUnread] = React.useState(false)
  const [kind, setKind] = React.useState<NotifKind | "">("")
  const unread = items.filter((n) => !n.read).length

  // Prototyp: po chwili „przychodzi” nowe zdarzenie od specjalisty
  React.useEffect(() => {
    if (notifStore.get().some((n) => n.id === LIVE_NOTIF.id)) return
    const t = setTimeout(() => {
      if (notifStore.get().some((n) => n.id === LIVE_NOTIF.id)) return
      notifStore.set((all) => [{ ...LIVE_NOTIF, at: `${TODAY_ISO}T23:59`, read: false }, ...all])
      contentStore.set((all) => all.map((x) => (x.id === LIVE_NOTIF.contentId && x.status === "w-trakcie" ? { ...x, status: "gotowe" } : x)))
      toast("Mikołaj Konieczny: tekst gotowy do wysyłki", {
        description: `${LIVE_NOTIF.object} · ${CL[LIVE_NOTIF.client].name}`,
        action: { label: "Pokaż", onClick: () => setOpen(true) },
      })
    }, LIVE_DELAY)
    return () => clearTimeout(t)
  }, [])

  const markRead = (id: string) => setItems((all) => all.map((n) => (n.id === id ? { ...n, read: true } : n)))
  const markAll = () => setItems((all) => all.map((n) => ({ ...n, read: true })))
  const openItem = (n: Notif) => { markRead(n.id); setOpen(false); go(n.href) }
  const markSent = (n: Notif) => {
    const item = content.find((x) => x.id === n.contentId)
    if (!item) return
    setContent((all) => all.map((x) => (x.id === item.id ? { ...x, status: "wyslane", sentAt: TODAY_ISO, acceptedAt: undefined } : x)))
    markRead(n.id)
    suggestTask({ client: n.client, type: "tresci", title: "Wysyłka tekstu do akceptacji", minutes: 10, desc: item.title }, "Wysłano do klienta: 1 tekst")
  }

  const counts = (k: NotifKind) => items.filter((n) => n.kind === k && (!onlyUnread || !n.read)).length
  const list = items
    .filter((n) => (!onlyUnread || !n.read) && (!kind || n.kind === kind))
    .sort((a, b) => b.at.localeCompare(a.at))
  const groups = list.reduce<Record<string, Notif[]>>((acc, n) => { (acc[groupOf(n)] ??= []).push(n); return acc }, {})

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Tooltip content={unread ? `Nieprzeczytane: ${unread}` : "Powiadomienia"}>
        <Popover.Trigger asChild>
          <Button variant="ghost" size="icon-sm" className="relative" aria-label={`Powiadomienia${unread ? `, nieprzeczytane: ${unread}` : ""}`}>
            <Bell />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white ring-2 ring-background tnum">{unread}</span>
            )}
          </Button>
        </Popover.Trigger>
      </Tooltip>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={8} collisionPadding={12}
          className="z-50 flex max-h-[min(640px,calc(100dvh-80px))] w-[min(430px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border bg-popover shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="border-b px-4 pb-3 pt-4">
            <div className="flex items-center gap-2">
              <div className="font-display text-[16px] font-semibold tracking-tight">Powiadomienia</div>
              {unread > 0 && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11.5px] font-semibold text-primary-ink tnum">{unread} nowe</span>}
              <Button variant="ghost" size="sm" className="ml-auto" disabled={!unread} onClick={markAll}><CheckCheck />Oznacz wszystkie</Button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex rounded-full bg-muted p-0.5 text-[12px] font-medium">
                {[[false, "Wszystkie"], [true, "Nieprzeczytane"]].map(([v, l]) => (
                  <button key={String(v)} onClick={() => setOnlyUnread(v as boolean)} className={cn("rounded-full px-3 py-1 transition", onlyUnread === v ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}>{l as string}</button>
                ))}
              </div>
            </div>
            <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
              <button onClick={() => setKind("")} className={cn("shrink-0 rounded-full border px-2.5 py-1 text-[12px] font-medium transition", kind === "" ? "border-primary bg-primary text-white" : "bg-card hover:border-foreground/20")}>Wszystko</button>
              {(Object.keys(NOTIF_KINDS) as NotifKind[]).map((k) => (
                <button key={k} onClick={() => setKind(k)} className={cn("shrink-0 rounded-full border px-2.5 py-1 text-[12px] font-medium transition", kind === k ? "border-primary bg-primary text-white" : "bg-card hover:border-foreground/20")}>
                  {NOTIF_KINDS[k]} <span className={cn("tnum", kind === k ? "text-white/80" : "text-muted-foreground")}>{counts(k)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {list.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-[13px] text-muted-foreground">
                <CheckCheck className="size-6" />{onlyUnread ? "Wszystko przeczytane." : "Brak powiadomień w tej kategorii."}
              </div>
            )}
            {["Dziś", "Wczoraj", "Wcześniej"].filter((g) => groups[g]).map((g) => (
              <div key={g}>
                <div className="sticky top-0 z-10 bg-popover/95 px-4 pb-1.5 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">{g}</div>
                {groups[g].map((n) => <Item key={n.id} n={n} contentStatus={content.find((x) => x.id === n.contentId)?.status} onOpen={() => openItem(n)} onSent={() => markSent(n)} onRead={() => markRead(n.id)} />)}
              </div>
            ))}
          </div>

          <div className="border-t bg-muted/40 px-4 py-2.5 text-[11.5px] text-muted-foreground">Działania specjalistów na Twoich klientach i przypomnienia o terminach.</div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function Item({ n, contentStatus, onOpen, onSent, onRead }: { n: Notif; contentStatus?: string; onOpen: () => void; onSent: () => void; onRead: () => void }) {
  const person = PEOPLE[n.who]
  const Icon = KIND_ICON[n.kind]
  const st = n.status ? CONTENT_STATUS[n.status] : null
  const canSend = n.status === "gotowe" && contentStatus === "gotowe"
  const alreadySent = n.status === "gotowe" && contentStatus && contentStatus !== "gotowe"
  return (
    <div className={cn("group relative flex gap-3 px-4 py-3 transition hover:bg-muted/50", !n.read && "bg-primary-soft/35")}>
      {!n.read && <span className="absolute left-1.5 top-5 size-1.5 rounded-full bg-primary" aria-label="Nieprzeczytane" />}
      <div className="relative h-fit shrink-0 self-start">
        {person ? <Avatar name={person.name} color={person.color} size="md" /> : <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"><Icon className="size-4" /></div>}
        {person && <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-card text-muted-foreground ring-1 ring-border"><Icon className="size-2.5" /></span>}
      </div>
      <div className="min-w-0 flex-1">
        <button onClick={onOpen} className="block w-full text-left">
          <p className="text-[13px] leading-snug">
            {person ? <><span className="font-semibold">{person.name}</span> {n.verb}</> : <span className="font-semibold">{n.verb}</span>}
            {n.object && <> <span className="font-medium">„{n.object}”</span></>}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11.5px] text-muted-foreground">
            {st && <span className="inline-flex items-center gap-1 rounded-full px-2 py-px font-medium" style={{ background: st.soft, color: st.ink }}><span className="size-1.5 rounded-full" style={{ background: st.color }} />{st.label}</span>}
            <span className="font-medium text-foreground/70">{CL[n.client]?.name}</span>
            {n.meta && <><span>·</span><span>{n.meta}</span></>}
          </div>
        </button>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">{when(n)}</span>
          {canSend && <Button size="sm" className="ml-auto h-7" onClick={onSent}><Send />Oznacz: wysłano</Button>}
          {alreadySent && <span className="ml-auto text-[11px] text-muted-foreground">już oznaczono jako wysłane</span>}
          {!n.read && !canSend && <button onClick={onRead} className="ml-auto text-[11px] font-medium text-muted-foreground opacity-0 transition hover:text-foreground group-hover:opacity-100">Oznacz jako przeczytane</button>}
        </div>
      </div>
    </div>
  )
}
