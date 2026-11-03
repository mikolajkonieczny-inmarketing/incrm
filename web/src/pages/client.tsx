import * as React from "react"
import {
  Activity, ArrowLeft, ArrowRight, Building2, CalendarClock, Check, Copy, Ellipsis, FileText, Globe, Layers, Lock, Mail, Pencil,
  Phone, Plus, Receipt, Sparkles, StickyNote, Timer, TriangleAlert, Users,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress, Separator, Tooltip } from "@/components/ui/primitives"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlays"
import { ClientLogo, Delta, Field, StatusBadge, TierBadge } from "@/components/shared"
import { ActivityTab, ChatTab, DocumentsTab, NotesTab, useClientDocs, useClientNotes } from "@/pages/client-tabs"
import { PmTasksTab } from "@/pages/pm-tasks"
import { pmTaskStore, startTimer } from "@/lib/pm-tasks"
import { CL, CLIENTS, ME, MOD, MODULES, PEOPLE, SIMPLE_SEO, type Client } from "@/lib/data"
import { go, type Route } from "@/lib/router"
import { cn, daysSince, fmt, pln, toDate, TODAY } from "@/lib/utils"

export type FullClient = Required<Client>

// Klienci inni niż Simple nie mają jeszcze pełnych danych; uzupełniamy placeholderami.
export function fullClient(c: Client): FullClient {
  return {
    agreement: "Umowa o świadczenie usług marketingowych",
    comment: "Pełne dane tego klienta pojawią się po imporcie z obecnego systemu. Kompletny przykład: Simple.",
    dates: { contractStart: c.start, workStart: c.start, evaluation: "", minTerm: "", indexation: "", report: "do 5. dnia miesiąca" },
    billing: { name: c.legal, nip: "—", address: "—", invoiceEmail: "—", terms: "—", notice: "—" },
    contact: { name: "Brak danych", role: "", phone: "—", email: "—", prefers: "—" },
    ...c,
  } as FullClient
}

const TABS = [
  { id: "przeglad", label: "Przegląd", icon: Building2 },
  { id: "uslugi", label: "Usługi", icon: Layers },
  { id: "zespol", label: "Zespół", icon: Users },
  { id: "dokumenty", label: "Dokumenty", icon: FileText },
  { id: "notatki", label: "Notatki", icon: StickyNote },
  { id: "zadania", label: "Zadania PM", icon: Timer },
  { id: "aktywnosc", label: "Aktywność", icon: Activity },
  { id: "czat", label: "Czat AI", icon: Sparkles },
]

export function copy(text: string) {
  navigator.clipboard?.writeText(text).then(() => toast.success("Skopiowano", { description: text }), () => toast(text))
}

export function ClientPage({ route }: { route: Route }) {
  const base = CL[route.id ?? ""]
  const [notes] = useClientNotes(route.id ?? "")
  const [docs] = useClientDocs(route.id ?? "")
  const [pmTasks] = pmTaskStore.use()
  if (!base) {
    return <Card className="p-12 text-center text-muted-foreground">Nie znaleziono klienta. <a className="font-medium text-primary-ink" href="#projekty">Wróć do projektów</a></Card>
  }
  const c = fullClient(base)
  const tab = TABS.some((t) => t.id === route.tab) ? route.tab! : "przeglad"
  const counts: Record<string, number> = { uslugi: c.services.length, zespol: c.team.length, dokumenty: docs.length, notatki: notes.length, zadania: pmTasks.filter((t) => t.client === c.id).length }
  const contact = daysSince(c.lastContact)
  const months = Math.max(0, (TODAY.getFullYear() - toDate(c.start).getFullYear()) * 12 + TODAY.getMonth() - toDate(c.start).getMonth())
  const evalIn = c.dates.evaluation ? -daysSince(c.dates.evaluation) : null

  return (
    <div className="grid gap-6 [&>*]:min-w-0">
      <Card className="overflow-hidden">
        <div className="relative p-5 sm:p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary-soft/70 to-transparent dark:from-primary-soft/40" />
          <div className="relative flex flex-wrap items-start gap-4">
            <ClientLogo name={c.name} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <TierBadge tier={c.tier} />
                <StatusBadge status={c.status} />
                <Badge variant="muted">Stała współpraca</Badge>
              </div>
              <h1 className="mt-2 font-display text-[28px] font-semibold leading-tight tracking-[-0.025em]">{c.name}</h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                <span>{c.legal}</span>
                <span className="hidden sm:inline">·</span>
                <span>{c.agreement}</span>
                <span className="hidden sm:inline">·</span>
                <span className="inline-flex items-center gap-1"><Globe className="size-3.5" />{c.domain}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => go("projekty")}><ArrowLeft />Wróć</Button>
              <Tooltip content="Kopiuje numer i włącza pomiar czasu rozmowy"><Button variant="outline" onClick={() => {
                if (c.contact.phone === "—") return toast("Brak numeru telefonu")
                navigator.clipboard?.writeText(c.contact.phone).catch(() => {})
                startTimer({ client: c.id, type: "komunikacja", title: "Telefon z klientem" })
                toast.success(`Numer skopiowany: ${c.contact.phone}`, { description: "Pomiar czasu rozmowy włączony. Zatrzymasz go w górnym pasku." })
              }}><Phone />Zadzwoń</Button></Tooltip>
              <Button onClick={() => toast("Edycja projektu pojawi się w kolejnym etapie")}><Pencil />Edytuj</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="Więcej"><Ellipsis /></Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => go(`klient.${c.id}.notatki`)}><StickyNote />Dodaj notatkę</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => go(`klient.${c.id}.czat`)}><Sparkles />Zapytaj asystenta</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => toast("Raport pojawi się w kolejnym etapie")}><FileText />Generuj raport</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Budżet", value: pln(c.budget), sub: "netto / miesiąc" },
            { label: "Współpraca od", value: fmt(c.start), sub: `${months} mies.` },
            { label: "Ewaluacja", value: evalIn === null ? "—" : evalIn === 1 ? "Jutro" : evalIn === 0 ? "Dziś" : `za ${evalIn} dni`, sub: c.dates.evaluation ? fmt(c.dates.evaluation) : "brak terminu", tone: evalIn !== null && evalIn <= 3 ? "text-primary-ink" : "" },
            { label: "Ostatni kontakt", value: contact === 0 ? "Dziś" : `${contact} dni temu`, sub: fmt(c.lastContact), tone: contact > 14 ? "text-danger" : "" },
            { label: "Kondycja projektu", value: `${c.health}/100`, sub: <Progress value={c.health} className="mt-1.5 w-full max-w-28" indicatorClassName={c.health < 50 ? "bg-danger" : c.health < 75 ? "bg-warning" : "bg-success"} /> },
          ].map((s, i) => (
            <div key={s.label} className={cn("border-border px-5 py-4 sm:px-6", i > 0 && "lg:border-l", i % 2 === 1 && "border-l sm:border-l-0", i >= 2 && "border-t lg:border-t-0", i === 1 && "sm:border-l", i === 2 && "sm:border-t-0 sm:border-l", i === 4 && "sm:border-l")}>
              <div className="text-[12px] text-muted-foreground">{s.label}</div>
              <div className={cn("mt-1 text-[15px] font-semibold tnum", s.tone)}>{s.value}</div>
              <div className="text-[12px] text-muted-foreground">{s.sub}</div>
            </div>
          ))}
        </div>
      </Card>

      <Tabs value={tab} onValueChange={(v) => go(`klient.${c.id}.${v}`)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className={t.id === "czat" ? "text-brand-blue data-[state=active]:text-foreground" : undefined}>
              <t.icon />{t.label}
              {counts[t.id] ? <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground tnum">{counts[t.id]}</span> : null}
              {t.id === "czat" && <span className="rounded bg-brand-blue-soft px-1 text-[10px] font-semibold text-brand-blue">AI</span>}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="pt-6">
          <TabsContent value="przeglad"><Overview c={c} /></TabsContent>
          <TabsContent value="uslugi"><Services c={c} /></TabsContent>
          <TabsContent value="zespol"><Team c={c} /></TabsContent>
          <TabsContent value="dokumenty"><DocumentsTab c={c} /></TabsContent>
          <TabsContent value="notatki"><NotesTab c={c} /></TabsContent>
          <TabsContent value="zadania"><PmTasksTab clientId={c.id} /></TabsContent>
          <TabsContent value="aktywnosc"><ActivityTab c={c} /></TabsContent>
          <TabsContent value="czat"><ChatTab c={c} /></TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

/* ================= PRZEGLĄD ================= */
function Overview({ c }: { c: FullClient }) {
  const [metric, setMetric] = React.useState<"top10" | "traffic">("top10")
  const D = c.dates
  const hasSeo = c.id === "simple"
  const dates = [
    { label: "Start umowy", d: D.contractStart },
    { label: "Start prac", d: D.workStart },
    { label: "Ewaluacja", d: D.evaluation, hl: true },
    { label: "Min. okres umowy do", d: D.minTerm },
    { label: "Waloryzacja", d: D.indexation },
  ].filter((x) => x.d)

  return (
    <div className="grid gap-4">
      {c.attention.length > 0 && (
        <div className="flex flex-wrap items-start gap-3 rounded-xl border border-warning/25 bg-warning-soft/70 px-4 py-3.5">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
          <div className="grid flex-1 gap-1.5 text-[13px]">
            {c.attention.map((a) => <div key={a.title}><span className="font-medium">{a.title}</span> <span className="text-foreground/70">· {a.detail}</span></div>)}
          </div>
          {c.id === "simple" && <Button size="sm" variant="outline" onClick={() => go(`klient.${c.id}.czat`)}><Sparkles />Przygotuj mnie do ewaluacji</Button>}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="grid content-start gap-4 xl:col-span-2">
          <Card>
            <CardHeader>
              <Avatar name={ME.name} color={ME.color} size="md" />
              <div className="flex-1">
                <CardTitle className="text-[14px]">Komentarz statusowy</CardTitle>
                <CardDescription className="mt-1">{ME.name} · zaktualizowano 25 wrz 2026</CardDescription>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => toast("Edycja komentarza pojawi się w kolejnym etapie")} aria-label="Edytuj komentarz"><Pencil /></Button>
            </CardHeader>
            <CardContent className="pt-3"><p className="max-w-[75ch] text-[14px] leading-relaxed text-foreground/85">{c.comment}</p></CardContent>
          </Card>

          {hasSeo ? (
            <Card>
              <CardHeader>
                <div className="flex-1">
                  <CardTitle>Wyniki SEO</CardTitle>
                  <CardDescription>Od startu współpracy, tygodniowo</CardDescription>
                </div>
                <div className="flex rounded-lg bg-muted p-0.5 text-[12.5px] font-medium">
                  {([["top10", "Frazy TOP10"], ["traffic", "Ruch / tydz."]] as const).map(([k, l]) => (
                    <button key={k} onClick={() => setMetric(k)} className={cn("rounded-md px-2.5 py-1 transition", metric === k ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}>{l}</button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-4 flex flex-wrap gap-8">
                  <div><div className="text-[12px] text-muted-foreground">Frazy w TOP10</div><div className="flex items-center gap-2"><span className="font-display text-2xl font-semibold tracking-tight tnum">142</span><Delta value={18} /></div></div>
                  <div><div className="text-[12px] text-muted-foreground">Ruch organiczny / mies.</div><div className="flex items-center gap-2"><span className="font-display text-2xl font-semibold tracking-tight tnum">4 820</span><Delta value={12} /></div></div>
                  <div><div className="text-[12px] text-muted-foreground">Kondycja techniczna</div><div className="flex items-center gap-2"><span className="font-display text-2xl font-semibold tracking-tight tnum">86</span><span className="text-[13px] text-muted-foreground">/100</span></div></div>
                </div>
                <div className="h-[220px]">
                  <ResponsiveContainer>
                    <AreaChart data={SIMPLE_SEO} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
                      <defs>
                        <linearGradient id="seo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={metric === "top10" ? "var(--chart-1)" : "var(--chart-2)"} stopOpacity={0.28} />
                          <stop offset="100%" stopColor={metric === "top10" ? "var(--chart-1)" : "var(--chart-2)"} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                      <XAxis dataKey="w" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11.5 }} interval={3} dy={6} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11.5 }} domain={metric === "top10" ? [110, 150] : [900, 1300]} />
                      <RTooltip
                        cursor={{ stroke: "var(--border)" }}
                        content={({ active, payload, label }) => active && payload?.length ? (
                          <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg"><div className="text-muted-foreground">tydzień od {label}</div><div className="font-semibold tnum">{payload[0].value} {metric === "top10" ? "fraz w TOP10" : "wizyt"}</div></div>
                        ) : null}
                      />
                      <Area key={metric} type="monotone" dataKey={metric} stroke={metric === "top10" ? "var(--chart-1)" : "var(--chart-2)"} strokeWidth={2.25} fill="url(#seo)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center text-[13px] text-muted-foreground">Wyniki pojawią się, gdy specjaliści zaczną raportować dane dla tego klienta.</Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex-1"><CardTitle>Usługi w umowie</CardTitle><CardDescription>Aktywne usługi i odpowiedzialni specjaliści</CardDescription></div>
              <Button variant="ghost" size="sm" onClick={() => go(`klient.${c.id}.uslugi`)}>Wszystkie usługi<ArrowRight /></Button>
            </CardHeader>
            <CardContent className="grid gap-2 pt-4 sm:grid-cols-2">
              {c.services.map((s) => {
                const m = MOD[s]
                const who = c.team.map((k) => PEOPLE[k]).find((p) => p.role.includes(m.name.split(" ")[0]))
                return (
                  <div key={s} className="flex items-center gap-3 rounded-xl border p-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary-ink"><Layers className="size-4" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-medium">{m.name}</div>
                      <div className="text-[12px] text-muted-foreground">{who ? who.name : "brak specjalisty"}</div>
                    </div>
                    <Badge variant="success">Aktywna</Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="grid content-start gap-4">
          <Card>
            <CardHeader><CalendarClock className="size-4 text-muted-foreground" /><CardTitle>Kluczowe daty</CardTitle></CardHeader>
            <CardContent className="pt-4">
              <ol className="relative grid gap-4 before:absolute before:bottom-1.5 before:left-[5px] before:top-1.5 before:w-px before:bg-border">
                {dates.map((x) => {
                  const past = daysSince(x.d) > 0
                  return (
                    <li key={x.label} className="relative flex items-center gap-3 pl-6">
                      <span className={cn("absolute left-0 size-[11px] rounded-full border-2 bg-card", past ? "border-foreground/30 bg-foreground/30" : x.hl ? "border-primary bg-primary ring-4 ring-primary/15" : "border-border")} />
                      <span className={cn("flex-1 text-[13px]", past && "text-muted-foreground")}>{x.label}</span>
                      <span className={cn("text-[13px] font-medium tnum", x.hl && !past && "text-primary-ink")}>{fmt(x.d)}</span>
                    </li>
                  )
                })}
              </ol>
              <Separator className="my-4" />
              <Field label="Raport miesięczny">{D.report}</Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><Phone className="size-4 text-muted-foreground" /><CardTitle>Kontakt po stronie klienta</CardTitle></CardHeader>
            <CardContent className="grid gap-4 pt-4">
              <div className="flex items-center gap-3">
                <Avatar name={c.contact.name} color="#6d717c" size="lg" />
                <div><div className="text-[14px] font-medium">{c.contact.name}</div><div className="text-[12.5px] text-muted-foreground">{c.contact.role || "—"}</div></div>
              </div>
              <div className="grid gap-1.5">
                <CopyRow icon={Phone} value={c.contact.phone} />
                <CopyRow icon={Mail} value={c.contact.email} />
              </div>
              <div className="rounded-lg bg-muted/60 px-3 py-2 text-[12.5px] text-muted-foreground"><span className="font-medium text-foreground/80">Preferuje:</span> {c.contact.prefers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><Receipt className="size-4 text-muted-foreground" /><CardTitle>Rozliczenia</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3.5 pt-4">
              <Field label="Nazwa do faktury" className="col-span-2">{c.billing.name}</Field>
              <Field label="NIP">{c.billing.nip}</Field>
              <Field label="Płatność">{c.billing.terms}</Field>
              <Field label="Adres" className="col-span-2">{c.billing.address}</Field>
              <Field label="E-mail do faktur" className="col-span-2">{c.billing.invoiceEmail}</Field>
              <Field label="Wypowiedzenie" className="col-span-2">{c.billing.notice}</Field>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function CopyRow({ icon: Icon, value }: { icon: typeof Phone; value: string }) {
  return (
    <div className="group flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px]">
      <Icon className="size-4 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate tnum">{value}</span>
      {value !== "—" && (
        <Tooltip content="Kopiuj"><button onClick={() => copy(value)} className="rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Kopiuj"><Copy className="size-3.5" /></button></Tooltip>
      )}
    </div>
  )
}

/* ================= USŁUGI ================= */
function Services({ c }: { c: FullClient }) {
  const groups = ["Performance", "Kreacja", "Tech"] as const
  return (
    <div className="grid gap-6">
      <p className="max-w-[70ch] text-[13.5px] text-muted-foreground">
        Aktywne są usługi z umowy. Pozostałe są wyszarzone jako możliwości rozszerzenia współpracy.
      </p>
      {groups.map((g) => (
        <div key={g}>
          <div className="mb-3 text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{g}</div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {MODULES.filter((m) => m.group === g).map((m) => {
              const has = c.services.includes(m.id)
              const live = has && m.id === "seo"
              const who = c.team.map((k) => PEOPLE[k]).find((p) => p.role.includes(m.name.split(" ")[0]))
              if (live) {
                return (
                  <button key={m.id} onClick={() => go(`usluga.${c.id}.${m.id}`)} className="group relative overflow-hidden rounded-xl border border-primary/40 bg-card p-5 text-left shadow-[0_0_0_4px_var(--primary-soft)] transition hover:-translate-y-0.5 hover:shadow-[0_0_0_4px_var(--primary-soft),0_12px_24px_-12px_rgba(255,111,97,.45)]">
                    <div className="flex items-center justify-between">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Layers className="size-5" /></div>
                      <span className="inline-flex items-center gap-1.5 text-[12px] text-success"><span className="size-1.5 rounded-full bg-success" />Aktywna</span>
                    </div>
                    <div className="mt-4 font-display text-[18px] font-semibold tracking-tight">{m.name}</div>
                    <p className="mt-1 text-[13px] text-muted-foreground">{m.desc}</p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[["142", "TOP10"], ["4,8k", "ruch/mies."], ["86", "kondycja"]].map(([v, l]) => (
                        <div key={l} className="rounded-lg bg-muted/70 px-2.5 py-2"><div className="font-display text-[16px] font-semibold tnum">{v}</div><div className="text-[11px] text-muted-foreground">{l}</div></div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2 border-t pt-3.5">
                      {who && <><Avatar name={who.name} color={who.color} size="xs" /><span className="text-[12.5px]">{who.name}</span></>}
                      <span className="ml-auto inline-flex items-center gap-1 text-[13px] font-medium text-primary-ink">Otwórz<ArrowRight className="size-4 transition group-hover:translate-x-0.5" /></span>
                    </div>
                  </button>
                )
              }
              return (
                <div key={m.id} aria-disabled className="relative cursor-not-allowed rounded-xl border border-dashed bg-muted/40 p-5 opacity-70 grayscale">
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground"><Layers className="size-5" /></div>
                    <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground"><Lock className="size-3.5" />{has ? "Widok w budowie" : "Poza umową"}</span>
                  </div>
                  <div className="mt-4 font-display text-[18px] font-semibold tracking-tight text-muted-foreground">{m.name}</div>
                  <p className="mt-1 text-[13px] text-muted-foreground">{m.desc}</p>
                  <div className="mt-4 flex items-center gap-2 border-t pt-3.5 text-[12.5px] text-muted-foreground">
                    {has ? "Aktywna usługa" : <><Plus className="size-3.5" />Możliwość rozszerzenia</>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ================= ZESPÓŁ ================= */
function Team({ c }: { c: FullClient }) {
  const ppl = c.team.map((k) => PEOPLE[k])
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[13.5px] text-muted-foreground">Specjaliści przypisani do projektu {c.name}.</p>
        <Button variant="outline" onClick={() => toast("Przypisywanie osób pojawi się w kolejnym etapie")}><Plus />Dodaj osobę</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {ppl.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="h-16 bg-gradient-to-r from-primary-soft via-brand-blue-soft/60 to-transparent" />
            <CardContent className="-mt-9 pt-0">
              <Avatar name={p.name} color={p.color} size="xl" className="ring-4" />
              <div className="mt-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-display text-[18px] font-semibold tracking-tight">{p.name}</div>
                  <div className="text-[13px] text-muted-foreground">{p.role}</div>
                </div>
                <Badge variant="success"><Check />Dostępny</Badge>
              </div>
              {p.skills && <div className="mt-3 flex flex-wrap gap-1.5">{p.skills.map((s) => <Badge key={s} variant="muted">{s}</Badge>)}</div>}
              <div className="mt-4 grid gap-1.5">
                <CopyRow icon={Mail} value={p.email} />
                {p.phone && <CopyRow icon={Phone} value={p.phone} />}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-center">
                {[[fmt(c.start), "w projekcie od"], [String(c.services.filter((s) => p.role.includes(MOD[s].name.split(" ")[0])).length || c.services.length), "usługi tutaj"], [String(CLIENTS.filter((x) => x.team.includes(p.id)).length), "projektów łącznie"]].map(([v, l]) => (
                  <div key={l}><div className="font-display text-[16px] font-semibold tnum">{v}</div><div className="text-[11.5px] text-muted-foreground">{l}</div></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
