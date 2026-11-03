import * as React from "react"
import { Clock, Ellipsis, Pencil, Play, Plus, Square, Timer, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Progress, Textarea, Tooltip } from "@/components/ui/primitives"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Select } from "@/components/ui/overlays"
import { ClientLogo } from "@/components/shared"
import { PeriodFilter, inPeriod, usePeriod, type Period } from "@/components/period-filter"
import { CL, CLIENTS, ME } from "@/lib/data"
import {
  PM_TASK_ORDER, PM_TASK_TEMPLATES, PM_TASK_TYPES, TASK_MONTHS, WEEK_START, cancelTimer, closeTaskDialog, fmtDuration, openTaskDialog, pmTaskStore,
  startTimer, stopTimer, taskDialogStore, timerStore, type PmTask, type PmTaskType, type TaskDraft,
} from "@/lib/pm-tasks"
import { go } from "@/lib/router"
import { cn, fmt, plural, TODAY, toDate } from "@/lib/utils"

const TODAY_ISO = TODAY.toISOString().slice(0, 10)
const DAYS = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"]
const QUICK = [10, 15, 30, 45, 60, 90, 120]

export function TypeBadge({ type }: { type: PmTaskType }) {
  const t = PM_TASK_TYPES[type] ?? PM_TASK_TYPES.inne
  return <span className="inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-medium" style={{ background: t.soft, color: t.color }}>{t.label}</span>
}

/* ================= FORMULARZ ================= */

// Jeden formularz taska na całą aplikację; otwierany przez openTaskDialog() z dowolnego miejsca
export function PmTaskDialogHost() {
  const [st] = taskDialogStore.use()
  const task = st.task ?? null
  const clientId = st.lockClient ? st.draft?.client : undefined
  return (
    <Dialog open={st.open} onOpenChange={(o) => !o && closeTaskDialog()}>
      <DialogContent className="max-w-xl">
        <div>
          <DialogTitle>{task ? "Edytuj task" : "Nowy task"}</DialogTitle>
          <DialogDescription className="mt-1">Zapisz, co zostało zrobione i ile czasu to zajęło{clientId ? ` · ${CL[clientId].name}` : ""}.</DialogDescription>
        </div>
        {st.open && <TaskForm key={task?.id ?? JSON.stringify(st.draft ?? {})} clientId={clientId} task={task} draft={st.draft} onDone={closeTaskDialog} />}
      </DialogContent>
    </Dialog>
  )
}

// Podpowiedź po akcji PM: zapisz od razu albo popraw w formularzu
export function suggestTask(draft: Required<Pick<TaskDraft, "client" | "type" | "title" | "minutes">> & TaskDraft, headline: string) {
  const add = () => {
    const t: PmTask = { id: `t${Date.now()}`, author: ME.name, desc: "", date: TODAY_ISO, ...draft }
    pmTaskStore.set((all) => [t, ...all])
    toast.success("Task dodany", { description: `${t.title} · ${CL[t.client].name} · ${fmtDuration(t.minutes)}` })
  }
  toast(headline, {
    description: `Zapisać jako task PM? ${draft.title} · ${fmtDuration(draft.minutes)}`,
    duration: 9000,
    action: { label: "Dodaj", onClick: add },
    cancel: { label: "Zmień", onClick: () => openTaskDialog({ draft }) },
  })
}

function TaskForm({ clientId, task, draft, onDone }: { clientId?: string; task: PmTask | null; draft?: TaskDraft; onDone: () => void }) {
  const [, setTasks] = pmTaskStore.use()
  const init = task ?? draft ?? {}
  const [client, setClient] = React.useState(init.client ?? clientId ?? "")
  const [title, setTitle] = React.useState(init.title ?? "")
  const [desc, setDesc] = React.useState(init.desc ?? "")
  const [type, setType] = React.useState<PmTaskType | "">(init.type && init.type in PM_TASK_TYPES ? init.type : "")
  const [minutes, setMinutes] = React.useState(init.minutes ?? 0)
  const [date, setDate] = React.useState(init.date ?? TODAY_ISO)
  const [tried, setTried] = React.useState(false)
  const h = Math.floor(minutes / 60), m = minutes % 60
  const missing = { client: !client, title: !title.trim(), type: !type, time: minutes <= 0 }
  const invalid = Object.values(missing).some(Boolean)

  const pickType = (t: PmTaskType) => {
    // tytuł domyślnie jak typ, dopóki PM nie wpisze własnego
    if (!title.trim() || (type && title === PM_TASK_TYPES[type].label)) setTitle(PM_TASK_TYPES[t].label)
    setType(t)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (invalid) return
    const data = { client, title: title.trim(), desc: desc.trim(), type: type as PmTaskType, minutes, date }
    if (task) setTasks((all) => all.map((x) => (x.id === task.id ? { ...x, ...data } : x)))
    else setTasks((all) => [{ id: `t${Date.now()}`, author: ME.name, ...data }, ...all])
    toast.success(task ? "Zapisano zmiany" : "Task dodany", { description: `${data.title} · ${CL[client].name} · ${fmtDuration(minutes)}` })
    onDone()
  }

  const err = (k: keyof typeof missing) => tried && missing[k]

  return (
    <form className="grid gap-4" onSubmit={submit}>
      {!clientId && (
        <div className="grid gap-1.5">
          <Label>Klient</Label>
          <Select value={client} onValueChange={setClient} placeholder="Wybierz klienta" className={cn("w-full", err("client") && "border-danger")} options={CLIENTS.map((c) => ({ value: c.id, label: c.name }))} />
        </div>
      )}

      {!task && (
        <div className="grid gap-1.5">
          <Label>Szybki wybór</Label>
          <div className="flex flex-wrap gap-1.5">
            {PM_TASK_TEMPLATES.map((t) => {
              const on = title === t.title && type === t.type && minutes === t.minutes
              return (
                <button type="button" key={t.title} onClick={() => { setTitle(t.title); setType(t.type); setMinutes(t.minutes) }}
                  className={cn("inline-flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1.5 text-[12.5px] font-medium transition", on ? "border-solid border-foreground/30 bg-muted" : "bg-card hover:border-solid hover:border-foreground/20")}>
                  <span className="size-1.5 rounded-full" style={{ background: PM_TASK_TYPES[t.type].color }} />{t.title}<span className="text-muted-foreground tnum">{fmtDuration(t.minutes)}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid gap-1.5">
        <Label>Typ</Label>
        <div className={cn("grid grid-cols-1 gap-1.5 rounded-xl sm:grid-cols-2", err("type") && "ring-2 ring-danger/40 ring-offset-2")}>
          {PM_TASK_ORDER.map((t) => {
            const on = type === t, info = PM_TASK_TYPES[t]
            return (
              <button type="button" key={t} onClick={() => pickType(t)}
                className={cn("flex items-start gap-2.5 rounded-xl border px-3 py-2 text-left transition", on ? "border-transparent" : "bg-card hover:border-foreground/20")}
                style={on ? { background: info.soft, boxShadow: `inset 0 0 0 1.5px ${info.color}` } : undefined}>
                <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: info.color }} />
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-medium leading-snug" style={on ? { color: info.color } : undefined}>{info.label}</span>
                  <span className="block text-[11.5px] leading-snug text-muted-foreground">{info.hint}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="pt-title">Tytuł</Label>
        <Input id="pt-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="np. Kontakt z klientem" className={cn(err("title") && "border-danger")} autoFocus={!!clientId} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="pt-desc">Krótki opis</Label>
        <Textarea id="pt-desc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Co konkretnie, z kim, jaki efekt?" className="min-h-20" />
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-1.5">
          <Label>Ile czasu zajęło</Label>
          <div className="flex flex-wrap gap-1.5">
            {QUICK.map((q) => (
              <button type="button" key={q} onClick={() => setMinutes(q)} className={cn("rounded-full border px-3 py-1.5 text-[12.5px] font-medium tnum transition", minutes === q ? "border-primary bg-primary text-white" : "bg-card hover:border-foreground/20", err("time") && "border-danger/50")}>
                {fmtDuration(q).replace(" min", "m").replace(" h", "h").replace(" ", "")}
              </button>
            ))}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[13px]">
            <Input type="number" min={0} max={24} aria-label="Godziny" value={h || ""} placeholder="0" onChange={(e) => setMinutes(Math.max(0, Number(e.target.value) || 0) * 60 + m)} className="h-9 w-16 text-center tnum" />
            <span className="text-muted-foreground">h</span>
            <Input type="number" min={0} max={59} step={5} aria-label="Minuty" value={m || ""} placeholder="0" onChange={(e) => setMinutes(h * 60 + Math.min(59, Math.max(0, Number(e.target.value) || 0)))} className="h-9 w-16 text-center tnum" />
            <span className="text-muted-foreground">min</span>
            {minutes > 0 && <span className="ml-1 font-medium">= {fmtDuration(minutes)}</span>}
          </div>
        </div>
        <div className="grid content-start gap-1.5">
          <Label htmlFor="pt-date">Data</Label>
          <Input id="pt-date" type="date" value={date} max={TODAY_ISO} onChange={(e) => setDate(e.target.value)} className="w-40 tnum" />
        </div>
      </div>

      {tried && invalid && (
        <p className="text-[12.5px] text-danger">
          Uzupełnij: {[missing.client && "klienta", missing.type && "typ", missing.title && "tytuł", missing.time && "czas"].filter(Boolean).join(", ")}.
        </p>
      )}

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onDone}>Anuluj</Button>
        <Button type="submit"><Plus />{task ? "Zapisz zmiany" : "Dodaj task"}</Button>
      </div>
    </form>
  )
}

/* ================= ZAKŁADKA W KARCIE KLIENTA ================= */

function periodLabel(p: Period) {
  if (p.month === "all") return "od początku współpracy"
  if (p.month === "custom") return "wybrany zakres"
  return (TASK_MONTHS.find((x) => x.key === p.month)?.label ?? "").toLowerCase() + " 2026"
}

export function PmTasksTab({ clientId }: { clientId: string }) {
  const [all, setAll] = pmTaskStore.use()
  const [period, setPeriod] = usePeriod(TASK_MONTHS[0].key)
  const [type, setType] = React.useState<PmTaskType | "">("")
  const add = () => openTaskDialog({ draft: { client: clientId }, lockClient: true })
  const [timer] = timerStore.use()
  const [deleting, setDeleting] = React.useState<PmTask | null>(null)
  const mine = all.filter((x) => x.client === clientId)
  const inP = mine.filter((x) => inPeriod(x.date, period))
  const rows = inP.filter((x) => !type || x.type === type).sort((a, b) => b.date.localeCompare(a.date))
  const total = inP.reduce((a, x) => a + x.minutes, 0)
  const byType = PM_TASK_ORDER.map((t) => ({ t, min: inP.filter((x) => x.type === t).reduce((a, x) => a + x.minutes, 0) })).filter((x) => x.min > 0)
  const days = rows.reduce<Record<string, PmTask[]>>((acc, x) => { (acc[x.date] ??= []).push(x); return acc }, {})

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <PeriodFilter value={period} onChange={setPeriod} months={TASK_MONTHS} />
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" disabled={!!timer} onClick={() => { startTimer({ client: clientId }); toast("Pomiar czasu włączony", { description: `${CL[clientId].name} · zatrzymasz go w górnym pasku` }) }}><Play />{timer ? "Pomiar trwa" : "Start pomiaru"}</Button>
          <Button onClick={add}><Plus />Dodaj task</Button>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
          <div>
            <div className="text-[12.5px] text-muted-foreground">Twój czas na kliencie · {periodLabel(period)}</div>
            <div className="mt-1 font-display text-[30px] font-semibold tracking-tight tnum">{fmtDuration(total)}</div>
          </div>
          <div><div className="text-[12.5px] text-muted-foreground">Taski</div><div className="mt-1 font-display text-[22px] font-semibold tnum">{inP.length}</div></div>
          <div><div className="text-[12.5px] text-muted-foreground">Średnio na task</div><div className="mt-1 font-display text-[22px] font-semibold tnum">{inP.length ? fmtDuration(Math.round(total / inP.length)) : "—"}</div></div>
        </div>
        {total > 0 && (
          <>
            <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-muted">
              {byType.map((x) => <div key={x.t} className="h-full border-r-2 border-card last:border-r-0" style={{ width: `${(x.min / total) * 100}%`, background: PM_TASK_TYPES[x.t].color }} title={`${PM_TASK_TYPES[x.t].label}: ${fmtDuration(x.min)}`} />)}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px]">
              {byType.map((x) => (
                <span key={x.t} className="inline-flex items-center gap-2"><span className="size-2.5 rounded-[3px]" style={{ background: PM_TASK_TYPES[x.t].color }} /><span className="text-muted-foreground">{PM_TASK_TYPES[x.t].label}</span><span className="font-medium tnum">{fmtDuration(x.min)}</span></span>
              ))}
            </div>
          </>
        )}
      </Card>

      <div className="flex flex-wrap gap-1.5">
        {([["", "Wszystkie", inP.length], ...PM_TASK_ORDER.map((t) => [t, PM_TASK_TYPES[t].label, inP.filter((x) => x.type === t).length])] as [PmTaskType | "", string, number][]).map(([v, l, n]) => (
          <button key={l} onClick={() => setType(v)} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition", type === v ? "border-primary bg-primary text-white" : "bg-card text-foreground/80 hover:border-foreground/20")}>
            {l}<span className={cn("tnum", type === v ? "text-white/80" : "text-muted-foreground")}>{n}</span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted"><Timer className="size-5 text-muted-foreground" /></div>
          <div className="font-medium">Brak tasków w tym okresie</div>
          <p className="text-[13px] text-muted-foreground">Zapisuj kontakty z klientem, spotkania i wysyłki, żeby widzieć, ile czasu zajmuje ten klient.</p>
          <Button onClick={add}><Plus />Dodaj pierwszy task</Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {Object.entries(days).map(([day, list]) => {
            const d = toDate(day)
            return (
              <div key={day} className="border-b last:border-0">
                <div className="flex items-center justify-between bg-muted/50 px-5 py-2 text-[12px]">
                  <span className="font-medium">{day === TODAY_ISO ? "Dziś" : DAYS[d.getDay()].replace(/^./, (c) => c.toUpperCase())}, {fmt(day)}</span>
                  <span className="text-muted-foreground tnum">{fmtDuration(list.reduce((a, x) => a + x.minutes, 0))}</span>
                </div>
                {list.map((x) => (
                  <div key={x.id} className="group flex flex-wrap items-start gap-x-4 gap-y-1.5 border-t px-5 py-3.5 first:border-t-0 sm:flex-nowrap">
                    <div className="w-full shrink-0 pt-0.5 sm:w-[216px]"><TypeBadge type={x.type} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-medium">{x.title}</div>
                      {x.desc && <div className="mt-0.5 text-[12.5px] text-muted-foreground">{x.desc}</div>}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 pt-0.5 text-[13px] font-semibold tnum"><Clock className="size-3.5 text-muted-foreground" />{fmtDuration(x.minutes)}</div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" className="-my-1 opacity-50 group-hover:opacity-100" aria-label="Akcje taska"><Ellipsis /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => openTaskDialog({ task: x, draft: { client: x.client }, lockClient: true })}><Pencil />Edytuj</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem destructive onSelect={() => setDeleting(x)}><Trash2 />Usuń</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )
          })}
          <div className="flex items-center justify-between border-t bg-muted/50 px-5 py-2.5 text-[12.5px]">
            <span className="text-muted-foreground">Razem · {plural(rows.length, "task", "taski", "tasków")}</span>
            <span className="font-semibold tnum">{fmtDuration(rows.reduce((a, x) => a + x.minutes, 0))}</span>
          </div>
        </Card>
      )}

      <Dialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <div><DialogTitle>Usunąć task?</DialogTitle><DialogDescription className="mt-1.5">„{deleting?.title}” ({deleting && fmtDuration(deleting.minutes)}) zniknie z czasu na kliencie.</DialogDescription></div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>Anuluj</Button>
            <Button variant="destructive" onClick={() => { setAll((l) => l.filter((x) => x.id !== deleting!.id)); setDeleting(null); toast("Task usunięty") }}><Trash2 />Usuń</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ================= KARTA NA PULPIT ================= */

export function PmTimeCard() {
  const [all] = pmTaskStore.use()
  const week = all.filter((x) => x.date >= WEEK_START && x.date <= TODAY_ISO)
  const total = week.reduce((a, x) => a + x.minutes, 0)
  const perClient = Object.entries(week.reduce<Record<string, number>>((acc, x) => { acc[x.client] = (acc[x.client] ?? 0) + x.minutes; return acc }, {})).sort((a, b) => b[1] - a[1])
  const max = perClient[0]?.[1] ?? 1
  const latest = [...all].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <div className="flex-1"><CardTitle>Twój czas</CardTitle><CardDescription>Taski PM w tym tygodniu, od poniedziałku 28 wrz</CardDescription></div>
        <Button size="sm" onClick={() => openTaskDialog()}><Plus />Dodaj task</Button>
      </CardHeader>
      <CardContent className="grid gap-6 pt-4 lg:grid-cols-2">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[30px] font-semibold tracking-tight tnum">{fmtDuration(total)}</span>
            <span className="text-[13px] text-muted-foreground">{plural(week.length, "task", "taski", "tasków")}</span>
          </div>
          <div className="mt-4 grid gap-2.5">
            {perClient.map(([id, min]) => (
              <button key={id} onClick={() => go(`klient.${id}.zadania`)} className="grid grid-cols-[120px_1fr_auto] items-center gap-3 text-left text-[13px] transition hover:opacity-80">
                <span className="flex items-center gap-2 truncate"><ClientLogo name={CL[id].name} size="sm" /><span className="truncate font-medium">{CL[id].name}</span></span>
                <Progress value={(min / max) * 100} className="h-2" />
                <span className="whitespace-nowrap text-right font-medium tnum">{fmtDuration(min)}</span>
              </button>
            ))}
            {perClient.length === 0 && <p className="text-[13px] text-muted-foreground">W tym tygodniu nie ma jeszcze tasków.</p>}
          </div>
        </div>
        <div>
          <div className="mb-2 text-[12px] font-medium uppercase tracking-wider text-muted-foreground">Ostatnio dodane</div>
          <div className="grid gap-1">
            {latest.map((x) => (
              <button key={x.id} onClick={() => go(`klient.${x.client}.zadania`)} className="flex items-start gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-muted/50">
                <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: PM_TASK_TYPES[x.type].color }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">{x.title}</div>
                  <div className="truncate text-[12px] text-muted-foreground">{CL[x.client].name} · {x.date === TODAY_ISO ? "dziś" : fmt(x.date)}</div>
                </div>
                <Badge variant="muted" className="shrink-0 tnum">{fmtDuration(x.minutes)}</Badge>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ================= TIMER W GÓRNYM PASKU ================= */

const clock = (ms: number) => {
  const sec = Math.floor(ms / 1000), h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), ss = sec % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return h ? `${h}:${pad(m)}:${pad(ss)}` : `${pad(m)}:${pad(ss)}`
}

export function TimerControl() {
  const [timer] = timerStore.use()
  const [now, setNow] = React.useState(Date.now())
  React.useEffect(() => {
    if (!timer) return
    setNow(Date.now())
    const i = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(i)
  }, [timer])

  if (!timer) {
    return (
      <Tooltip content="Mierz czas taska">
        <Button variant="ghost" size="icon-sm" onClick={() => startTimer()} aria-label="Start pomiaru czasu"><Timer /></Button>
      </Tooltip>
    )
  }
  const label = timer.client ? CL[timer.client]?.name : timer.title
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-primary-soft py-0.5 pl-3 pr-0.5 text-[12.5px] font-medium text-primary-ink ring-1 ring-primary/25">
      <span className="relative mr-1.5 flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-primary" /></span>
      <span className="tnum">{clock(Math.max(0, now - timer.startedAt))}</span>
      {label && <span className="ml-1 hidden max-w-28 truncate text-primary-ink/80 sm:inline">· {label}</span>}
      <Tooltip content="Zatrzymaj i zapisz task">
        <button onClick={stopTimer} className="ml-1.5 inline-flex h-7 items-center gap-1 rounded-full bg-primary px-2.5 text-[12px] font-semibold text-white transition hover:bg-[#ff5f50]" aria-label="Zatrzymaj pomiar">
          <Square className="size-3 fill-current" />Stop
        </button>
      </Tooltip>
      <Tooltip content="Anuluj pomiar bez zapisu">
        <button onClick={() => { cancelTimer(); toast("Pomiar anulowany") }} className="inline-flex size-7 items-center justify-center rounded-full text-primary-ink/70 transition hover:bg-primary/10" aria-label="Anuluj pomiar"><X className="size-3.5" /></button>
      </Tooltip>
    </div>
  )
}
