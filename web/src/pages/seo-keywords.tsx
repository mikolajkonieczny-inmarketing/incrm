import * as React from "react"
import { ArrowDown, ArrowRight, ArrowUp, ExternalLink, Minus, Search, Sparkles } from "lucide-react"
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Tooltip } from "@/components/ui/primitives"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/overlays"
import { KEYWORDS, KW_CHECKED, KW_GROUPS, trend, type Keyword, type KwGroup } from "@/lib/seo-keywords"
import { cn, fmt, group3, plural } from "@/lib/utils"

type Compare = "week" | "month" | "start"
const COMPARE: Record<Compare, string> = { week: "tydzień", month: "miesiąc", start: "od startu" }
const BUCKETS = [
  { id: "top3", label: "TOP 3", test: (p: number) => p <= 3, color: "var(--success)" },
  { id: "top10", label: "4–10", test: (p: number) => p >= 4 && p <= 10, color: "var(--brand-blue)" },
  { id: "top20", label: "11–20", test: (p: number) => p >= 11 && p <= 20, color: "var(--warning)" },
  { id: "top50", label: "21–50", test: (p: number) => p >= 21 && p <= 50, color: "#b9c6ca" },
  { id: "rest", label: "51–100", test: (p: number) => p > 50, color: "var(--input)" },
] as const

const prev = (k: Keyword, c: Compare) => (c === "week" ? k.week : c === "month" ? k.month : k.start)
// dodatnia zmiana = awans (niższy numer pozycji)
const change = (k: Keyword, c: Compare): number | "new" | null => {
  const p = prev(k, c)
  if (k.now === null) return null
  if (p === null) return "new"
  return p - k.now
}
const fmtVol = (n: number) => group3(n)
const avg = (list: (number | null)[]) => { const v = list.filter((x): x is number => x !== null); return v.length ? v.reduce((a, x) => a + x, 0) / v.length : 0 }
const dec = (n: number) => n.toFixed(1).replace(".", ",")

export function PositionPill({ p }: { p: number | null }) {
  if (p === null) return <span className="text-[12px] text-muted-foreground">poza 100</span>
  const cls = p <= 3 ? "bg-success text-white" : p <= 10 ? "bg-brand-blue text-white" : p <= 20 ? "bg-warning-soft text-warning ring-1 ring-inset ring-warning/30" : "bg-muted text-muted-foreground"
  return <span className={cn("inline-flex h-7 min-w-9 items-center justify-center rounded-lg px-2 font-display text-[13px] font-semibold tnum", cls)}>{p}</span>
}

export function Change({ v }: { v: number | "new" | null }) {
  if (v === null) return <span className="text-muted-foreground">—</span>
  if (v === "new") return <Badge variant="blue">nowa</Badge>
  if (v === 0) return <span className="inline-flex items-center gap-0.5 text-[12.5px] text-muted-foreground"><Minus className="size-3.5" />0</span>
  const up = v > 0
  return <span className={cn("inline-flex items-center gap-0.5 text-[12.5px] font-semibold tnum", up ? "text-success" : "text-danger")}>{up ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}{String(Math.abs(v)).replace(".", ",")}</span>
}

// Mały wykres pozycji: góra = lepsza pozycja
function Spark({ pts }: { pts: (number | null)[] }) {
  const vals = pts.filter((x): x is number => x !== null)
  if (vals.length < 2) return <span className="text-[11px] text-muted-foreground">za mało danych</span>
  const W = 84, H = 26, min = Math.min(...vals), max = Math.max(...vals), span = Math.max(1, max - min)
  const xy = pts.map((p, i) => (p === null ? null : [(i / (pts.length - 1)) * W, 3 + ((p - min) / span) * (H - 6)] as const))
  const d = xy.reduce((acc, c, i) => (c ? acc + `${acc && xy[i - 1] ? "L" : "M"}${c[0].toFixed(1)},${c[1].toFixed(1)}` : acc), "")
  const last = xy[xy.length - 1]
  const improving = (vals[0] ?? 0) > (vals[vals.length - 1] ?? 0)
  const col = improving ? "var(--success)" : "var(--danger)"
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible" aria-hidden>
      <path d={d} fill="none" stroke={col} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
      {last && <circle cx={last[0]} cy={last[1]} r={2.5} fill={col} />}
    </svg>
  )
}

/* ================= ZAKŁADKA ================= */

export function KeywordsTab() {
  const [compare, setCompare] = React.useState<Compare>("month")
  const [q, setQ] = React.useState("")
  const [group, setGroup] = React.useState<KwGroup | "">("")
  const [bucket, setBucket] = React.useState("")
  const [sort, setSort] = React.useState("volume")

  const ranked = KEYWORDS.filter((k) => k.now !== null)
  // średnia porównywana na tych samych frazach (obecnych w obu pomiarach)
  const both = KEYWORDS.filter((k) => k.now !== null && prev(k, compare) !== null)
  const nowAvg = avg(KEYWORDS.map((k) => k.now))
  const avgDelta = Math.round((avg(both.map((k) => prev(k, compare))) - avg(both.map((k) => k.now))) * 10) / 10
  const inTop = (n: number, key: "now" | "prev") => KEYWORDS.filter((k) => { const p = key === "now" ? k.now : prev(k, compare); return p !== null && p <= n }).length
  const ups = KEYWORDS.filter((k) => { const c = change(k, compare); return c === "new" || (typeof c === "number" && c > 0) }).length
  const downs = KEYWORDS.filter((k) => { const c = change(k, compare); return typeof c === "number" && c < 0 }).length

  const top = [...KEYWORDS].sort((a, b) => b.volume - a.volume).slice(0, 8)
  const maxVol = top[0].volume

  const rows = KEYWORDS
    .filter((k) => (!group || k.group === group) && k.kw.includes(q.toLowerCase()))
    .filter((k) => !bucket || (k.now !== null && BUCKETS.find((b) => b.id === bucket)!.test(k.now)))
    .sort((a, b) => {
      if (sort === "position") return (a.now ?? 999) - (b.now ?? 999)
      if (sort === "change") { const ca = change(a, compare), cb = change(b, compare); const n = (c: typeof ca) => (c === "new" ? 1000 : c ?? -1000); return n(cb) - n(ca) }
      return b.volume - a.volume
    })

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-full bg-muted p-1 text-[12.5px] font-medium">
          {(Object.keys(COMPARE) as Compare[]).map((c) => (
            <button key={c} onClick={() => setCompare(c)} className={cn("rounded-full px-3.5 py-1.5 transition", compare === c ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              Zmiana: {COMPARE[c]}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[12.5px] text-muted-foreground">Ostatni pomiar {fmt(KW_CHECKED)} · Senuto</span>
      </div>

      <Card className="grid grid-cols-2 divide-x divide-y lg:grid-cols-4 lg:divide-y-0 [&>*:nth-child(3)]:border-l-0 lg:[&>*:nth-child(3)]:border-l">
        <div className="px-5 py-4">
          <div className="text-[12.5px] text-muted-foreground">Średnia pozycja</div>
          <div className="mt-1 flex items-baseline gap-2"><span className="font-display text-[22px] font-semibold tnum">{dec(nowAvg)}</span><Tooltip content={`Zmiana średniej na ${both.length} frazach obecnych w obu pomiarach`}><span><Change v={avgDelta} /></span></Tooltip></div>
          <div className="text-[12px] text-muted-foreground">{KEYWORDS.length} monitorowanych fraz</div>
        </div>
        <div className="px-5 py-4">
          <div className="text-[12.5px] text-muted-foreground">W TOP 3</div>
          <div className="mt-1 flex items-baseline gap-2"><span className="font-display text-[22px] font-semibold tnum">{inTop(3, "now")}</span><Change v={inTop(3, "now") - inTop(3, "prev")} /></div>
          <div className="text-[12px] text-muted-foreground">fraz na podium</div>
        </div>
        <div className="px-5 py-4">
          <div className="text-[12.5px] text-muted-foreground">W TOP 10</div>
          <div className="mt-1 flex items-baseline gap-2"><span className="font-display text-[22px] font-semibold tnum">{inTop(10, "now")}</span><Change v={inTop(10, "now") - inTop(10, "prev")} /></div>
          <div className="text-[12px] text-muted-foreground">pierwsza strona Google</div>
        </div>
        <div className="px-5 py-4">
          <div className="text-[12.5px] text-muted-foreground">Wzrosty / spadki</div>
          <div className="mt-1 font-display text-[22px] font-semibold tnum"><span className="text-success">{ups}</span> <span className="text-muted-foreground">/</span> <span className={downs ? "text-danger" : "text-muted-foreground"}>{downs}</span></div>
          <div className="text-[12px] text-muted-foreground">zmiana: {COMPARE[compare]}</div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex-1"><CardTitle>Frazy z największą liczbą wyszukań</CardTitle><CardDescription>Gdzie jest największy ruch do zdobycia i gdzie jesteśmy teraz</CardDescription></div>
          </CardHeader>
          <CardContent className="grid gap-1 pt-3">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_56px_48px] items-center gap-3 px-2 pb-1 text-[11.5px] text-muted-foreground sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_56px_56px_96px]">
              <span>Fraza</span><span>Wyszukiwania / mies.</span><span className="text-center">Pozycja</span><span className="text-right">Zmiana</span><span className="hidden sm:block">8 tygodni</span>
            </div>
            {top.map((k) => (
              <div key={k.kw} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_56px_48px] items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-muted/50 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_56px_56px_96px]">
                <span className="truncate text-[13.5px] font-medium">{k.kw}</span>
                <span className="flex items-center gap-2">
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${(k.volume / maxVol) * 100}%` }} /></span>
                  <span className="w-16 text-right text-[12.5px] font-medium tnum">{fmtVol(k.volume)}</span>
                </span>
                <span className="text-center"><PositionPill p={k.now} /></span>
                <span className="text-right"><Change v={change(k, compare)} /></span>
                <span className="hidden sm:block"><Spark pts={trend(k)} /></span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex-1"><CardTitle>Rozkład pozycji</CardTitle><CardDescription>Teraz vs {COMPARE[compare] === "od startu" ? "start współpracy" : `${COMPARE[compare]} temu`}</CardDescription></div></CardHeader>
          <CardContent className="grid gap-3 pt-4">
            {BUCKETS.map((b) => {
              const nowN = KEYWORDS.filter((k) => k.now !== null && b.test(k.now)).length
              const prevN = KEYWORDS.filter((k) => { const p = prev(k, compare); return p !== null && b.test(p) }).length
              return (
                <button key={b.id} onClick={() => setBucket(bucket === b.id ? "" : b.id)} className={cn("grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-lg px-1.5 py-1 text-left transition hover:bg-muted/50", bucket === b.id && "bg-muted")}>
                  <span className="text-[12.5px] font-medium">{b.label}</span>
                  <span className="grid gap-1">
                    <span className="h-2.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full" style={{ width: `${(nowN / KEYWORDS.length) * 100}%`, background: b.color }} /></span>
                    <span className="h-1 overflow-hidden rounded-full bg-muted/60"><span className="block h-full rounded-full bg-foreground/20" style={{ width: `${(prevN / KEYWORDS.length) * 100}%` }} /></span>
                  </span>
                  <span className="w-14 text-right text-[12.5px] tnum"><b className="font-semibold">{nowN}</b> <span className="text-muted-foreground">({prevN})</span></span>
                </button>
              )
            })}
            <div className="text-[11.5px] text-muted-foreground">Gruby pasek: teraz · cienki: porównanie. Kliknij przedział, aby filtrować tabelę.</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj frazy…" className="rounded-full pl-10" />
        </div>
        <Select value={group} onValueChange={(v) => setGroup(v as KwGroup | "")} placeholder="Wszystkie grupy" className="rounded-full" options={KW_GROUPS.map((g) => ({ value: g, label: `${g} (${KEYWORDS.filter((k) => k.group === g).length})` }))} />
        <Select value={bucket} onValueChange={setBucket} placeholder="Wszystkie pozycje" className="rounded-full" options={BUCKETS.map((b) => ({ value: b.id, label: b.label }))} />
        <Select value={sort === "volume" ? "" : sort} onValueChange={(v) => setSort(v || "volume")} placeholder="Sortuj: wyszukiwania" className="rounded-full" options={[{ value: "position", label: "Sortuj: pozycja" }, { value: "change", label: "Sortuj: największe wzrosty" }]} />
        <span className="ml-auto text-[12.5px] text-muted-foreground">{plural(rows.length, "fraza", "frazy", "fraz")} · {fmtVol(rows.reduce((a, k) => a + k.volume, 0))} wyszukiwań / mies.</span>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-[13px]">
            <thead className="border-b bg-muted/50"><tr className="text-left text-[12px] text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">Fraza</th>
              <th className="px-4 py-2.5 text-center font-medium">Pozycja</th>
              <th className="px-4 py-2.5 text-right font-medium">Zmiana</th>
              <th className="px-4 py-2.5 text-right font-medium">Wyszukiwania / mies.</th>
              <th className="px-4 py-2.5 font-medium">Ostatnie 8 tygodni</th>
              <th className="px-4 py-2.5 font-medium">Na start</th>
              <th className="px-5 py-2.5 font-medium">Strona w Google</th>
            </tr></thead>
            <tbody>
              {rows.map((k) => (
                <tr key={k.kw} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-5 py-2.5"><div className="font-medium">{k.kw}</div><div className="text-[11.5px] text-muted-foreground">{k.group}</div></td>
                  <td className="px-4 py-2.5 text-center"><PositionPill p={k.now} /></td>
                  <td className="px-4 py-2.5 text-right"><Change v={change(k, compare)} /></td>
                  <td className="px-4 py-2.5 text-right font-medium tnum">{fmtVol(k.volume)}</td>
                  <td className="px-4 py-2.5"><Spark pts={trend(k)} /></td>
                  <td className="px-4 py-2.5 text-muted-foreground tnum">{k.start ?? "poza 100"}</td>
                  <td className="max-w-[220px] px-5 py-2.5">
                    <Tooltip content={`simple-przyklad.pl${k.url}`}>
                      <a href={`https://simple-przyklad.pl${k.url}`} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 font-mono text-[12px] text-brand-link hover:underline">
                        <span className="truncate">{k.url}</span><ExternalLink className="size-3 shrink-0 opacity-60" />
                      </a>
                    </Tooltip>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="px-5 py-14 text-center text-[13px] text-muted-foreground">Brak fraz dla wybranych filtrów.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-[12px] text-muted-foreground">Pozycje z ostatniego tygodniowego pomiaru. Liczba wyszukiwań to średnia miesięczna. Monitorowanych fraz: {KEYWORDS.length}, w tym {ranked.length} w TOP 100.</p>
    </div>
  )
}

/* ================= SKRÓT DO PRZEGLĄDU ================= */

export function KeywordsSummary({ onOpen }: { onOpen: () => void }) {
  const top = [...KEYWORDS].sort((a, b) => b.volume - a.volume).slice(0, 5)
  const best = [...KEYWORDS].filter((k) => typeof change(k, "month") === "number").sort((a, b) => (change(b, "month") as number) - (change(a, "month") as number))[0]
  return (
    <Card>
      <CardHeader>
        <div className="flex-1"><CardTitle>Najważniejsze frazy</CardTitle><CardDescription>Największa liczba wyszukań i zmiana pozycji w miesiąc</CardDescription></div>
        <Button variant="ghost" size="sm" onClick={onOpen}>Wszystkie pozycje<ArrowRight /></Button>
      </CardHeader>
      <CardContent className="grid gap-4 pt-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="grid gap-1">
          {top.map((k) => (
            <div key={k.kw} className="grid grid-cols-[minmax(0,1fr)_auto_44px_40px] items-center gap-3 rounded-lg px-1.5 py-1.5">
              <span className="truncate text-[13px] font-medium">{k.kw}</span>
              <span className="text-[12px] text-muted-foreground tnum">{fmtVol(k.volume)} / mies.</span>
              <span className="text-center"><PositionPill p={k.now} /></span>
              <span className="text-right"><Change v={change(k, "month")} /></span>
            </div>
          ))}
        </div>
        {best && (
          <div className="flex flex-col justify-center gap-1 rounded-xl bg-success-soft/70 p-4">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-success"><Sparkles className="size-3.5" />Największy awans w miesiąc</div>
            <div className="text-[15px] font-semibold">„{best.kw}”</div>
            <div className="text-[12.5px] text-foreground/75 tnum">z {best.month} na {best.now} miejsce · {fmtVol(best.volume)} wyszukiwań / mies.</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
