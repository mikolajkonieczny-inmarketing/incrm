import { createPersisted } from "@/lib/store"

// Dane przykładowe widoku SEO dla PM (klient Simple). Docelowo: API modułu SEO,
// do którego specjalista wpisuje realizację, treści i linki.

export type ContentType = "Wpis blogowy" | "Opis kategorii" | "Opis produktu"
// Kolejność statusów treści. Część ustawia specjalista SEO, część PM (to PM wysyła treści klientowi).
export type ContentStatus = "zlecone" | "w-trakcie" | "gotowe" | "wyslane" | "zaakceptowane" | "wdrozone"
export type LinkSource = "WhitePress" | "Linkhouse"
export type LinkStatus = "opublikowany" | "zamowiony" | "planowany"
export type WorkType = "Audyt" | "Optymalizacja" | "Linkowanie" | "Content"

export interface ContentItem { id: string; title: string; doc: string; type: ContentType; chars: number; date: string; status: ContentStatus; sentAt?: string; acceptedAt?: string; remindedAt?: string }
export interface LinkItem { id: string; title: string; url?: string; price: number; source: LinkSource; date: string; status: LinkStatus; target: string }
export interface WorkItem { id: string; date: string; type: WorkType; title: string; scope: string; note?: string }

export const CONTENT_FLOW: ContentStatus[] = ["zlecone", "w-trakcie", "gotowe", "wyslane", "zaakceptowane", "wdrozone"]
export const CONTENT_STATUS: Record<ContentStatus, { label: string; color: string; soft: string; ink: string; owner: "seo" | "pm" }> = {
  zlecone: { label: "Zlecone", color: "#b9c6ca", soft: "var(--muted)", ink: "var(--muted-foreground)", owner: "seo" },
  "w-trakcie": { label: "W trakcie", color: "var(--brand-blue)", soft: "var(--brand-blue-soft)", ink: "var(--brand-blue)", owner: "seo" },
  gotowe: { label: "Gotowe do wysyłki", color: "var(--primary)", soft: "var(--primary-soft)", ink: "var(--primary-ink)", owner: "seo" },
  wyslane: { label: "Wysłano do klienta", color: "var(--warning)", soft: "var(--warning-soft)", ink: "var(--warning)", owner: "pm" },
  zaakceptowane: { label: "Zaakceptowane", color: "#00a6d6", soft: "#e3f7fd", ink: "#007ea3", owner: "pm" },
  wdrozone: { label: "Wdrożone", color: "var(--success)", soft: "var(--success-soft)", ink: "var(--success)", owner: "seo" },
}
// PM może ustawić swój status tylko, gdy tekst jest już u niego (gotowy, wysłany albo zaakceptowany)
export const PM_CAN_EDIT: ContentStatus[] = ["gotowe", "wyslane", "zaakceptowane"]

export const LINK_STATUS: Record<LinkStatus, { label: string; badge: "success" | "blue" | "muted" }> = {
  opublikowany: { label: "Opublikowany", badge: "success" },
  zamowiony: { label: "Zamówiony", badge: "blue" },
  planowany: { label: "Planowany", badge: "muted" },
}
export const WORK_TYPE: Record<WorkType, { color: string; soft: string }> = {
  Audyt: { color: "#6E56CF", soft: "#f1eefc" },
  Optymalizacja: { color: "var(--brand-blue)", soft: "var(--brand-blue-soft)" },
  Linkowanie: { color: "#00a6d6", soft: "#e3f7fd" },
  Content: { color: "var(--primary-ink)", soft: "var(--primary-soft)" },
}

// Plan z umowy na dany miesiąc (zzs treści, zł na linki)
export const PLAN: Record<string, { content: number; links: number }> = {
  "2026-06": { content: 12000, links: 500 },
  "2026-07": { content: 16000, links: 600 },
  "2026-08": { content: 20000, links: 800 },
  "2026-09": { content: 20000, links: 800 },
}
export const SEO_MONTHS = [
  { key: "2026-09", label: "Wrzesień", short: "wrz" },
  { key: "2026-08", label: "Sierpień", short: "sie" },
  { key: "2026-07", label: "Lipiec", short: "lip" },
  { key: "2026-06", label: "Czerwiec", short: "cze" },
]
export const CURRENT_MONTH = "2026-09"

export const KPI: Record<string, { top10: number; top10d: number; top3: number; top3d: number; traffic: number; trafficd: number; health: number }> = {
  "2026-06": { top10: 121, top10d: 0.8, top3: 29, top3d: 3.6, traffic: 4230, trafficd: 2.1, health: 72 },
  "2026-07": { top10: 128, top10d: 5.8, top3: 32, top3d: 10.3, traffic: 4410, trafficd: 4.3, health: 78 },
  "2026-08": { top10: 137, top10d: 7.0, top3: 35, top3d: 9.4, traffic: 4620, trafficd: 4.8, health: 81 },
  "2026-09": { top10: 142, top10d: 3.6, top3: 38, top3d: 8.6, traffic: 4820, trafficd: 4.3, health: 86 },
}

const DOC = "https://docs.google.com/document/"

export const CONTENT: ContentItem[] = [
  // wrzesień
  { id: "c01", title: "Jak dobrać sofę do salonu? Poradnik", doc: DOC, type: "Wpis blogowy", chars: 2600, date: "2026-09-29", status: "wdrozone" },
  { id: "c02", title: "Fotel do czytania — na co zwrócić uwagę", doc: DOC, type: "Wpis blogowy", chars: 2400, date: "2026-09-29", status: "wdrozone" },
  { id: "c03", title: "Sofy rozkładane", doc: DOC, type: "Opis kategorii", chars: 3000, date: "2026-09-24", status: "wyslane", sentAt: "2026-09-24" },
  { id: "c04", title: "Narożniki z funkcją spania", doc: DOC, type: "Opis kategorii", chars: 3000, date: "2026-09-24", status: "wyslane", sentAt: "2026-09-24" },
  { id: "c05", title: "Pufa Nova welur — opis produktu", doc: DOC, type: "Opis produktu", chars: 1500, date: "2026-09-26", status: "zaakceptowane", sentAt: "2026-09-22", acceptedAt: "2026-09-28" },
  { id: "c06", title: "Jak pielęgnować tapicerkę welurową", doc: DOC, type: "Wpis blogowy", chars: 3500, date: "2026-09-30", status: "w-trakcie" },
  { id: "c07", title: "Trendy w meblach tapicerowanych 2027", doc: DOC, type: "Wpis blogowy", chars: 2500, date: "2026-09-29", status: "gotowe" },
  { id: "c08", title: "Fotel uszak Oslo — opis produktu", doc: DOC, type: "Opis produktu", chars: 1500, date: "2026-09-30", status: "zlecone" },
  // sierpień
  { id: "c09", title: "Sofa do małego salonu — 7 pomysłów", doc: DOC, type: "Wpis blogowy", chars: 3200, date: "2026-08-07", status: "wdrozone" },
  { id: "c10", title: "Jaki kolor sofy wybrać", doc: DOC, type: "Wpis blogowy", chars: 2800, date: "2026-08-14", status: "wdrozone" },
  { id: "c11", title: "Sofy", doc: DOC, type: "Opis kategorii", chars: 4000, date: "2026-08-18", status: "wdrozone" },
  { id: "c12", title: "Fotele", doc: DOC, type: "Opis kategorii", chars: 4000, date: "2026-08-21", status: "wdrozone" },
  { id: "c13", title: "Narożnik czy sofa? Porównanie", doc: DOC, type: "Wpis blogowy", chars: 3000, date: "2026-08-26", status: "wdrozone" },
  { id: "c14", title: "Sofa Bergen 3-osobowa — opis produktu", doc: DOC, type: "Opis produktu", chars: 2600, date: "2026-08-29", status: "wdrozone" },
  // lipiec
  { id: "c15", title: "Narożniki", doc: DOC, type: "Opis kategorii", chars: 4000, date: "2026-07-08", status: "wdrozone" },
  { id: "c16", title: "Jak zmierzyć salon przed zakupem sofy", doc: DOC, type: "Wpis blogowy", chars: 3500, date: "2026-07-15", status: "wdrozone" },
  { id: "c17", title: "Pufy i podnóżki", doc: DOC, type: "Opis kategorii", chars: 3000, date: "2026-07-21", status: "wdrozone" },
  { id: "c18", title: "Welur, boucle czy len? Tkaniny obiciowe", doc: DOC, type: "Wpis blogowy", chars: 3500, date: "2026-07-28", status: "wdrozone" },
  { id: "c19", title: "Fotel Nordic — opis produktu", doc: DOC, type: "Opis produktu", chars: 2000, date: "2026-07-30", status: "wdrozone" },
  // czerwiec
  { id: "c20", title: "Strona główna — tekst SEO", doc: DOC, type: "Opis kategorii", chars: 4000, date: "2026-06-17", status: "wdrozone" },
  { id: "c21", title: "Jak wybrać sofę rozkładaną do spania", doc: DOC, type: "Wpis blogowy", chars: 4000, date: "2026-06-24", status: "wdrozone" },
  { id: "c22", title: "Fotele wypoczynkowe", doc: DOC, type: "Opis kategorii", chars: 4000, date: "2026-06-29", status: "wdrozone" },
]

export const LINKS: LinkItem[] = [
  // wrzesień
  { id: "l01", title: "Jesienne metamorfozy salonu — 5 prostych zmian", url: "https://wnetrza-przyklad.pl/jesienne-metamorfozy-salonu", price: 145, source: "WhitePress", date: "2026-09-08", status: "opublikowany", target: "/sofy" },
  { id: "l02", title: "Wygodne miejsce do czytania w domu", url: "https://lifestyle-przyklad.pl/kacik-do-czytania", price: 120, source: "Linkhouse", date: "2026-09-16", status: "opublikowany", target: "/blog/fotel-do-czytania" },
  { id: "l03", title: "Producenci i sklepy meblowe w Wielkopolsce", url: "https://katalog-meble-przyklad.pl/wielkopolska", price: 80, source: "Linkhouse", date: "2026-09-21", status: "opublikowany", target: "/" },
  { id: "l04", title: "Pokój rodzinny, który przetrwa dzieci", price: 250, source: "WhitePress", date: "2026-09-28", status: "zamowiony", target: "/narozniki" },
  { id: "l05", title: "Aranżacja salonu w stylu skandynawskim", price: 190, source: "WhitePress", date: "2026-09-30", status: "planowany", target: "/fotele" },
  // sierpień
  { id: "l06", title: "Jak urządzić mały salon, żeby wydawał się większy", url: "https://wnetrza-przyklad.pl/maly-salon", price: 145, source: "WhitePress", date: "2026-08-05", status: "opublikowany", target: "/sofy" },
  { id: "l07", title: "Meble do salonu — przegląd trendów na jesień", url: "https://portal-dom-przyklad.pl/trendy-salon-jesien", price: 390, source: "WhitePress", date: "2026-08-12", status: "opublikowany", target: "/" },
  { id: "l08", title: "Odnawiamy stary fotel krok po kroku", url: "https://diy-przyklad.pl/stary-fotel", price: 110, source: "Linkhouse", date: "2026-08-20", status: "opublikowany", target: "/fotele" },
  { id: "l09", title: "Sklepy z meblami tapicerowanymi — zestawienie", url: "https://katalog-meble-przyklad.pl/tapicerowane", price: 60, source: "Linkhouse", date: "2026-08-27", status: "opublikowany", target: "/" },
  // lipiec
  { id: "l10", title: "Wakacyjny remont salonu — od czego zacząć", url: "https://remont-przyklad.pl/remont-salonu", price: 220, source: "WhitePress", date: "2026-07-09", status: "opublikowany", target: "/narozniki" },
  { id: "l11", title: "Kanapa czy narożnik do bloku?", url: "https://mieszkanie-przyklad.pl/kanapa-czy-naroznik", price: 180, source: "Linkhouse", date: "2026-07-17", status: "opublikowany", target: "/blog/narożnik-czy-sofa" },
  { id: "l12", title: "Najciekawsze polskie marki meblowe", url: "https://lifestyle-przyklad.pl/polskie-marki-meblowe", price: 150, source: "WhitePress", date: "2026-07-25", status: "opublikowany", target: "/" },
  // czerwiec
  { id: "l13", title: "Nowe sklepy meblowe online — czerwiec", url: "https://ecommerce-przyklad.pl/sklepy-meblowe-czerwiec", price: 200, source: "WhitePress", date: "2026-06-12", status: "opublikowany", target: "/" },
  { id: "l14", title: "Salon na lato — lekkie tkaniny i kolory", url: "https://wnetrza-przyklad.pl/salon-na-lato", price: 145, source: "WhitePress", date: "2026-06-19", status: "opublikowany", target: "/sofy" },
  { id: "l15", title: "Katalog firm — meble i wyposażenie", url: "https://katalog-meble-przyklad.pl/firmy", price: 90, source: "Linkhouse", date: "2026-06-26", status: "opublikowany", target: "/" },
]

export const WORK: WorkItem[] = [
  { id: "w01", date: "2026-09-29", type: "Content", title: "Publikacja 2 wpisów blogowych", scope: "Blog", note: "„Jak dobrać sofę do salonu”, „Fotel do czytania”" },
  { id: "w02", date: "2026-09-29", type: "Optymalizacja", title: "Aktualizacja mapowania fraz na URL", scope: "Cały serwis", note: "+34 frazy, 12 nowych URL" },
  { id: "w03", date: "2026-09-26", type: "Content", title: "Opis produktu Pufa Nova gotowy do wysyłki", scope: "Karta produktu" },
  { id: "w04", date: "2026-09-24", type: "Content", title: "2 opisy kategorii gotowe do wysyłki", scope: "Kategorie: sofy rozkładane, narożniki" },
  { id: "w05", date: "2026-09-21", type: "Linkowanie", title: "Link z katalogu branżowego", scope: "Strona główna", note: "Linkhouse, 80 zł" },
  { id: "w06", date: "2026-09-18", type: "Optymalizacja", title: "Wdrożenie danych strukturalnych Product", scope: "Karty produktów (212)", note: "Walidacja bez błędów" },
  { id: "w07", date: "2026-09-16", type: "Linkowanie", title: "Wpis gościnny na blogu lifestyle", scope: "/blog/fotel-do-czytania", note: "Linkhouse, 120 zł" },
  { id: "w08", date: "2026-09-10", type: "Optymalizacja", title: "Linkowanie wewnętrzne z bloga do kategorii", scope: "Blog → kategorie", note: "26 nowych linków wewnętrznych" },
  { id: "w09", date: "2026-09-08", type: "Linkowanie", title: "Artykuł sponsorowany na portalu wnętrzarskim", scope: "/sofy", note: "WhitePress, 145 zł" },
  { id: "w10", date: "2026-09-03", type: "Audyt", title: "Przegląd indeksacji w Google Search Console", scope: "Cały serwis", note: "38 stron wykluczonych, 6 do poprawy" },
  { id: "w11", date: "2026-08-29", type: "Content", title: "Opis produktu Sofa Bergen", scope: "Karta produktu" },
  { id: "w12", date: "2026-08-21", type: "Audyt", title: "Audyt Core Web Vitals", scope: "Karty produktów", note: "LCP 3,4 s, zgłoszone developerowi klienta" },
  { id: "w13", date: "2026-08-18", type: "Content", title: "Opisy kategorii Sofy i Fotele", scope: "Kategorie główne" },
  { id: "w14", date: "2026-08-12", type: "Linkowanie", title: "Artykuł na portalu ogólnopolskim", scope: "Strona główna", note: "WhitePress, 390 zł" },
  { id: "w15", date: "2026-08-04", type: "Optymalizacja", title: "Poprawa nagłówków H1–H3 w kategoriach", scope: "24 kategorie" },
  { id: "w16", date: "2026-07-16", type: "Optymalizacja", title: "Optymalizacja meta title i description", scope: "48 kategorii" },
  { id: "w17", date: "2026-07-09", type: "Linkowanie", title: "Artykuł o remoncie salonu", scope: "/narozniki", note: "WhitePress, 220 zł" },
  { id: "w18", date: "2026-07-02", type: "Audyt", title: "Analiza konkurencji w wynikach wyszukiwania", scope: "Frazy „sofa”, „narożnik”, „fotel”" },
  { id: "w19", date: "2026-06-24", type: "Audyt", title: "Audyt SEO — raport startowy", scope: "Cały serwis", note: "Przekazany klientowi" },
  { id: "w20", date: "2026-06-17", type: "Content", title: "Tekst SEO na stronę główną", scope: "Strona główna" },
  { id: "w21", date: "2026-06-10", type: "Optymalizacja", title: "Przekierowania 301 po starych adresach", scope: "142 adresy" },
  { id: "w22", date: "2026-06-05", type: "Audyt", title: "Konfiguracja GSC i GA4, dostępy", scope: "Narzędzia" },
]

// Statusy treści zmieniają się w widoku PM, więc trzymamy je we współdzielonym stanie
export const contentStore = createPersisted<ContentItem[]>("seo.content.v3", CONTENT)
