// Centrum powiadomień PM: zdarzenia od specjalistów i przypomnienia systemowe.
// Docelowo: zdarzenia z usług (SEO, Ads…) i rdzenia CRM.
import { createPersisted } from "@/lib/store"
import type { ContentStatus } from "@/lib/seo-data"

export type NotifKind = "content" | "link" | "work" | "recurring" | "client"

export interface Notif {
  id: string
  at: string // ISO data i godzina
  who: string // id osoby z PEOPLE albo "system"
  client: string
  kind: NotifKind
  verb: string
  object?: string
  meta?: string
  status?: ContentStatus
  contentId?: string
  href: string
  read: boolean
}

export const NOTIF_KINDS: Record<NotifKind, string> = {
  content: "Treści",
  link: "Linki",
  work: "Realizacja",
  recurring: "Zadania cykliczne",
  client: "Klienci",
}

const SEED: Notif[] = [
  { id: "n01", at: "2026-09-30T09:15", who: "mk", client: "simple", kind: "content", verb: "zlecił treść", object: "Fotel uszak Oslo — opis produktu", meta: "Opis produktu · 1 500 zzs", status: "zlecone", contentId: "c08", href: "usluga.simple.seo.content", read: false },
  { id: "n02", at: "2026-09-30T08:00", who: "system", client: "simple", kind: "client", verb: "Jutro ewaluacja 4-miesięczna", meta: "1 paź, 10:00 · biuro klienta", href: "klient.simple", read: false },
  { id: "n03", at: "2026-09-29T16:40", who: "mk", client: "simple", kind: "content", verb: "oznaczył tekst jako gotowy do wysyłki", object: "Trendy w meblach tapicerowanych 2027", meta: "Wpis blogowy · 2 500 zzs", status: "gotowe", contentId: "c07", href: "usluga.simple.seo.content", read: false },
  { id: "n04", at: "2026-09-29T14:20", who: "mk", client: "simple", kind: "content", verb: "wdrożył 2 teksty", object: "Jak dobrać sofę do salonu? · Fotel do czytania", meta: "Wpisy blogowe · 5 000 zzs na stronie", status: "wdrozone", href: "usluga.simple.seo.content", read: false },
  { id: "n05", at: "2026-09-29T11:02", who: "pw", client: "nordwood", kind: "work", verb: "podniósł budżet kampanii PMax o 15%", meta: "Google Ads", href: "klient.nordwood.aktywnosc", read: true },
  { id: "n06", at: "2026-09-28T16:45", who: "ks", client: "flora", kind: "content", verb: "przygotowała kreacje do akceptacji klienta", object: "3 kreacje · kampania jesienna", meta: "Meta Ads", href: "klient.flora.aktywnosc", read: false },
  { id: "n07", at: "2026-09-28T11:30", who: "mk", client: "simple", kind: "link", verb: "zamówił link", object: "Pokój rodzinny, który przetrwa dzieci", meta: "WhitePress · 250 zł", href: "usluga.simple.seo.linkowanie", read: true },
  { id: "n08", at: "2026-09-28T10:00", who: "mk", client: "simple", kind: "content", verb: "zaczął pisać tekst", object: "Jak pielęgnować tapicerkę welurową", meta: "Wpis blogowy · 3 500 zzs", status: "w-trakcie", contentId: "c06", href: "usluga.simple.seo.content", read: true },
  { id: "n09", at: "2026-09-26T09:00", who: "system", client: "simple", kind: "recurring", verb: "Zadanie cykliczne po terminie", object: "Weryfikacja publikacji artykułu z linkiem, uzupełnienie pliku", meta: "Termin minął 25 wrz · Mikołaj Konieczny", href: "usluga.simple.seo.cykliczne", read: false },
  { id: "n10", at: "2026-09-21T15:10", who: "mk", client: "simple", kind: "link", verb: "opublikował link", object: "Producenci i sklepy meblowe w Wielkopolsce", meta: "Linkhouse · 80 zł", href: "usluga.simple.seo.linkowanie", read: true },
  { id: "n11", at: "2026-09-18T16:10", who: "mk", client: "simple", kind: "work", verb: "dodał realizację", object: "Wdrożenie danych strukturalnych Product", meta: "Optymalizacja · 212 kart produktów", href: "usluga.simple.seo.realizacja", read: true },
  { id: "n12", at: "2026-09-18T09:30", who: "mk", client: "autopart", kind: "work", verb: "zgłosił 38 błędów 404 po migracji sklepu", meta: "SEO · audyt", href: "klient.autopart.aktywnosc", read: true },
]

export const notifStore = createPersisted<Notif[]>("notifications.v1", SEED)

// Zdarzenie „na żywo” w prototypie: po chwili specjalista oznacza kolejny tekst jako gotowy
export const LIVE_NOTIF: Omit<Notif, "at" | "read"> = {
  id: "n-live-1", who: "mk", client: "simple", kind: "content", verb: "oznaczył tekst jako gotowy do wysyłki",
  object: "Jak pielęgnować tapicerkę welurową", meta: "Wpis blogowy · 3 500 zzs", status: "gotowe", contentId: "c06", href: "usluga.simple.seo.content",
}
