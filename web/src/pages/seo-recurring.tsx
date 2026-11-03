import * as React from "react"
import { ArrowRight, BellRing, CircleCheck, Circle, CircleDashed, Repeat, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress, Tooltip } from "@/components/ui/primitives"
import { ClientLogo, StatusBadge } from "@/components/shared"
import { CL, PEOPLE } from "@/lib/data"
import {
  CURRENT_MONTH_LABEL, CURRENT_WEEK, MONTHLY, MONTHS, SEO_CLIENTS_RECURRING, SIMPLE_MONTHLY, SIMPLE_WEEKLY, WEEKLY, WEEKS,
  type Cell, type RecurringTask, type TaskState,
} from "@/lib/recurring-data"
import { go } from "@/lib/router"
import { suggestTask } from "@/pages/pm-tasks"
import { cn, fmt, TODAY } from "@/lib/utils"

const TODAY_ISO = TODAY.toISOString().slice(0, 10)
const monthDue = (t: RecurringTask) => `2026-09-${String(t.dueDay ?? 30).padStart(2, "0")}`
const isDone = (c: Cell) => c === "done" || c === "late" || c === "ok"

// Stan bieżącego okresu (ostatnia kolumna) z uwzględnieniem terminu
type Now = "done" | "late" | "progress" | "todo" | "overdue" | "today"
function nowState(cell: Cell, due: string): Now {
  if (cell === "done" || cell === "ok") return "done"
  if (cell === "late") return "late"
  if (due < TODAY_ISO) return "overdue"
  if (due === TODAY_ISO) return "today"
  return cell === "progress" ? "progress" : "todo"
}
const NOW: Record<Now, { label: string; variant: "success" | "warning" | "blue" | "muted" | "danger"; icon: typeof Circle }> = {
  done: { label: "Zrobione", variant: "success", icon: CircleCheck },
  late: { label: "Zrobione po terminie", variant: "warning", icon: CircleCheck },
  progress: { label: "W toku", variant: "blue", icon: CircleDashed },
  todo: { label: "Do zrobienia", variant: "muted", icon: Circle },
  overdue: { label: "Po terminie", variant: "danger", icon: TriangleAlert },
  today: { label: "Termin dziś", variant: "warning", icon: CircleDashed },
}

export function simpleStats() {
  const w = WEEKLY.map((t) => SIMPLE_WEEKLY[t.id])
  const m = MONTHLY.map((t) => SIMPLE_MONTHLY[t.id])
  const weekDone = w.filter((s) => isDone(s.cells.at(-1)!)).length
  const monthDone = m.filter((s) => isDone(s.cells.at(-1)!)).length
  const overdue = MONTHLY.filter((t) => nowState(SIMPLE_MONTHLY[t.id].cells.at(-1)!, monthDue(t)) === "overdue")
  // terminowość: zamknięte okresy + zrobione w bieżącym
  const closed = [...w.flatMap((s) => s.cells.slice(0, -1)), ...m.flatMap((s) => s.cells.slice(0, -1)), ...m.map((s) => s.cells.at(-1)!).filter((c) => c === "done" || c === "late")]
  const ok = closed.filter((c) => c === "ok" || c === "done").length
  return { weekDone, monthDone, overdue, onTime: Math.round((ok / closed.length) * 100) }
}

const CELL: Record<Cell, { cls: string; label: string }> = {
  ok: { cls: "bg-success", label: "Na czas" },
  done: { cls: "bg-success", label: "Zrobione" },
  late: { cls: "bg-warning", label: "Po terminie" },
  missed: { cls: "bg-danger", label: "Pominięte" },
  progress: { cls: "bg-brand-blue/70", label: "W toku" },
  todo: { cls: "border-2 border-dashed border-input bg-transparent", label: "Do zrobienia" },
}

function Cells({ cells, labels }: { cells: Cell[]; labels: string[] }) {
  return (
    <div className="flex gap-1">
      {cells.map((c, i) => (
        <Tooltip key={i} content={`${labels[i]}: ${CELL[c].label}`}>
          <span className={cn("size-[18px] rounded-[5px]", CELL[c].cls, i === cells.length - 1 && "ring-2 ring-foreground/15 ring-offset-1 ring-offset-card")} />
        </Tooltip>
      ))}
    </div>
  )
}

function CellLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-muted-foreground">
      {(["ok", "late", "missed", "progress", "todo"] as Cell[]).map((c) => (
        <span key={c} className="inline-flex items-center gap-1.5"><span className={cn("size-3 rounded-[4px]", CELL[c].cls)} />{CELL[c].label}</span>
      ))}
      <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-[4px] ring-2 ring-foreground/15 ring-offset-1" />bieżący okres</span>
    </div>
  )
}

function StatusCell({ now }: { now: Now }) {
  const s = NOW[now]
  return <Badge variant={s.variant}><s.icon />{s.label}</Badge>
}

/* ================= ZAKŁADKA ================= */

export function RecurringTab({ clientId }: { clientId: string }) {
  const [remindedToday, setRemindedToday] = React.useState(false)
  const st = simpleStats()
  const spec = PEOPLE.mk
  const TH = "px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground whitespace-nowrap"

  const table = (kind: "week" | "month") => {
    const tasks = kind === "week" ? WEEKLY : MONTHLY
    const data: Record<string, TaskState> = kind === "week" ? SIMPLE_WEEKLY : SIMPLE_MONTHLY
    const labels = (kind === "week" ? WEEKS : MONTHS).map((x) => x.label)
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-[13px]">
          <thead className="border-y bg-muted/50"><tr>
            <th className={cn(TH, "pl-5")}>Zadanie</th>
            {kind === "month" && <th className={TH}>Termin</th>}
            <th className={TH}>{kind === "week" ? "Ostatnie 8 tygodni" : "Od startu"}</th>
            <th className={TH}>{kind === "week" ? "Ten tydzień" : "Ten miesiąc"}</th>
            <th className={TH}>Wykonano</th>
            <th className={cn(TH, "pr-5 text-right")}>Czas</th>
          </tr></thead>
          <tbody>
            {tasks.map((t) => {
              const s = data[t.id]
              const now = nowState(s.cells.at(-1)!, kind === "week" ? CURRENT_WEEK.due : monthDue(t))
              return (
                <tr key={t.id} className={cn("border-b last:border-0", now === "overdue" && "bg-danger-soft/40")}>
                  <td className="px-4 py-3 pl-5">
                    <div className="flex items-center gap-2"><Repeat className="size-3.5 shrink-0 text-muted-foreground" /><span className="font-medium">{t.title}</span></div>
                    {t.note && <div className="pl-[22px] text-[12px] text-muted-foreground">{t.note}</div>}
                  </td>
                  {kind === "month" && <td className={cn("whitespace-nowrap px-4 py-3 tnum", now === "overdue" ? "font-medium text-danger" : "text-muted-foreground")}>{t.dueDay} wrz</td>}
                  <td className="px-4 py-3"><Cells cells={s.cells} labels={labels} /></td>
                  <td className="px-4 py-3"><StatusCell now={now} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground tnum">{s.doneAt ? fmt(s.doneAt) : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 pr-5 text-right tnum">{s.time ?? <span className="text-muted-foreground">—</span>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Avatar name={spec.name} color={spec.color} size="xs" />
          <span><span className="font-medium text-foreground">{spec.name}</span> · te same zadania na każdym kliencie SEO</span>
        </div>
        <Badge variant="muted" className="ml-auto"><Repeat />Źródło: ClickUp · lista „Zadania cykliczne”</Badge>
        {st.overdue.length > 0 && (
          <Tooltip content="Oznacz, że przypomniano specjaliście o zaległych zadaniach">
            <Button variant="outline" disabled={remindedToday} onClick={() => { setRemindedToday(true); suggestTask({ client: clientId, type: "koordynacja", title: "Przypomnienie specjaliście o zaległych zadaniach", minutes: 5, desc: st.overdue.map((t) => t.title).join(", ") }, "Zapisano przypomnienie specjalisty") }}>
              <BellRing />{remindedToday ? "Przypomniano dziś" : "Oznacz: przypomniano Mikołajowi"}
            </Button>
          </Tooltip>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-[12.5px] text-muted-foreground">Ten tydzień · {CURRENT_WEEK.label}</div>
          <div className="mt-2 flex items-baseline gap-1.5"><span className="font-display text-[30px] font-semibold tracking-tight tnum">{st.weekDone}</span><span className="text-[16px] text-muted-foreground tnum">/ {WEEKLY.length} zadań</span></div>
          <Progress value={(st.weekDone / WEEKLY.length) * 100} className="mt-3 h-2" indicatorClassName="bg-brand-blue" />
          <div className="mt-2 text-[12px] text-muted-foreground">Termin: piątek, 2 paź</div>
        </Card>
        <Card className="p-5">
          <div className="text-[12.5px] text-muted-foreground">Ten miesiąc · {CURRENT_MONTH_LABEL}</div>
          <div className="mt-2 flex items-baseline gap-1.5"><span className="font-display text-[30px] font-semibold tracking-tight tnum">{st.monthDone}</span><span className="text-[16px] text-muted-foreground tnum">/ {MONTHLY.length} zadań</span></div>
          <Progress value={(st.monthDone / MONTHLY.length) * 100} className="mt-3 h-2" indicatorClassName="bg-primary" />
          <div className={cn("mt-2 text-[12px]", st.overdue.length ? "font-medium text-danger" : "text-muted-foreground")}>{st.overdue.length ? `${st.overdue.length} po terminie` : "wszystko w terminie"}</div>
        </Card>
        <Card className="p-5">
          <div className="text-[12.5px] text-muted-foreground">Terminowość</div>
          <div className="mt-2 flex items-baseline gap-1.5"><span className={cn("font-display text-[30px] font-semibold tracking-tight tnum", st.onTime >= 90 ? "text-success" : st.onTime >= 75 ? "text-warning" : "text-danger")}>{st.onTime}%</span><span className="text-[14px] text-muted-foreground">zadań na czas</span></div>
          <Progress value={st.onTime} className="mt-3 h-2" indicatorClassName={st.onTime >= 90 ? "bg-success" : st.onTime >= 75 ? "bg-warning" : "bg-danger"} />
          <div className="mt-2 text-[12px] text-muted-foreground">ostatnie 8 tygodni i miesiące od startu</div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-4"><div className="flex-1"><CardTitle>Zadania tygodniowe</CardTitle><CardDescription>Co tydzień, do piątku</CardDescription></div><Badge variant="blue">{st.weekDone}/{WEEKLY.length}</Badge></CardHeader>
        {table("week")}
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-4"><div className="flex-1"><CardTitle>Zadania miesięczne</CardTitle><CardDescription>Co miesiąc, każde z własnym terminem</CardDescription></div><Badge variant="default">{st.monthDone}/{MONTHLY.length}</Badge></CardHeader>
        {table("month")}
      </Card>

      <CellLegend />
    </div>
  )
}

/* ================= SKRÓT DO PRZEGLĄDU SEO ================= */

export function RecurringSummary({ onOpen }: { onOpen: () => void }) {
  const st = simpleStats()
  return (
    <Card>
      <CardHeader>
        <div className="flex-1"><CardTitle>Zadania cykliczne</CardTitle><CardDescription>Rutyna specjalisty na tym kliencie</CardDescription></div>
        <Button variant="ghost" size="sm" onClick={onOpen}>Szczegóły<ArrowRight /></Button>
      </CardHeader>
      <CardContent className="grid gap-4 pt-4 md:grid-cols-[1fr_1fr_1.3fr]">
        <div>
          <div className="flex items-baseline justify-between text-[12.5px]"><span className="text-muted-foreground">Ten tydzień</span><span className="font-semibold tnum">{st.weekDone}/{WEEKLY.length}</span></div>
          <Progress value={(st.weekDone / WEEKLY.length) * 100} className="mt-2 h-2" indicatorClassName="bg-brand-blue" />
        </div>
        <div>
          <div className="flex items-baseline justify-between text-[12.5px]"><span className="text-muted-foreground">Ten miesiąc</span><span className="font-semibold tnum">{st.monthDone}/{MONTHLY.length}</span></div>
          <Progress value={(st.monthDone / MONTHLY.length) * 100} className="mt-2 h-2" indicatorClassName="bg-primary" />
        </div>
        <div className="text-[12.5px]">
          {st.overdue.length ? st.overdue.map((t) => (
            <div key={t.id} className="flex items-start gap-2 text-danger"><TriangleAlert className="mt-0.5 size-3.5 shrink-0" /><span><span className="font-medium">Po terminie:</span> {t.title} ({t.dueDay} wrz)</span></div>
          )) : <div className="flex items-center gap-2 text-success"><CircleCheck className="size-4" />Wszystko w terminie</div>}
        </div>
      </CardContent>
    </Card>
  )
}

/* ================= KARTA NA PULPIT PM ================= */

export function RecurringDashboardCard() {
  const simple = simpleStats()
  const rows = SEO_CLIENTS_RECURRING.map((r) => r.client === "simple" ? { ...r, week: simple.weekDone, month: simple.monthDone, overdue: simple.overdue.length, onTime: simple.onTime } : r)
  return (
    <Card>
      <CardHeader>
        <div className="flex-1"><CardTitle>Zadania cykliczne SEO</CardTitle><CardDescription>Rutyna specjalistów na każdym kliencie SEO</CardDescription></div>
        <Badge variant="muted"><Repeat />ClickUp</Badge>
      </CardHeader>
      <CardContent className="overflow-x-auto pt-3">
        <table className="w-full min-w-[640px] text-[13px]">
          <thead><tr className="text-left text-[12px] text-muted-foreground">
            <th className="pb-2 font-medium">Klient</th><th className="pb-2 font-medium">Specjalista</th><th className="pb-2 font-medium">Tydzień</th><th className="pb-2 font-medium">Miesiąc</th><th className="pb-2 font-medium">Po terminie</th><th className="pb-2 text-right font-medium">Terminowość</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => {
              const c = CL[r.client], p = PEOPLE[r.specialist]
              return (
                <tr key={r.client} onClick={() => go(r.client === "simple" ? "usluga.simple.seo.cykliczne" : `klient.${r.client}.uslugi`)} className="cursor-pointer border-t transition hover:bg-muted/40">
                  <td className="py-2.5 pr-3"><div className="flex items-center gap-2.5"><ClientLogo name={c.name} size="sm" /><span className="font-medium">{c.name}</span></div></td>
                  <td className="py-2.5 pr-3"><div className="flex items-center gap-2"><Avatar name={p.name} color={p.color} size="xs" /><span className="text-foreground/80">{p.name.split(" ")[0]}</span></div></td>
                  {r.paused ? (
                    <td colSpan={4} className="py-2.5"><StatusBadge status="wstrzymany" /> <span className="ml-1 text-[12px] text-muted-foreground">zadania cykliczne zawieszone</span></td>
                  ) : (<>
                    <td className="py-2.5 pr-3"><div className="flex items-center gap-2"><Progress value={(r.week / 5) * 100} className="w-16" indicatorClassName="bg-brand-blue" /><span className="tnum">{r.week}/5</span></div></td>
                    <td className="py-2.5 pr-3"><div className="flex items-center gap-2"><Progress value={(r.month / 9) * 100} className="w-16" /><span className="tnum">{r.month}/9</span></div></td>
                    <td className="py-2.5 pr-3">{r.overdue ? <Badge variant="danger"><TriangleAlert />{r.overdue}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                    <td className={cn("py-2.5 text-right font-semibold tnum", r.onTime >= 90 ? "text-success" : r.onTime >= 75 ? "text-warning" : "text-danger")}>{r.onTime}%</td>
                  </>)}
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
