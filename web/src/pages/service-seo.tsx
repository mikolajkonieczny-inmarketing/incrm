import * as React from "react"
import {
  ArrowLeft, ArrowRight, BellRing, Check, ChevronDown, Download, ExternalLink, FileBarChart, FileText, LayoutDashboard, Link2, ListChecks, MessageSquare, Repeat, Search, Send, TrendingUp, TriangleAlert,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Tooltip } from "@/components/ui/primitives"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Select, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlays"
import { Delta, TierBadge } from "@/components/shared"
import { PeriodFilter, inPeriod, singleMonth, usePeriod, type Period } from "@/components/period-filter"
import { CL, PEOPLE } from "@/lib/data"
import {
  CONTENT, CONTENT_FLOW, CONTENT_STATUS, CURRENT_MONTH, contentStore, PM_CAN_EDIT, KPI, LINK_STATUS, LINKS, PLAN, SEO_MONTHS, WORK, WORK_TYPE,
  type ContentItem, type ContentStatus, type ContentType, type LinkSource, type LinkStatus, type WorkType,
} from "@/lib/seo-data"
import { go, type Route } from "@/lib/router"
import { RecurringSummary, RecurringTab, simpleStats } from "@/pages/seo-recurring"
import { suggestTask } from "@/pages/pm-tasks"
import { KeywordsSummary, KeywordsTab } from "@/pages/seo-keywords"
import { KEYWORDS } from "@/lib/seo-keywords"
import { cn, daysSince, fmt, group3, plural, pln, TODAY } from "@/lib/utils"

const zzs = group3
const inMonth = (date: string, key: string) => date.startsWith(key)
const monthLabel = (key: string) => SEO_MONTHS.find((m) => m.key === key)?.label ?? key

const TABS = [
  { id: "przeglad", label: "Przegląd", icon: LayoutDashboard },
  { id: "pozycje", label: "Pozycje fraz", icon: TrendingUp, count: KEYWORDS.length },
  { id: "realizacja", label: "Realizacja", icon: ListChecks, count: WORK.length },
  { id: "content", label: "Content", icon: FileText, count: CONTENT.length },
  { id: "linkowanie", label: "Linkowanie", icon: Link2, count: LINKS.length },
  { id: "cykliczne", label: "Zadania cykliczne", icon: Repeat, alert: simpleStats().overdue.length },
]

export function SeoServicePage({ route }: { route: Route }) {
  const c = CL[route.id ?? ""]
  if (!c) return <Card className="p-12 text-center text-muted-foreground">Nie znaleziono klienta.</Card>
  const tab = TABS.some((t) => t.id === route.sub) ? route.sub! : "przeglad"
  const spec = PEOPLE.mk
  const setTab = (t: string) => go(`usluga.${c.id}.seo.${t}`)

  return (
    <div className="grid gap-6 [&>*]:min-w-0">
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary-soft/70 to-transparent" />
        <div className="relative flex flex-wrap items-start gap-4 p-5 sm:p-6">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary font-display text-lg font-semibold text-white shadow-[0_8px_20px_-8px_rgba(255,111,97,.8)]">SEO</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <TierBadge tier={c.tier} />
              <Badge variant="success"><span className="size-1.5 rounded-full bg-current" />Usługa aktywna</Badge>
              <Badge variant="muted">od {fmt(c.start)}</Badge>
            </div>
            <h1 className="mt-2 font-display text-[28px] font-semibold leading-tight tracking-[-0.025em]">SEO · {c.name}</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">W umowie co miesiąc: <b className="font-medium text-foreground">20 000 zzs treści</b> i <b className="font-medium text-foreground">800 zł na linki</b></p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => go(`klient.${c.id}.uslugi`)}><ArrowLeft />Wróć</Button>
            <Button variant="outline" onClick={() => toast("Czat ze specjalistą pojawi się w kolejnym etapie")}><MessageSquare />Napisz do Mikołaja</Button>
            <Button onClick={() => toast("Raport miesięczny pojawi się w kolejnym etapie")}><FileBarChart />Raport miesięczny</Button>
          </div>
        </div>
        <div className="relative flex flex-wrap items-center gap-3 border-t px-5 py-3 sm:px-6">
          <Avatar name={spec.name} color={spec.color} size="sm" />
          <div className="text-[13px]"><span className="font-medium">{spec.name}</span> <span className="text-muted-foreground">· {spec.role} · wpisuje realizację, treści i linki</span></div>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              <t.icon />{t.label}
              {"count" in t && t.count ? <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground tnum">{t.count}</span> : null}
              {"alert" in t && t.alert ? <span className="rounded-full bg-danger px-1.5 text-[11px] font-semibold text-white tnum">{t.alert}</span> : null}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="pt-6">
          <TabsContent value="przeglad"><Overview clientId={c.id} onTab={setTab} /></TabsContent>
          <TabsContent value="pozycje"><KeywordsTab /></TabsContent>
          <TabsContent value="realizacja"><WorkTab /></TabsContent>
          <TabsContent value="content"><ContentTab clientId={c.id} /></TabsContent>
          <TabsContent value="linkowanie"><LinksTab /></TabsContent>
          <TabsContent value="cykliczne"><RecurringTab clientId={c.id} /></TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

/* ================= wspólne ================= */

function SegBar({ segments, total }: { segments: { value: number; color: string; label: string; fmt: string }[]; total: number }) {
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
      {segments.map((s) => s.value > 0 && (
        <Tooltip key={s.label} content={`${s.label}: ${s.fmt}`}>
          <div className="h-full border-r-2 border-card last:border-r-0" style={{ width: `${Math.min(100, (s.value / total) * 100)}%`, background: s.color }} />
        </Tooltip>
      ))}
    </div>
  )
}

function Legend({ items }: { items: { label: string; value: string; color: string; strong?: boolean }[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-2 text-[12.5px]">
          <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: i.color }} />
          <span className="text-muted-foreground">{i.label}</span>
          <span className={cn("ml-auto tnum", i.strong ? "font-semibold" : "font-medium")}>{i.value}</span>
        </div>
      ))}
    </div>
  )
}

function Chips<T extends string>({ value, onChange, options }: { value: T | ""; onChange: (v: T | "") => void; options: { value: T; label: string; count: number }[] }) {
  const all = options.reduce((a, o) => a + o.count, 0)
  const chip = (active: boolean) => cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition whitespace-nowrap", active ? "border-primary bg-primary text-white" : "bg-card text-foreground/80 hover:border-foreground/20")
  return (
    <div className="flex flex-wrap gap-1.5">
      <button onClick={() => onChange("")} className={chip(value === "")}>Wszystkie <span className={cn("tnum", value === "" ? "text-white/80" : "text-muted-foreground")}>{all}</span></button>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} className={chip(value === o.value)}>{o.label} <span className={cn("tnum", value === o.value ? "text-white/80" : "text-muted-foreground")}>{o.count}</span></button>
      ))}
    </div>
  )
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="rounded-full pl-10" />
    </div>
  )
}

function Stat({ label, value, sub, tone }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: string }) {
  return (
    <div className="min-w-0 px-5 py-4">
      <div className="text-[12.5px] text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-display text-[22px] font-semibold tracking-tight tnum", tone)}>{value}</div>
      {sub && <div className="mt-0.5 text-[12px] text-muted-foreground">{sub}</div>}
    </div>
  )
}

function StatStrip({ children }: { children: React.ReactNode }) {
  return <Card className="grid grid-cols-2 divide-x divide-y lg:grid-cols-4 lg:divide-y-0 [&>*:nth-child(3)]:border-l-0 lg:[&>*:nth-child(3)]:border-l">{children}</Card>
}

function periodText(p: Period) {
  if (p.month === "all") return "od początku współpracy"
  if (p.month === "custom") return p.from || p.to ? `${p.from ? fmt(p.from) : "…"} – ${p.to ? fmt(p.to) : "…"}` : "wybrany zakres"
  return monthLabel(p.month).toLowerCase() + " 2026"
}

function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return <tr><td colSpan={cols} className="px-5 py-14 text-center text-[13px] text-muted-foreground">{text}</td></tr>
}

const TH = "px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground whitespace-nowrap"
const TD = "px-4 py-3 align-top"

/* ================= PRZEGLĄD ================= */

function Overview({ clientId, onTab }: { clientId: string; onTab: (t: string) => void }) {
  const [month, setMonth] = React.useState(CURRENT_MONTH)
  const [allContent, setAllContent] = contentStore.use()
  const plan = PLAN[month]
  const content = allContent.filter((x) => inMonth(x.date, month))
  const links = LINKS.filter((x) => inMonth(x.date, month))
  const work = WORK.filter((x) => inMonth(x.date, month))
  const kpi = KPI[month]
  const current = month === CURRENT_MONTH

  const sumC = (s: ContentStatus) => content.filter((x) => x.status === s).reduce((a, x) => a + x.chars, 0)
  const sumL = (s: LinkStatus) => links.filter((x) => x.status === s).reduce((a, x) => a + x.price, 0)
  const deployed = sumC("wdrozone")
  const spent = sumL("opublikowany"), ordered = sumL("zamowiony"), plannedL = sumL("planowany")
  const contentPct = Math.round((deployed / plan.content) * 100)
  const linkPct = Math.round((spent / plan.links) * 100)
  const ready = content.filter((x) => x.status === "gotowe")
  const waiting = content.filter((x) => x.status === "wyslane")
  const waitingDays = waiting.length ? Math.max(...waiting.map((x) => daysSince(x.sentAt ?? x.date))) : 0
  const lastReminder = waiting.map((x) => x.remindedAt).filter(Boolean).sort().at(-1)
  const todayIso = TODAY.toISOString().slice(0, 10)
  const markReminded = () => {
    const ids = waiting.map((x) => x.id)
    setAllContent((list) => list.map((x) => (ids.includes(x.id) ? { ...x, remindedAt: todayIso } : x)))
    suggestTask({ client: clientId, type: "komunikacja", title: "Przypomnienie o akceptacji treści", minutes: 10, desc: waiting.map((x) => x.title).join(", ") }, "Zapisano przypomnienie klienta")
  }
  const history = [...SEO_MONTHS].reverse().map((m) => ({
    m: m.short, plan: PLAN[m.key].content,
    done: allContent.filter((x) => inMonth(x.date, m.key) && x.status === "wdrozone").reduce((a, x) => a + x.chars, 0),
  }))

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-full bg-muted p-1 text-[12.5px] font-medium">
          {SEO_MONTHS.map((m) => (
            <button key={m.key} onClick={() => setMonth(m.key)} className={cn("rounded-full px-3.5 py-1.5 transition", month === m.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {m.label}{m.key === CURRENT_MONTH && <span className="ml-1.5 text-primary-ink">•</span>}
            </button>
          ))}
        </div>
        <span className="text-[12.5px] text-muted-foreground">{current ? "Bieżący miesiąc" : "Miesiąc zamknięty"}</span>
      </div>

      {current && ready.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-primary-soft px-4 py-3.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-card text-primary-ink"><Send className="size-[18px]" /></div>
          <div className="min-w-0 flex-1 text-[13.5px]">
            <div className="font-semibold">{ready.length === 1 ? "1 tekst gotowy do wysyłki: wyślij go klientowi i oznacz jako wysłany" : `${plural(ready.length, "tekst", "teksty", "tekstów")} gotowe do wysyłki: wyślij je klientowi i oznacz jako wysłane`}</div>
            <div className="text-foreground/70">{ready.map((x) => x.title).join(", ")} · {zzs(ready.reduce((a, x) => a + x.chars, 0))} zzs</div>
          </div>
          <Button onClick={() => onTab("content")}><ArrowRight />Przejdź do treści</Button>
        </div>
      )}

      {current && waiting.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-card text-warning"><TriangleAlert className="size-[18px]" /></div>
          <div className="min-w-0 flex-1 text-[13.5px]">
            <div className="font-semibold">{waiting.length === 1 ? "1 tekst czeka" : `${plural(waiting.length, "tekst", "teksty", "tekstów")} czekają`} na akceptację klienta od {plural(waitingDays, "dzień", "dni", "dni")}</div>
            <div className="text-foreground/70">To {zzs(sumC("wyslane"))} zzs bez akceptacji. {lastReminder ? `Ostatnie przypomnienie: ${lastReminder === todayIso ? "dziś" : fmt(lastReminder)}.` : "Klientowi jeszcze nie przypominano."}</div>
          </div>
          <Tooltip content="Oznacz, że przypomniano klientowi (mailem lub telefonicznie)"><Button variant="outline" disabled={lastReminder === todayIso} onClick={markReminded}><BellRing />{lastReminder === todayIso ? "Przypomniano dziś" : "Przypomniano klientowi"}</Button></Tooltip>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary-ink"><FileText className="size-[18px]" /></div>
              <div><div className="text-[14px] font-semibold">Treści</div><div className="text-[12px] text-muted-foreground">wdrożone w miesiącu</div></div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onTab("content")}>Lista treści<ArrowRight /></Button>
          </div>
          <div className="mt-5 flex items-end gap-2">
            <span className="font-display text-[44px] font-semibold leading-none tracking-[-0.035em] tnum">{zzs(deployed)}</span>
            <span className="pb-1 text-[18px] font-medium text-muted-foreground tnum">/ {zzs(plan.content)} zzs</span>
            <span className={cn("mb-1 ml-auto rounded-full px-2.5 py-1 text-[13px] font-semibold tnum", contentPct >= 95 ? "bg-success-soft text-success" : "bg-primary-soft text-primary-ink")}>{contentPct}%</span>
          </div>
          <div className="mt-6">
            <SegBar total={plan.content} segments={[...CONTENT_FLOW].reverse().map((s) => ({ value: sumC(s), color: CONTENT_STATUS[s].color, label: CONTENT_STATUS[s].label, fmt: zzs(sumC(s)) }))} />
          </div>
          <div className="mt-5">
            <Legend items={[...CONTENT_FLOW].reverse().map((s) => ({ label: CONTENT_STATUS[s].label, value: zzs(sumC(s)), color: CONTENT_STATUS[s].color, strong: s === "wdrozone" }))} />
          </div>
          <div className="mt-5 border-t pt-4 text-[12.5px] text-muted-foreground">zzs = znaki ze spacjami · {plural(content.length, "tekst", "teksty", "tekstów")} w planie</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-brand-blue-soft text-brand-blue"><Link2 className="size-[18px]" /></div>
              <div><div className="text-[14px] font-semibold">Budżet na linki</div><div className="text-[12px] text-muted-foreground">wydane w miesiącu</div></div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onTab("linkowanie")}>Lista linków<ArrowRight /></Button>
          </div>
          <div className="mt-5 flex items-end gap-2">
            <span className="font-display text-[44px] font-semibold leading-none tracking-[-0.035em] tnum">{spent}</span>
            <span className="pb-1 text-[18px] font-medium text-muted-foreground tnum">/ {plan.links} zł</span>
            <span className="mb-1 ml-auto rounded-full bg-brand-blue-soft px-2.5 py-1 text-[13px] font-semibold text-brand-blue tnum">{linkPct}%</span>
          </div>
          <div className="mt-6">
            <SegBar total={plan.links} segments={[
              { value: spent, color: "var(--brand-blue)", label: "Wydane", fmt: pln(spent) },
              { value: ordered, color: "#8fa0e0", label: "Zamówione", fmt: pln(ordered) },
              { value: plannedL, color: "#c9d3f2", label: "Planowane", fmt: pln(plannedL) },
            ]} />
          </div>
          <div className="mt-5">
            <Legend items={[
              { label: "Wydane", value: pln(spent), color: "var(--brand-blue)", strong: true },
              { label: "Zamówione", value: pln(ordered), color: "#8fa0e0" },
              { label: "Planowane", value: pln(plannedL), color: "#c9d3f2" },
              { label: "Pozostało", value: pln(Math.max(0, plan.links - spent)), color: "var(--muted)" },
            ]} />
          </div>
          <div className="mt-5 border-t pt-4 text-[12.5px] text-muted-foreground">{plural(links.filter((l) => l.status === "opublikowany").length, "link", "linki", "linków")} opublikowane · {links.length} w planie</div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Frazy w TOP10", value: String(kpi.top10), d: kpi.top10d },
          { label: "Frazy w TOP3", value: String(kpi.top3), d: kpi.top3d },
          { label: "Ruch organiczny", value: zzs(kpi.traffic), unit: "/ mies.", d: kpi.trafficd },
          { label: "Kondycja techniczna", value: String(kpi.health), unit: "/ 100" },
        ].map((k) => (
          <Card key={k.label} className="p-5">
            <div className="text-[12.5px] text-muted-foreground">{k.label}</div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-display text-[26px] font-semibold tracking-tight tnum">{k.value}</span>
              {k.unit && <span className="text-[13px] text-muted-foreground">{k.unit}</span>}
            </div>
            <div className="mt-1.5 text-[12px] text-muted-foreground">{k.d !== undefined ? <><Delta value={k.d} /> m/m</> : "wynik z ostatniego audytu"}</div>
          </Card>
        ))}
      </div>

      <KeywordsSummary onOpen={() => onTab("pozycje")} />

      {current && <RecurringSummary onOpen={() => onTab("cykliczne")} />}

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex-1"><CardTitle>Ostatnia realizacja</CardTitle><CardDescription>Co zrobił specjalista w tym miesiącu</CardDescription></div>
            <Button variant="ghost" size="sm" onClick={() => onTab("realizacja")}>Wszystkie wpisy<ArrowRight /></Button>
          </CardHeader>
          <CardContent className="grid gap-1 pt-3">
            {work.slice(0, 6).map((w) => (
              <div key={w.id} className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition hover:bg-muted/50">
                <WorkBadge type={w.type} className="mt-0.5 w-[104px] justify-center" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium">{w.title}</div>
                  <div className="text-[12px] text-muted-foreground">{w.scope}{w.note && ` · ${w.note}`}</div>
                </div>
                <span className="shrink-0 text-[12px] text-muted-foreground tnum">{fmt(w.date)}</span>
              </div>
            ))}
            {work.length === 0 && <div className="py-8 text-center text-[13px] text-muted-foreground">Brak wpisów w tym miesiącu.</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex-1"><CardTitle>Realizacja treści</CardTitle><CardDescription>Opublikowane zzs vs plan</CardDescription></div></CardHeader>
          <CardContent className="h-[280px] pt-3">
            <ResponsiveContainer>
              <BarChart data={history} barGap={-26} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} ticks={[0, 5000, 10000, 15000, 20000]} domain={[0, 20000]} />
                <RTooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  content={({ active, payload, label }) => active && payload?.length ? (
                    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg"><div className="text-muted-foreground">{label} 2026</div><div className="font-semibold tnum">{zzs(Number(payload[1]?.value ?? 0))} / {zzs(Number(payload[0].value))} zzs</div></div>
                  ) : null}
                />
                <Bar dataKey="plan" fill="var(--muted)" radius={[6, 6, 0, 0]} barSize={26} isAnimationActive={false} />
                <Bar dataKey="done" fill="var(--chart-1)" radius={[6, 6, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ================= REALIZACJA ================= */

function WorkBadge({ type, className }: { type: WorkType; className?: string }) {
  const t = WORK_TYPE[type]
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-medium whitespace-nowrap", className)} style={{ background: t.soft, color: t.color }}>{type}</span>
}

function WorkTab() {
  const [period, setPeriod] = usePeriod(CURRENT_MONTH)
  const [type, setType] = React.useState<WorkType | "">("")
  const [q, setQ] = React.useState("")
  const inP = WORK.filter((w) => inPeriod(w.date, period))
  const rows = inP.filter((w) => (!type || w.type === type) && `${w.title} ${w.scope} ${w.note ?? ""}`.toLowerCase().includes(q.toLowerCase()))
  const types = Object.keys(WORK_TYPE) as WorkType[]

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <PeriodFilter value={period} onChange={setPeriod} months={SEO_MONTHS} />
        <div className="ml-auto"><SearchBox value={q} onChange={setQ} placeholder="Szukaj w realizacji…" /></div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Chips value={type} onChange={setType} options={types.map((t) => ({ value: t, label: t, count: inP.filter((w) => w.type === t).length }))} />
        <span className="ml-auto text-[12.5px] text-muted-foreground">Wpisy dodaje specjalista · {periodText(period)}</span>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead className="border-b bg-muted/50"><tr>
              <th className={cn(TH, "pl-5")}>Data</th><th className={TH}>Typ</th><th className={TH}>Co zostało zrobione</th><th className={cn(TH, "pr-5")}>Czego dotyczy</th>
            </tr></thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id} className="border-b transition last:border-0 hover:bg-muted/30">
                  <td className={cn(TD, "whitespace-nowrap pl-5 text-muted-foreground tnum")}>{fmt(w.date)}</td>
                  <td className={TD}><WorkBadge type={w.type} /></td>
                  <td className={TD}><div className="font-medium">{w.title}</div>{w.note && <div className="mt-0.5 text-[12px] text-muted-foreground">{w.note}</div>}</td>
                  <td className={cn(TD, "pr-5 text-foreground/80")}>{w.scope}</td>
                </tr>
              ))}
              {rows.length === 0 && <EmptyRow cols={4} text="Brak wpisów dla wybranych filtrów." />}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ================= CONTENT ================= */

function ContentStatusBadge({ status }: { status: ContentStatus }) {
  const st = CONTENT_STATUS[status]
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-medium" style={{ background: st.soft, color: st.ink }}>
      <span className="size-1.5 rounded-full" style={{ background: st.color }} />{st.label}
    </span>
  )
}

function OwnerTag({ owner }: { owner: "seo" | "pm" }) {
  return <span className={cn("rounded px-1 py-px text-[10px] font-semibold", owner === "pm" ? "bg-brand-blue-soft text-brand-blue" : "bg-muted text-muted-foreground")}>{owner === "pm" ? "PM" : "SEO"}</span>
}

// Menu statusu: PM zmienia tylko swoje statusy i tylko gdy tekst jest u niego
function StatusMenu({ item, onSet }: { item: ContentItem; onSet: (s: ContentStatus) => void }) {
  const editable = PM_CAN_EDIT.includes(item.status)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn("group inline-flex items-center gap-1 rounded-full outline-none transition focus-visible:ring-[3px] focus-visible:ring-primary/30", editable ? "cursor-pointer" : "cursor-default")} aria-label="Zmień status">
          <ContentStatusBadge status={item.status} />
          <ChevronDown className={cn("size-3.5 text-muted-foreground transition", editable ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Ścieżka treści</DropdownMenuLabel>
        {CONTENT_FLOW.map((s, i) => {
          const st = CONTENT_STATUS[s]
          const mine = st.owner === "pm"
          const current = item.status === s
          const allowed = mine && editable && !current
          return (
            <DropdownMenuItem key={s} disabled={!allowed} onSelect={() => allowed && onSet(s)} className={cn("gap-2.5", !allowed && !current && "opacity-45", current && "bg-muted")}>
              <span className="w-3 text-[11px] text-muted-foreground tnum">{i + 1}</span>
              <span className="size-2 rounded-full" style={{ background: st.color }} />
              <span className="flex-1">{st.label}</span>
              {current ? <Check className="size-4 text-foreground!" /> : <OwnerTag owner={st.owner} />}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-[11.5px] leading-snug text-muted-foreground">
          {editable ? "Ty ustawiasz statusy PM. Statusy SEO ustawia specjalista." : "Ten etap należy do specjalisty. Statusy PM odblokują się, gdy tekst będzie gotowy do wysyłki."}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ContentTab({ clientId }: { clientId: string }) {
  const [all, setAll] = contentStore.use()
  const [period, setPeriod] = usePeriod(CURRENT_MONTH)
  const [type, setType] = React.useState<ContentType | "">("")
  const [status, setStatus] = React.useState("")
  const [q, setQ] = React.useState("")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const inP = all.filter((x) => inPeriod(x.date, period))
  const rows = inP.filter((x) => (!type || x.type === type) && (!status || x.status === status) && x.title.toLowerCase().includes(q.toLowerCase()))
  const month = singleMonth(period)
  const total = rows.reduce((a, x) => a + x.chars, 0)
  const sum = (list: ContentItem[]) => list.reduce((a, x) => a + x.chars, 0)
  const deployed = sum(rows.filter((x) => x.status === "wdrozone"))
  const ready = rows.filter((x) => x.status === "gotowe")
  const sent = rows.filter((x) => x.status === "wyslane")
  const types: ContentType[] = ["Wpis blogowy", "Opis kategorii", "Opis produktu"]
  const sel = rows.filter((x) => selected.has(x.id))
  const today = TODAY.toISOString().slice(0, 10)

  const setStatuses = (ids: string[], s: ContentStatus) => {
    setAll((list) => list.map((x) => ids.includes(x.id) ? {
      ...x, status: s,
      sentAt: s === "wyslane" ? today : x.sentAt,
      acceptedAt: s === "zaakceptowane" ? today : s === "wyslane" ? undefined : x.acceptedAt,
    } : x))
    setSelected(new Set())
    const items = all.filter((x) => ids.includes(x.id))
    const headline = `${CONTENT_STATUS[s].label}: ${plural(ids.length, "tekst", "teksty", "tekstów")}`
    if (s === "wyslane") suggestTask({ client: clientId, type: "tresci", title: ids.length === 1 ? "Wysyłka tekstu do akceptacji" : `Wysyłka ${ids.length} tekstów do akceptacji`, minutes: 10 + 5 * (ids.length - 1), desc: items.map((x) => x.title).join(", ") }, headline)
    else if (s === "zaakceptowane") suggestTask({ client: clientId, type: "komunikacja", title: "Akceptacja treści od klienta", minutes: 5, desc: items.map((x) => x.title).join(", ") }, headline)
    else toast.success(headline, { description: "Status widzi też specjalista." })
  }
  const toggle = (id: string) => setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const selectable = rows.filter((x) => x.status === "gotowe" || x.status === "wyslane")
  const allSel = selectable.length > 0 && selectable.every((x) => selected.has(x.id))

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <PeriodFilter value={period} onChange={setPeriod} months={SEO_MONTHS} />
        <div className="ml-auto"><SearchBox value={q} onChange={setQ} placeholder="Szukaj po tytule…" /></div>
      </div>

      <StatStrip>
        <Stat label="Wdrożone" value={<>{zzs(deployed)}{month && !type && !status && <span className="text-[15px] font-medium text-muted-foreground"> / {zzs(PLAN[month].content)}</span>}</>} sub="zzs" />
        <Stat label="Do wysłania przez Ciebie" value={ready.length} sub={ready.length ? `${zzs(sum(ready))} zzs gotowe do wysyłki` : "nic nie czeka"} tone={ready.length ? "text-primary-ink" : undefined} />
        <Stat label="U klienta" value={sent.length} sub={sent.length ? `czeka na akceptację, najdłużej ${plural(Math.max(...sent.map((x) => daysSince(x.sentAt ?? x.date))), "dzień", "dni", "dni")}` : "nic nie czeka na akceptację"} tone={sent.length ? "text-warning" : undefined} />
        <Stat label="Wszystkie znaki" value={zzs(total)} sub={plural(rows.length, "tekst", "teksty", "tekstów")} />
      </StatStrip>

      <div className="flex flex-wrap items-center gap-3">
        <Chips value={type} onChange={setType} options={types.map((t) => ({ value: t, label: t, count: inP.filter((x) => x.type === t).length }))} />
        <Select value={status} onValueChange={setStatus} placeholder="Wszystkie statusy" className="rounded-full" options={CONTENT_FLOW.map((s) => ({ value: s, label: `${CONTENT_STATUS[s].label} (${inP.filter((x) => x.status === s).length})` }))} />
        <span className="ml-auto text-[12.5px] text-muted-foreground">{periodText(period)}</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-xl bg-muted/60 px-4 py-2.5 text-[12px] text-muted-foreground">
        <span className="font-medium text-foreground/80">Ścieżka:</span>
        {CONTENT_FLOW.map((s, i) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            {i > 0 && <ArrowRight className="size-3 opacity-50" />}
            <span className="size-1.5 rounded-full" style={{ background: CONTENT_STATUS[s].color }} />
            <span className={cn(CONTENT_STATUS[s].owner === "pm" && "font-medium text-brand-blue")}>{CONTENT_STATUS[s].label}</span>
            <OwnerTag owner={CONTENT_STATUS[s].owner} />
          </span>
        ))}
      </div>

      {sel.length > 0 && (
        <div className="sticky top-16 z-20 flex flex-wrap items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-lg">
          <span className="text-[13px] font-medium">Zaznaczono {plural(sel.length, "tekst", "teksty", "tekstów")} · {zzs(sum(sel))} zzs</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Odznacz</Button>
            <Button size="sm" variant="outline" disabled={!sel.every((x) => x.status === "gotowe")} onClick={() => setStatuses(sel.map((x) => x.id), "wyslane")}><Send />Oznacz: wysłano do klienta</Button>
            <Button size="sm" disabled={!sel.every((x) => x.status === "wyslane")} onClick={() => setStatuses(sel.map((x) => x.id), "zaakceptowane")}><Check />Oznacz: zaakceptowane</Button>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-[13px]">
            <thead className="border-b bg-muted/50"><tr>
              <th className="w-10 py-2.5 pl-5">
                <input type="checkbox" aria-label="Zaznacz wszystkie do wysłania lub akceptacji" checked={allSel} disabled={!selectable.length}
                  onChange={() => setSelected(allSel ? new Set() : new Set(selectable.map((x) => x.id)))} className="size-4 accent-[#FF6F61] disabled:opacity-30" />
              </th>
              <th className={TH}>Tytuł</th><th className={TH}>Treść</th><th className={TH}>Typ</th><th className={cn(TH, "text-right")}>Znaki</th><th className={TH}>Data</th><th className={TH}>Status</th><th className={cn(TH, "pr-5 text-right")}>Twoja akcja</th>
            </tr></thead>
            <tbody>
              {rows.map((x) => {
                const canSel = x.status === "gotowe" || x.status === "wyslane"
                return (
                  <tr key={x.id} className={cn("border-b transition last:border-0 hover:bg-muted/30", x.status === "gotowe" && "bg-primary-soft/40", selected.has(x.id) && "bg-brand-blue-soft/50")}>
                    <td className="py-3 pl-5 align-top">
                      <input type="checkbox" aria-label={`Zaznacz: ${x.title}`} checked={selected.has(x.id)} disabled={!canSel} onChange={() => toggle(x.id)} className="mt-0.5 size-4 accent-[#FF6F61] disabled:opacity-20" />
                    </td>
                    <td className={cn(TD, "min-w-[220px] font-medium")}>{x.title}</td>
                    <td className={TD}>
                      <a href={x.doc} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-card px-2.5 py-1 text-[12px] font-medium text-brand-link transition hover:border-brand-blue/30 hover:bg-brand-blue-soft">
                        <FileText className="size-3.5" />Google Docs<ExternalLink className="size-3 opacity-60" />
                      </a>
                    </td>
                    <td className={cn(TD, "whitespace-nowrap text-foreground/80")}>{x.type}</td>
                    <td className={cn(TD, "text-right font-medium tnum")}>{zzs(x.chars)}</td>
                    <td className={cn(TD, "whitespace-nowrap text-muted-foreground tnum")}>{fmt(x.date)}</td>
                    <td className={TD}>
                      <StatusMenu item={x} onSet={(s) => setStatuses([x.id], s)} />
                      {x.status === "wyslane" && x.sentAt && <div className="mt-1 pl-1 text-[11.5px] text-warning">{daysSince(x.sentAt) === 0 ? "wysłano dziś" : `u klienta od ${plural(daysSince(x.sentAt), "dnia", "dni", "dni")}`}</div>}
                      {x.status === "wyslane" && x.remindedAt && <div className="pl-1 text-[11.5px] text-muted-foreground">przypomniano {daysSince(x.remindedAt) === 0 ? "dziś" : fmt(x.remindedAt)}</div>}
                      {x.status === "zaakceptowane" && x.acceptedAt && <div className="mt-1 pl-1 text-[11.5px] text-muted-foreground">zaakceptowano {daysSince(x.acceptedAt) === 0 ? "dziś" : fmt(x.acceptedAt)} · czeka na wdrożenie</div>}
                    </td>
                    <td className={cn(TD, "pr-5 text-right")}>
                      {x.status === "gotowe" && <Button size="sm" onClick={() => setStatuses([x.id], "wyslane")}><Send />Wysłano</Button>}
                      {x.status === "wyslane" && <Button size="sm" variant="outline" onClick={() => setStatuses([x.id], "zaakceptowane")}><Check />Zaakceptowane</Button>}
                      {!["gotowe", "wyslane"].includes(x.status) && <span className="text-[12px] text-muted-foreground">{x.status === "wdrozone" ? "—" : "po stronie SEO"}</span>}
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && <EmptyRow cols={8} text="Brak treści dla wybranych filtrów." />}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="border-t bg-muted/50"><tr>
                <td /><td className="px-4 py-2.5 text-[12.5px] text-muted-foreground" colSpan={3}>Razem · {plural(rows.length, "tekst", "teksty", "tekstów")}</td>
                <td className="px-4 py-2.5 text-right font-semibold tnum">{zzs(total)}</td>
                <td colSpan={3} />
              </tr></tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ================= LINKOWANIE ================= */

const SOURCE_STYLE: Record<LinkSource, string> = {
  WhitePress: "bg-brand-blue-soft text-brand-blue",
  Linkhouse: "bg-[#e3f7fd] text-[#007ea3]",
}

function LinksTab() {
  const [period, setPeriod] = usePeriod(CURRENT_MONTH)
  const [source, setSource] = React.useState<LinkSource | "">("")
  const [q, setQ] = React.useState("")
  const inP = LINKS.filter((x) => inPeriod(x.date, period))
  const rows = inP.filter((x) => (!source || x.source === source) && `${x.title} ${x.url ?? ""}`.toLowerCase().includes(q.toLowerCase()))
  const month = singleMonth(period)
  const spent = rows.filter((x) => x.status === "opublikowany").reduce((a, x) => a + x.price, 0)
  const total = rows.reduce((a, x) => a + x.price, 0)
  const bySource = (s: LinkSource) => rows.filter((x) => x.source === s)
  const sources: LinkSource[] = ["WhitePress", "Linkhouse"]

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <PeriodFilter value={period} onChange={setPeriod} months={SEO_MONTHS} />
        <div className="ml-auto"><SearchBox value={q} onChange={setQ} placeholder="Szukaj po tytule lub adresie…" /></div>
      </div>

      <StatStrip>
        <Stat label="Wydane" value={<>{pln(spent)}{month && !source && <span className="text-[15px] font-medium text-muted-foreground"> / {pln(PLAN[month].links)}</span>}</>} sub="za opublikowane linki" />
        <Stat label="Razem z zamówionymi" value={pln(total)} sub={plural(rows.length, "link", "linki", "linków")} />
        <Stat label="WhitePress" value={pln(bySource("WhitePress").reduce((a, x) => a + x.price, 0))} sub={plural(bySource("WhitePress").length, "link", "linki", "linków")} />
        <Stat label="Linkhouse" value={pln(bySource("Linkhouse").reduce((a, x) => a + x.price, 0))} sub={plural(bySource("Linkhouse").length, "link", "linki", "linków")} />
      </StatStrip>

      <div className="flex flex-wrap items-center gap-3">
        <Chips value={source} onChange={setSource} options={sources.map((s) => ({ value: s, label: s, count: inP.filter((x) => x.source === s).length }))} />
        <span className="ml-auto flex items-center gap-3 text-[12.5px] text-muted-foreground">
          {periodText(period)}
          <Button variant="outline" size="sm" onClick={() => toast("Eksport CSV pojawi się w kolejnym etapie")}><Download />CSV</Button>
        </span>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-[13px]">
            <thead className="border-b bg-muted/50"><tr>
              <th className={cn(TH, "pl-5")}>Tytuł</th><th className={TH}>Adres wpisu</th><th className={cn(TH, "text-right")}>Cena</th><th className={TH}>Skąd</th><th className={TH}>Data</th><th className={cn(TH, "pr-5")}>Status</th>
            </tr></thead>
            <tbody>
              {rows.map((x) => (
                <tr key={x.id} className="border-b transition last:border-0 hover:bg-muted/30">
                  <td className={cn(TD, "pl-5")}><div className="font-medium">{x.title}</div><div className="mt-0.5 text-[12px] text-muted-foreground">link do <span className="font-mono text-[11.5px]">{x.target}</span></div></td>
                  <td className={cn(TD, "max-w-[260px]")}>
                    {x.url ? (
                      <a href={x.url} target="_blank" rel="noopener noreferrer" className="group inline-flex max-w-full items-center gap-1.5 text-brand-link hover:underline">
                        <span className="truncate">{x.url.replace(/^https?:\/\//, "")}</span><ExternalLink className="size-3.5 shrink-0 opacity-60" />
                      </a>
                    ) : <span className="text-muted-foreground">jeszcze nie opublikowano</span>}
                  </td>
                  <td className={cn(TD, "whitespace-nowrap text-right font-semibold tnum")}>{pln(x.price)}</td>
                  <td className={TD}><span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold", SOURCE_STYLE[x.source])}>{x.source}</span></td>
                  <td className={cn(TD, "whitespace-nowrap text-muted-foreground tnum")}>{fmt(x.date)}</td>
                  <td className={cn(TD, "pr-5")}><Badge variant={LINK_STATUS[x.status].badge}>{LINK_STATUS[x.status].label}</Badge></td>
                </tr>
              ))}
              {rows.length === 0 && <EmptyRow cols={6} text="Brak linków dla wybranych filtrów." />}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="border-t bg-muted/50"><tr>
                <td className="px-5 py-2.5 text-[12.5px] text-muted-foreground" colSpan={2}>Razem · {plural(rows.length, "link", "linki", "linków")}</td>
                <td className="px-4 py-2.5 text-right font-semibold tnum">{pln(total)}</td>
                <td colSpan={3} />
              </tr></tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  )
}
