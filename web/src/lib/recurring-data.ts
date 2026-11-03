// Zadania cykliczne SEO: ten sam szablon dla każdego klienta SEO (jak listy cykliczne w ClickUp).
// Docelowo statusy przychodzą z ClickUp albo z widoku specjalisty.

export type Cell = "ok" | "late" | "missed" | "done" | "progress" | "todo"
// ok = na czas, late = po terminie, missed = niezrobione; done/progress/todo = bieżący okres

export interface RecurringTask { id: string; title: string; dueDay?: number; note?: string }

export const WEEKLY: RecurringTask[] = [
  { id: "w1", title: "Weryfikacja działania strony (menu, mobile itd.)" },
  { id: "w2", title: "Weryfikacja indeksacji nowych treści" },
  { id: "w3", title: "Przegląd monitoringu (Senuto)" },
  { id: "w4", title: "Analiza widoczności w Senuto" },
  { id: "w5", title: "GSC i analiza błędów" },
]

export const MONTHLY: RecurringTask[] = [
  { id: "m1", title: "Weryfikacja indeksacji publikacji sponsorowanych z poprzedniego miesiąca", dueDay: 5 },
  { id: "m9", title: "Przygotowanie raportu", dueDay: 5, note: "za poprzedni miesiąc" },
  { id: "m4", title: "Dobranie zaplecz do linkowania", dueDay: 14 },
  { id: "m2", title: "Przygotowanie artykułów sponsorowanych", dueDay: 15 },
  { id: "m3", title: "Analiza backlinków w Ahrefs", dueDay: 15 },
  { id: "m5", title: "Zakup linków", dueDay: 15 },
  { id: "m6", title: "Wygenerowanie artykułów sponsorowanych", dueDay: 15 },
  { id: "m7", title: "Weryfikacja publikacji artykułu z linkiem, uzupełnienie pliku", dueDay: 25 },
  { id: "m8", title: "Optymalizacja on-site", dueDay: 30 },
]

// Ostatnie 8 tygodni (poniedziałki); ostatni to bieżący tydzień
export const WEEKS = [
  { key: "2026-08-10", label: "10–16 sie" }, { key: "2026-08-17", label: "17–23 sie" }, { key: "2026-08-24", label: "24–30 sie" },
  { key: "2026-08-31", label: "31 sie–6 wrz" }, { key: "2026-09-07", label: "7–13 wrz" }, { key: "2026-09-14", label: "14–20 wrz" },
  { key: "2026-09-21", label: "21–27 wrz" }, { key: "2026-09-28", label: "28 wrz–4 paź" },
]
export const MONTHS = [
  { key: "2026-06", label: "cze" }, { key: "2026-07", label: "lip" }, { key: "2026-08", label: "sie" }, { key: "2026-09", label: "wrz" },
]
export const CURRENT_WEEK = { label: "28 wrz – 4 paź", due: "2026-10-02" }
export const CURRENT_MONTH_LABEL = "Wrzesień 2026"

export interface TaskState { cells: Cell[]; doneAt?: string; time?: string; who?: string }

// Klient Simple: historia (kolumny jak WEEKS / MONTHS) + szczegóły bieżącego okresu
export const SIMPLE_WEEKLY: Record<string, TaskState> = {
  w1: { cells: ["ok", "ok", "ok", "ok", "ok", "ok", "ok", "done"], doneAt: "2026-09-28", time: "20m" },
  w2: { cells: ["ok", "ok", "late", "ok", "ok", "ok", "ok", "done"], doneAt: "2026-09-29", time: "15m" },
  w3: { cells: ["ok", "ok", "ok", "ok", "ok", "missed", "ok", "todo"] },
  w4: { cells: ["ok", "ok", "ok", "ok", "late", "ok", "ok", "todo"] },
  w5: { cells: ["ok", "late", "ok", "ok", "ok", "ok", "ok", "progress"], time: "10m" },
}
export const SIMPLE_MONTHLY: Record<string, TaskState> = {
  m1: { cells: ["ok", "ok", "ok", "done"], doneAt: "2026-09-03", time: "25m" },
  m9: { cells: ["ok", "ok", "ok", "done"], doneAt: "2026-09-04", time: "1h 30m" },
  m4: { cells: ["ok", "ok", "ok", "done"], doneAt: "2026-09-11", time: "40m" },
  m2: { cells: ["ok", "late", "ok", "done"], doneAt: "2026-09-12", time: "30m" },
  m3: { cells: ["ok", "ok", "ok", "done"], doneAt: "2026-09-11", time: "45m" },
  m5: { cells: ["ok", "ok", "late", "late"], doneAt: "2026-09-21", time: "20m" },
  m6: { cells: ["ok", "ok", "ok", "done"], doneAt: "2026-09-14", time: "15m" },
  m7: { cells: ["ok", "ok", "late", "progress"], time: "10m" },
  m8: { cells: ["ok", "ok", "ok", "progress"], time: "2h 10m" },
}

// Zestawienie dla wszystkich klientów SEO (pulpit PM)
export const SEO_CLIENTS_RECURRING = [
  { client: "simple", specialist: "mk", week: 2, month: 7, overdue: 1, onTime: 91, paused: false },
  { client: "nordwood", specialist: "mk", week: 4, month: 8, overdue: 0, onTime: 97, paused: false },
  { client: "autopart", specialist: "mk", week: 1, month: 5, overdue: 3, onTime: 74, paused: false },
  { client: "techhub", specialist: "mk", week: 0, month: 0, overdue: 0, onTime: 0, paused: true },
]
