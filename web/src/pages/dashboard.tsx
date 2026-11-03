import {
  ArrowRight, ArrowUpRight, CalendarDays, CircleAlert, Info, PhoneCall, Plus, TriangleAlert, Video,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Avatar, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from "@/components/ui/primitives"
import { ClientLogo, Delta, PageHeader, StatusBadge, TierBadge } from "@/components/shared"
import { AGENDA, CL, CLIENTS, FEED, MOD, PEOPLE, PORTFOLIO, type Severity } from "@/lib/data"
import { go } from "@/lib/router"
import { RecurringDashboardCard } from "@/pages/seo-recurring"
import { PmTimeCard } from "@/pages/pm-tasks"
import { openTaskDialog } from "@/lib/pm-tasks"
import { cn, daysSince, pln } from "@/lib/utils"

const SEV: Record<Severity, { icon: typeof Info; cls: string; label: string }> = {
  bad: { icon: CircleAlert, cls: "text-danger bg-danger-soft", label: "Krytyczne" },
  warn: { icon: TriangleAlert, cls: "text-warning bg-warning-soft", label: "Ważne" },
  info: { icon: Info, cls: "text-brand-blue bg-brand-blue-soft", label: "Info" },
}

function Spark({ data, color = "var(--chart-1)", id }: { data: { v: number }[]; color?: string; id: string }) {
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.75} fill={`url(#${id})`} isAnimationActive={false} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function Kpi({ label, value, unit, foot, children }: { label: string; value: string; unit?: string; foot: React.ReactNode; children?: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="text-[13px] font-medium text-muted-foreground">{label}</div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="whitespace-nowrap font-display text-[30px] font-semibold leading-none tracking-[-0.03em] tnum">
          {value}{unit && <span className="ml-1 text-[14px] font-medium tracking-normal text-muted-foreground">{unit}</span>}
        </div>
        {children}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[12.5px] text-muted-foreground">{foot}</div>
    </Card>
  )
}

export function Dashboard() {
  const running = CLIENTS.filter((c) => c.status !== "zakonczony" && c.status !== "wstrzymany")
  const budget = running.reduce((s, c) => s + c.budget, 0)
  const order = { bad: 0, warn: 1, info: 2 }
  const attention = CLIENTS.flatMap((c) => c.attention.map((a) => ({ ...a, c }))).sort((a, b) => order[a.sev] - order[b.sev])
  const critical = attention.filter((a) => a.sev === "bad").length
  const pulse = [...CLIENTS].sort((a, b) => daysSince(b.lastContact) - daysSince(a.lastContact))

  return (
    <div className="grid gap-6 [&>*]:min-w-0">
      <PageHeader
        eyebrow="Środa, 30 września 2026"
        title="Dzień dobry, Anna"
        description={<>Masz <b className="font-medium text-foreground">{attention.length} spraw</b> do ogarnięcia, w tym {critical} krytyczne, i 2 spotkania dziś.</>}
        actions={<>
          <Button variant="outline" onClick={() => openTaskDialog()}><Plus />Dodaj task</Button>
          <Button variant="outline" onClick={() => go("klient.simple")}><CalendarDays />Jutro: ewaluacja Simple</Button>
          <Button onClick={() => go("projekty")}>Wszystkie projekty<ArrowRight /></Button>
        </>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Budżet pod opieką" value={pln(budget).replace(" zł", "")} unit="zł" foot={<><Delta value={8.6} /> miesięcznie vs sierpień</>}>
          <Spark id="sp1" data={PORTFOLIO.map((p) => ({ v: p.v }))} />
        </Kpi>
        <Kpi label="Aktywni klienci" value={String(running.length)} unit={`z ${CLIENTS.length}`} foot={<><Badge variant="blue">+1 onboarding</Badge> 1 wstrzymany</>}>
          <Spark id="sp2" color="var(--chart-2)" data={[3, 4, 4, 5, 5, 6].map((v) => ({ v }))} />
        </Kpi>
        <Kpi label="Raporty miesięczne" value="0" unit="/ 5 gotowych" foot={<>Termin: poniedziałek, 5 paź</>}>
          <div className="w-24 pb-1.5"><Progress value={8} indicatorClassName="bg-warning" /></div>
        </Kpi>
        <Card className="relative overflow-hidden border-transparent bg-gradient-to-br from-[#FF7F72] to-[#FF6F61] p-5 text-white shadow-[0_10px_30px_-12px_rgba(255,111,97,.7)]">
          <div className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-white/15" />
          <div className="pointer-events-none absolute -bottom-12 right-10 size-24 rounded-full bg-white/10" />
          <div className="relative text-[13px] font-medium text-white/85">Wymaga uwagi</div>
          <div className="relative mt-3 flex items-end justify-between">
            <div className="font-display text-[30px] font-semibold leading-none tracking-[-0.03em] tnum">{attention.length}</div>
            <div className="flex -space-x-2">
              {[...new Set(attention.map((a) => a.c.name))].slice(0, 4).map((n) => <div key={n} className="rounded-[10px] ring-2 ring-[#FF7A6D]"><ClientLogo name={n} size="sm" /></div>)}
            </div>
          </div>
          <div className="relative mt-3 text-[12.5px] text-white/85"><span className="font-semibold text-white">{critical} krytyczne</span> · Medica Clinic</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5 [&>*]:min-w-0">
        <Card className="xl:col-span-3">
          <CardHeader>
            <div className="flex-1">
              <CardTitle>Wymaga Twojej uwagi</CardTitle>
              <CardDescription>Sprawy z Twoich projektów, od najpilniejszych</CardDescription>
            </div>
            <div className="flex gap-1.5">
              <Badge variant="danger">{critical} krytyczne</Badge>
              <Badge variant="muted">{attention.length - critical} pozostałe</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 pt-4">
            {attention.map((a, i) => {
              const s = SEV[a.sev]
              return (
                <button key={i} onClick={() => go(`klient.${a.c.id}`)} className="group flex items-center gap-3.5 rounded-xl border bg-card p-3 text-left transition hover:border-foreground/15 hover:bg-muted/40">
                  <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", s.cls)}><s.icon className="size-[18px]" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13.5px] font-medium">{a.title}</span>
                    </div>
                    <div className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                      <span className="font-medium text-foreground/80">{a.c.name}</span> · {a.detail}
                    </div>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                </button>
              )
            })}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex-1"><CardTitle>Najbliższe dni</CardTitle><CardDescription>Spotkania i terminy</CardDescription></div>
            <Button variant="ghost" size="sm" onClick={() => go("pulpit")}>Kalendarz</Button>
          </CardHeader>
          <CardContent className="grid gap-5 pt-4">
            {AGENDA.map((g) => (
              <div key={g.day}>
                <div className="mb-2 flex items-baseline gap-2 text-[12px]"><span className="font-semibold">{g.day}</span><span className="text-muted-foreground">{g.date}</span></div>
                <div className="grid gap-2">
                  {g.items.map((it) => (
                    <button key={it.title} onClick={() => it.client && go(`klient.${it.client}`)} className="flex gap-3 rounded-lg p-1 text-left transition hover:bg-muted/50">
                      <div className={cn("w-1 shrink-0 rounded-full", { meet: "bg-brand-blue", task: "bg-primary", urgent: "bg-danger", deadline: "bg-warning" }[it.kind])} />
                      <div className="w-11 shrink-0 pt-px text-[12px] font-medium tnum">{it.time}<div className="font-normal text-muted-foreground">{it.end}</div></div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium">{it.title}</div>
                        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">{it.kind === "meet" && <Video className="size-3.5" />}{it.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <PmTimeCard />

      <RecurringDashboardCard />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5 [&>*]:min-w-0">
        <Card className="xl:col-span-3">
          <CardHeader>
            <div className="flex-1"><CardTitle>Puls klientów</CardTitle><CardDescription>Kondycja projektu i dni od ostatniego kontaktu</CardDescription></div>
            <PhoneCall className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="overflow-x-auto pt-3">
            <table className="w-full min-w-[520px] text-[13px]">
              <thead>
                <tr className="text-left text-[12px] text-muted-foreground">
                  <th className="pb-2 font-medium">Klient</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium">Kondycja</th><th className="pb-2 text-right font-medium">Ostatni kontakt</th>
                </tr>
              </thead>
              <tbody>
                {pulse.map((c) => {
                  const d = daysSince(c.lastContact)
                  const tone = d > 14 ? "text-danger" : d > 7 ? "text-warning" : "text-muted-foreground"
                  const bar = c.health < 50 ? "bg-danger" : c.health < 75 ? "bg-warning" : "bg-success"
                  return (
                    <tr key={c.id} onClick={() => go(`klient.${c.id}`)} className="cursor-pointer border-t transition hover:bg-muted/40">
                      <td className="py-2.5 pr-3"><div className="flex items-center gap-2.5"><ClientLogo name={c.name} size="sm" /><span className="font-medium">{c.name}</span><TierBadge tier={c.tier} /></div></td>
                      <td className="py-2.5 pr-3"><StatusBadge status={c.status} /></td>
                      <td className="py-2.5 pr-3"><div className="flex items-center gap-2.5"><Progress value={c.health} className="w-24" indicatorClassName={bar} /><span className="w-6 text-[12px] text-muted-foreground tnum">{c.health}</span></div></td>
                      <td className={cn("py-2.5 text-right font-medium tnum", tone)}>{d === 0 ? "dziś" : d === 1 ? "wczoraj" : `${d} dni temu`}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex-1"><CardTitle>Praca specjalistów</CardTitle><CardDescription>Co ostatnio zrobili na Twoich projektach</CardDescription></div>
          </CardHeader>
          <CardContent className="pt-4">
            <ol className="relative grid gap-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-border">
              {FEED.map((f, i) => {
                const p = PEOPLE[f.who]
                return (
                  <li key={i} className="relative flex gap-3">
                    <Avatar name={p.name} color={p.color} size="md" />
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[13px] leading-snug"><span className="font-medium">{p.name.split(" ")[0]}</span> <span className="text-foreground/80">{f.text}</span></p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
                        <a href={`#klient.${f.client}.aktywnosc`} className="font-medium text-foreground/80 hover:text-primary-ink">{CL[f.client].name}</a>
                        <span>·</span><span>{MOD[f.mod].name}</span><span>·</span><span>{f.when}</span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <div className="flex-1">
              <CardTitle>Budżet pod opieką</CardTitle>
              <CardDescription>Miesięczna wartość Twoich projektów, netto</CardDescription>
            </div>
            <div className="text-right">
              <div className="font-display text-xl font-semibold tracking-tight tnum">{pln(budget)}</div>
              <div className="text-[12px] text-muted-foreground"><Delta value={35.2} /> od kwietnia</div>
            </div>
          </CardHeader>
          <CardContent className="h-[240px] pt-2">
            <ResponsiveContainer>
              <AreaChart data={PORTFOLIO} margin={{ top: 10, right: 8, bottom: 0, left: -8 }}>
                <defs>
                  <linearGradient id="pf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} dy={6} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} domain={[50000, 90000]} ticks={[50000, 60000, 70000, 80000, 90000]} />
                <RTooltip
                  cursor={{ stroke: "var(--border)" }}
                  content={({ active, payload, label }) => active && payload?.length ? (
                    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg"><div className="text-muted-foreground">{label} 2026</div><div className="font-semibold tnum">{pln(Number(payload[0].value))}</div></div>
                  ) : null}
                />
                <Area type="monotone" dataKey="v" stroke="var(--chart-1)" strokeWidth={2.25} fill="url(#pf)" activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
