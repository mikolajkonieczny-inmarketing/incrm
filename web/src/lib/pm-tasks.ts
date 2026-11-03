// Taski PM: zapis zrobionej pracy na kliencie (timesheet PM). Docelowo: API rdzenia CRM.
import { createPersisted, createStore } from "@/lib/store"

// Typy tasków PM jak na liście w ClickUp (+ osobna wysyłka treści i „Inne”)
export type PmTaskType = "komunikacja" | "koordynacja" | "raport" | "tresci" | "budzet" | "faktury" | "dokumentacja" | "inne"

export const PM_TASK_TYPES: Record<PmTaskType, { label: string; hint: string; color: string; soft: string }> = {
  komunikacja: { label: "Komunikacja z klientem", hint: "spotkania, telefon, mail", color: "var(--primary-ink)", soft: "var(--primary-soft)" },
  koordynacja: { label: "Koordynacja prac wewnętrznych", hint: "ustalenia ze specjalistami, statusy zespołu", color: "var(--brand-blue)", soft: "var(--brand-blue-soft)" },
  raport: { label: "Raport miesięczny", hint: "analiza i wysyłka do klienta", color: "#007ea3", soft: "#e3f7fd" },
  tresci: { label: "Wysyłka treści", hint: "teksty do akceptacji klienta", color: "var(--success)", soft: "var(--success-soft)" },
  budzet: { label: "Budżet marketingowy", hint: "potwierdzenie budżetu i przekazanie informacji", color: "var(--warning)", soft: "var(--warning-soft)" },
  faktury: { label: "Fakturowanie i płatności", hint: "faktury, płatności, przypomnienia o zapłacie", color: "#6E56CF", soft: "#f1eefc" },
  dokumentacja: { label: "Dokumentacja i archiwizacja", hint: "umowy, aneksy, porządkowanie plików", color: "#4a5a60", soft: "#e9eff1" },
  inne: { label: "Inne", hint: "wszystko, co nie pasuje wyżej", color: "var(--muted-foreground)", soft: "var(--muted)" },
}
export const PM_TASK_ORDER: PmTaskType[] = ["komunikacja", "koordynacja", "raport", "tresci", "budzet", "faktury", "dokumentacja", "inne"]

export interface PmTask { id: string; client: string; title: string; desc: string; type: PmTaskType; minutes: number; date: string; author: string }

export const TASK_MONTHS = [
  { key: "2026-09", label: "Wrzesień" }, { key: "2026-08", label: "Sierpień" },
  { key: "2026-07", label: "Lipiec" }, { key: "2026-06", label: "Czerwiec" },
]
export const WEEK_START = "2026-09-28" // poniedziałek bieżącego tygodnia

const A = "Anna Lis"
const SEED: PmTask[] = [
  // Simple
  { id: "t01", client: "simple", title: "Wysyłka tekstu do akceptacji", desc: "„Trendy w meblach tapicerowanych 2027” wysłany Tomaszowi mailem.", type: "tresci", minutes: 10, date: "2026-09-30", author: A },
  { id: "t02", client: "simple", title: "Przygotowanie slajdów na ewaluację", desc: "Wyniki czerwiec–wrzesień, wdrożone rekomendacje, propozycja Google Ads.", type: "komunikacja", minutes: 90, date: "2026-09-30", author: A },
  { id: "t03", client: "simple", title: "Kontakt z klientem", desc: "Telefon z Tomaszem: potwierdzenie ewaluacji 1 paź, pytanie o LCP.", type: "komunikacja", minutes: 20, date: "2026-09-24", author: A },
  { id: "t04", client: "simple", title: "Wysyłka 2 opisów kategorii", desc: "Sofy rozkładane i narożniki do akceptacji.", type: "tresci", minutes: 15, date: "2026-09-24", author: A },
  { id: "t05", client: "simple", title: "Przypomnienie o akceptacji treści", desc: "Mail do Tomasza z listą tekstów czekających na akceptację.", type: "komunikacja", minutes: 10, date: "2026-09-29", author: A },
  { id: "t06", client: "simple", title: "Weryfikacja faktury wrześniowej", desc: "FV/09/2026/114, zgodność z aneksem nr 1.", type: "faktury", minutes: 15, date: "2026-09-01", author: A },
  { id: "t07", client: "simple", title: "Raport SEO za sierpień", desc: "Przegląd raportu od Mikołaja, komentarz PM, wysyłka.", type: "raport", minutes: 45, date: "2026-09-04", author: A },
  { id: "t08", client: "simple", title: "Status z Mikołajem", desc: "Plan treści na październik, priorytety linkowania.", type: "koordynacja", minutes: 30, date: "2026-09-15", author: A },
  { id: "t09", client: "simple", title: "Kontakt z developerem klienta", desc: "Mail do Pawła w sprawie poprawek Core Web Vitals.", type: "komunikacja", minutes: 15, date: "2026-08-22", author: A },
  { id: "t10", client: "simple", title: "Aneks nr 1 — zakres content", desc: "Przygotowanie aneksu, obieg podpisów.", type: "dokumentacja", minutes: 60, date: "2026-08-12", author: A },
  { id: "t11", client: "simple", title: "Spotkanie kick-off", desc: "Zakres, dostępy, harmonogram raportów.", type: "komunikacja", minutes: 75, date: "2026-06-02", author: A },
  // Pozostali klienci
  { id: "t12", client: "nordwood", title: "Status z zespołem Nordwood", desc: "Google Meet: Piotr, Kasia, Mikołaj. Wyniki PMax i plan na Q4.", type: "koordynacja", minutes: 45, date: "2026-09-30", author: A },
  { id: "t13", client: "nordwood", title: "Potwierdzenie budżetu PMax", desc: "Zgoda klienta na +15% budżetu, przekazane Piotrowi.", type: "budzet", minutes: 15, date: "2026-09-29", author: A },
  { id: "t14", client: "medica", title: "Analiza spadku konwersji", desc: "Zebranie danych od Piotra przed spotkaniem z klientem.", type: "koordynacja", minutes: 40, date: "2026-09-29", author: A },
  { id: "t15", client: "medica", title: "Próba kontaktu z klientem", desc: "Telefon bez odpowiedzi, wysłany mail z propozycją terminów.", type: "komunikacja", minutes: 10, date: "2026-09-28", author: A },
  { id: "t16", client: "flora", title: "Onboarding — dostępy", desc: "Instrukcja nadania dostępu do Menedżera firmy dla właścicielki.", type: "komunikacja", minutes: 25, date: "2026-09-28", author: A },
  { id: "t17", client: "autopart", title: "Propozycja przedłużenia umowy", desc: "Szkic warunków na kolejne 12 miesięcy.", type: "dokumentacja", minutes: 50, date: "2026-09-22", author: A },
  { id: "t18", client: "brewers", title: "Akceptacja kreacji", desc: "Przesłanie 3 kreacji od Kasi do klienta.", type: "tresci", minutes: 10, date: "2026-09-22", author: A },
]

export const pmTaskStore = createPersisted<PmTask[]>("pm.tasks.v3", SEED)

export function fmtDuration(min: number) {
  const h = Math.floor(min / 60), m = min % 60
  if (!h) return `${m} min`
  return m ? `${h} h ${m} min` : `${h} h`
}

/* ---------- globalny formularz taska ---------- */
export type TaskDraft = Partial<Pick<PmTask, "client" | "title" | "desc" | "type" | "minutes" | "date">>
export const taskDialogStore = createStore<{ open: boolean; task?: PmTask | null; draft?: TaskDraft; lockClient?: boolean }>({ open: false })
export const openTaskDialog = (opts: { task?: PmTask | null; draft?: TaskDraft; lockClient?: boolean } = {}) => taskDialogStore.set({ open: true, ...opts })
export const closeTaskDialog = () => taskDialogStore.set((s) => ({ ...s, open: false }))

/* ---------- timer ---------- */
export type TimerState = { startedAt: number; client?: string; type?: PmTaskType; title?: string } | null
export const timerStore = createPersisted<TimerState>("pm.timer.v1", null)
export const startTimer = (opts: Omit<NonNullable<TimerState>, "startedAt"> = {}) => timerStore.set({ startedAt: Date.now(), ...opts })
export const cancelTimer = () => timerStore.set(null)
export function stopTimer() {
  const t = timerStore.get()
  if (!t) return
  const minutes = Math.max(5, Math.ceil((Date.now() - t.startedAt) / 60000 / 5) * 5)
  timerStore.set(null)
  openTaskDialog({ draft: { client: t.client, type: t.type, title: t.title, minutes } })
}

/* ---------- szablony ---------- */
export const PM_TASK_TEMPLATES: { title: string; type: PmTaskType; minutes: number }[] = [
  { title: "Mail do klienta", type: "komunikacja", minutes: 10 },
  { title: "Telefon z klientem", type: "komunikacja", minutes: 15 },
  { title: "Spotkanie z klientem", type: "komunikacja", minutes: 60 },
  { title: "Status z zespołem", type: "koordynacja", minutes: 30 },
  { title: "Raport miesięczny", type: "raport", minutes: 45 },
  { title: "Wysyłka treści", type: "tresci", minutes: 10 },
  { title: "Potwierdzenie budżetu", type: "budzet", minutes: 15 },
  { title: "Sprawdzenie faktury", type: "faktury", minutes: 15 },
]
