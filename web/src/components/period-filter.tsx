import * as React from "react"
import { CalendarDays, X } from "lucide-react"
import { cn, monthBounds } from "@/lib/utils"

// Okres: skrót miesiąca ("2026-09"), "all" albo własny zakres dat ("custom")
export interface Period { month: string; from: string; to: string }

export const periodOf = (month: string): Period => month === "all" ? { month, from: "", to: "" } : { month, ...monthBounds(month) }
export const inPeriod = (date: string, p: Period) => (!p.from || date >= p.from) && (!p.to || date <= p.to)
export const singleMonth = (p: Period) => (p.month !== "all" && p.month !== "custom" ? p.month : null)

export function usePeriod(initial: string) {
  return React.useState<Period>(() => periodOf(initial))
}

export function PeriodFilter({ value, onChange, months }: { value: Period; onChange: (p: Period) => void; months: { key: string; label: string }[] }) {
  const chip = (active: boolean) => cn("rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition whitespace-nowrap", active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")
  return (
    <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
      <div className="flex min-w-0 max-w-full overflow-x-auto rounded-full bg-muted p-1 [scrollbar-width:none]">
        {months.map((m) => <button key={m.key} onClick={() => onChange(periodOf(m.key))} className={chip(value.month === m.key)}>{m.label}</button>)}
        <button onClick={() => onChange(periodOf("all"))} className={chip(value.month === "all")}>Wszystko</button>
      </div>
      <div className={cn("flex h-9 items-center gap-2 rounded-full border bg-card px-3.5 text-[12.5px]", value.month === "custom" && "border-primary/60 ring-[3px] ring-primary/15")}>
        <CalendarDays className="size-4 text-muted-foreground" />
        <input
          type="date" aria-label="Od" value={value.from} max={value.to || undefined}
          onChange={(e) => onChange({ month: "custom", from: e.target.value, to: value.to })}
          className="w-[118px] bg-transparent outline-none tnum [&::-webkit-calendar-picker-indicator]:opacity-50"
        />
        <span className="text-muted-foreground">–</span>
        <input
          type="date" aria-label="Do" value={value.to} min={value.from || undefined}
          onChange={(e) => onChange({ month: "custom", from: value.from, to: e.target.value })}
          className="w-[118px] bg-transparent outline-none tnum [&::-webkit-calendar-picker-indicator]:opacity-50"
        />
        {value.month === "custom" && (
          <button onClick={() => onChange(periodOf(months[0].key))} className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Wyczyść zakres"><X className="size-3.5" /></button>
        )}
      </div>
    </div>
  )
}
