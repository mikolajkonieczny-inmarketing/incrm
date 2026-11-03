// Dane przykładowe prototypu. Docelowo: API rdzenia CRM + API modułów usług.

export type ModuleId = "seo" | "gads" | "meta" | "tiktok" | "linkedin" | "social" | "content" | "www" | "analytics"
export type Status = "aktywny" | "onboarding" | "zagrozony" | "wstrzymany" | "zakonczony"
export type Tier = "S" | "A" | "B" | "C"
export type Severity = "bad" | "warn" | "info"

export interface ServiceModule { id: ModuleId; name: string; group: "Performance" | "Kreacja" | "Tech"; desc: string; up: boolean; latency: number; uptime: string; version: string }
export interface Person { id: string; name: string; role: string; color: string; email: string; phone?: string; skills?: string[] }
export interface Attention { sev: Severity; title: string; detail: string }
export interface Client {
  id: string; name: string; legal: string; domain: string; tier: Tier; status: Status; services: ModuleId[]
  budget: number; start: string; lastContact: string; team: string[]; attention: Attention[]; health: number
  agreement?: string; comment?: string
  dates?: { contractStart: string; workStart: string; evaluation: string; minTerm: string; indexation: string; report: string }
  billing?: { name: string; nip: string; address: string; invoiceEmail: string; terms: string; notice: string }
  contact?: { name: string; role: string; phone: string; email: string; prefers: string }
}

export const MODULES: ServiceModule[] = [
  { id: "seo", name: "SEO", group: "Performance", desc: "Pozycjonowanie, audyty techniczne, content i link building.", up: true, latency: 42, uptime: "99,98%", version: "1.4.2" },
  { id: "gads", name: "Google Ads", group: "Performance", desc: "Kampanie w wyszukiwarce, Performance Max i Shopping.", up: true, latency: 38, uptime: "99,99%", version: "1.2.0" },
  { id: "meta", name: "Meta Ads", group: "Performance", desc: "Kampanie na Facebooku i Instagramie.", up: true, latency: 51, uptime: "99,95%", version: "1.1.3" },
  { id: "tiktok", name: "TikTok Ads", group: "Performance", desc: "Kampanie wideo i Spark Ads na TikToku.", up: false, latency: 0, uptime: "97,40%", version: "0.9.1" },
  { id: "linkedin", name: "LinkedIn Ads", group: "Performance", desc: "Kampanie B2B i lead generation.", up: true, latency: 47, uptime: "99,97%", version: "0.8.0" },
  { id: "social", name: "Social Media", group: "Kreacja", desc: "Prowadzenie profili i publikacje organiczne.", up: true, latency: 35, uptime: "99,99%", version: "1.0.4" },
  { id: "content", name: "Content", group: "Kreacja", desc: "Copywriting, blog i e-mail marketing.", up: true, latency: 33, uptime: "99,99%", version: "1.0.1" },
  { id: "www", name: "Strony WWW", group: "Tech", desc: "Projektowanie, wdrożenia i utrzymanie stron.", up: true, latency: 29, uptime: "100%", version: "0.6.0" },
  { id: "analytics", name: "Analityka", group: "Tech", desc: "Wdrożenia GA4, GTM i dashboardy.", up: true, latency: 44, uptime: "99,96%", version: "0.7.2" },
]
export const MOD = Object.fromEntries(MODULES.map((m) => [m.id, m])) as Record<ModuleId, ServiceModule>

export const ME: Person = { id: "al", name: "Anna Lis", role: "Project Manager", color: "#27398A", email: "anna.lis@inmarketing.pl" }

export const PEOPLE: Record<string, Person> = {
  al: ME,
  mk: { id: "mk", name: "Mikołaj Konieczny", role: "Specjalista SEO", color: "#FF6F61", email: "mikolaj.konieczny@inmarketing.pl", phone: "+48 600 111 222", skills: ["SEO techniczne", "Content", "E-commerce", "GA4"] },
  pw: { id: "pw", name: "Piotr Wrona", role: "Specjalista Google Ads", color: "#15935D", email: "piotr.wrona@inmarketing.pl" },
  ks: { id: "ks", name: "Kasia Sowa", role: "Specjalistka Meta Ads", color: "#B86E00", email: "kasia.sowa@inmarketing.pl" },
}

export const STATUS: Record<Status, { label: string; variant: "success" | "blue" | "danger" | "warning" | "muted" }> = {
  aktywny: { label: "Aktywny", variant: "success" },
  onboarding: { label: "Onboarding", variant: "blue" },
  zagrozony: { label: "Zagrożony", variant: "danger" },
  wstrzymany: { label: "Wstrzymany", variant: "warning" },
  zakonczony: { label: "Zakończony", variant: "muted" },
}

export const CLIENTS: Client[] = [
  {
    id: "simple", name: "Simple", legal: "Simple Sp. z o.o.", domain: "simple-przyklad.pl", tier: "C", status: "aktywny", services: ["seo"],
    budget: 8000, start: "2026-06-01", lastContact: "2026-09-24", team: ["mk"], health: 86,
    agreement: "Umowa o świadczenie usług SEO",
    attention: [
      { sev: "warn", title: "Ewaluacja po 4 miesiącach", detail: "Jutro, 1 paź 2026 o 10:00 · biuro klienta" },
      { sev: "info", title: "Raport SEO za wrzesień", detail: "Do wysłania do 5 paź 2026" },
    ],
    comment: "Klient zadowolony z pierwszych efektów: +18% fraz w TOP10 od startu. Na październik plan rozbudowy bloga (8 artykułów) i poprawki Core Web Vitals na kartach produktów. Na ewaluacji proponujemy rozszerzenie o Google Ads przed sezonem.",
    dates: { contractStart: "2026-06-01", workStart: "2026-06-03", evaluation: "2026-10-01", minTerm: "2026-11-30", indexation: "2027-06-01", report: "do 5. dnia miesiąca" },
    billing: { name: "Simple Sp. z o.o.", nip: "PL 7811234567", address: "ul. Półwiejska 12, 61-888 Poznań", invoiceEmail: "faktury@simple-przyklad.pl", terms: "Z góry, 14 dni", notice: "1 miesiąc · min. okres do 30 lis 2026" },
    contact: { name: "Tomasz Mazur", role: "Head of E-commerce", phone: "+48 512 345 678", email: "tomasz.mazur@simple-przyklad.pl", prefers: "Telefon rano, raporty mailem" },
  },
  { id: "nordwood", name: "Nordwood", legal: "Nordwood S.A.", domain: "nordwood.pl", tier: "S", status: "aktywny", services: ["seo", "gads", "meta"], budget: 32000, start: "2025-03-01", lastContact: "2026-09-29", team: ["mk", "pw", "ks"], health: 94, attention: [] },
  { id: "autopart", name: "AutoPart Pro", legal: "AutoPart Pro Sp. z o.o.", domain: "autopartpro.pl", tier: "A", status: "aktywny", services: ["gads", "seo"], budget: 18000, start: "2025-11-01", lastContact: "2026-09-18", team: ["pw", "mk"], health: 78, attention: [{ sev: "warn", title: "Koniec minimalnego okresu umowy", detail: "31 paź 2026 · przygotować propozycję przedłużenia" }] },
  { id: "medica", name: "Medica Clinic", legal: "Medica Clinic Sp. z o.o.", domain: "medicaclinic.pl", tier: "A", status: "zagrozony", services: ["gads", "content"], budget: 14000, start: "2025-01-10", lastContact: "2026-09-08", team: ["pw"], health: 41, attention: [{ sev: "bad", title: "Spadek konwersji o 22% m/m", detail: "Klient prosi o spotkanie · jutro 14:00" }, { sev: "bad", title: "Brak kontaktu od 22 dni", detail: "Ostatni kontakt 8 wrz 2026" }] },
  { id: "flora", name: "Flora Studio", legal: "Flora Studio s.c.", domain: "florastudio.pl", tier: "B", status: "onboarding", services: ["meta", "social"], budget: 6500, start: "2026-09-15", lastContact: "2026-09-28", team: ["ks"], health: 70, attention: [{ sev: "info", title: "Brak dostępu do Menedżera firmy", detail: "Onboarding wstrzymany na etapie dostępów" }] },
  { id: "techhub", name: "TechHub", legal: "TechHub Sp. z o.o.", domain: "techhub.pl", tier: "B", status: "wstrzymany", services: ["seo", "tiktok"], budget: 5000, start: "2026-02-01", lastContact: "2026-09-02", team: ["mk"], health: 55, attention: [{ sev: "warn", title: "Współpraca wstrzymana do 15 paź", detail: "Potwierdzić wznowienie z klientem" }] },
  { id: "brewers", name: "Brewers & Co", legal: "Brewers & Co Sp. z o.o.", domain: "brewers.pl", tier: "C", status: "aktywny", services: ["meta"], budget: 4000, start: "2026-04-01", lastContact: "2026-09-22", team: ["ks"], health: 88, attention: [] },
]
export const CL = Object.fromEntries(CLIENTS.map((c) => [c.id, c])) as Record<string, Client>

// Budżet pod opieką PM (zł / mies.)
export const PORTFOLIO = [
  { m: "kwi", v: 61000 }, { m: "maj", v: 61000 }, { m: "cze", v: 69000 }, { m: "lip", v: 69000 }, { m: "sie", v: 76000 }, { m: "wrz", v: 82500 },
]

// Tygodniowe wyniki SEO Simple od startu
export const SIMPLE_SEO = [
  { w: "1 cze", top10: 120, traffic: 1010 }, { w: "8 cze", top10: 119, traffic: 1030 }, { w: "15 cze", top10: 121, traffic: 1005 },
  { w: "22 cze", top10: 122, traffic: 1060 }, { w: "29 cze", top10: 121, traffic: 1080 }, { w: "6 lip", top10: 124, traffic: 1070 },
  { w: "13 lip", top10: 126, traffic: 1095 }, { w: "20 lip", top10: 125, traffic: 1110 }, { w: "27 lip", top10: 128, traffic: 1090 },
  { w: "3 sie", top10: 130, traffic: 1130 }, { w: "10 sie", top10: 131, traffic: 1150 }, { w: "17 sie", top10: 133, traffic: 1145 },
  { w: "24 sie", top10: 135, traffic: 1170 }, { w: "31 sie", top10: 137, traffic: 1185 }, { w: "7 wrz", top10: 138, traffic: 1190 },
  { w: "14 wrz", top10: 140, traffic: 1215 }, { w: "21 wrz", top10: 141, traffic: 1220 }, { w: "28 wrz", top10: 142, traffic: 1240 },
]

export interface Doc { id: string; kind: "pdf" | "docx" | "sheet" | "gdoc" | "slides" | "file" | "link"; title: string; size?: string; by: string; date: string; url?: string }
export const DOCS: Record<string, Doc[]> = {
  simple: [
    { id: "d1", kind: "pdf", title: "Umowa o świadczenie usług SEO — Simple.pdf", size: "412 KB", by: "Anna Lis", date: "2026-05-28" },
    { id: "d2", kind: "pdf", title: "Aneks nr 1 — zakres content.pdf", size: "188 KB", by: "Anna Lis", date: "2026-08-12" },
    { id: "d3", kind: "docx", title: "Brief klienta — Simple.docx", size: "64 KB", by: "Anna Lis", date: "2026-05-20" },
    { id: "d4", kind: "pdf", title: "Audyt SEO — czerwiec 2026.pdf", size: "2,1 MB", by: "Mikołaj Konieczny", date: "2026-06-24" },
    { id: "d5", kind: "sheet", title: "Słowa kluczowe i mapowanie URL", by: "Mikołaj Konieczny", date: "2026-09-29", url: "https://docs.google.com/spreadsheets/" },
    { id: "d6", kind: "gdoc", title: "Strategia SEO 2026/27", by: "Mikołaj Konieczny", date: "2026-09-10", url: "https://docs.google.com/document/" },
    { id: "d7", kind: "slides", title: "Raport kwartalny Q3 — prezentacja", by: "Anna Lis", date: "2026-09-27", url: "https://docs.google.com/presentation/" },
    { id: "d8", kind: "sheet", title: "Harmonogram publikacji bloga", by: "Mikołaj Konieczny", date: "2026-09-15", url: "https://docs.google.com/spreadsheets/" },
  ],
}

export interface Note { id: string; title: string; body: string; author: string; date: string; pinned: boolean; edited?: boolean; tag?: string }
export const NOTES: Record<string, Note[]> = {
  simple: [
    { id: "n1", title: "Ustalenia z kick-offu", tag: "Spotkanie", body: "• Priorytet: kategorie „sofy” i „fotele”, potem blog poradnikowy.\n• Raporty miesięczne mailem do Tomasza, kopia do Marty (marketing).\n• Akceptacja treści na blog: do 3 dni roboczych.\n• Klient nie chce zmian w nawigacji głównej przed Black Friday.", author: "Anna Lis", date: "2026-06-02", pinned: true },
    { id: "n2", title: "Ewaluacja — co przygotować", tag: "Do zrobienia", body: "Porównanie widoczności czerwiec vs wrzesień, ruch organiczny z GA4, lista wdrożonych rekomendacji.\n\nZapytać o budżet na Google Ads od listopada — klient wspominał o sezonie.", author: "Anna Lis", date: "2026-09-25", pinned: true },
    { id: "n3", title: "Dostępy", tag: "Techniczne", body: "GSC i GA4: nadane 3 cze.\nCMS (WordPress): konto dla Mikołaja, rola Redaktor.\nBrak dostępu do serwera — zmiany techniczne przez developera klienta (Paweł, pawel@simple-przyklad.pl).", author: "Mikołaj Konieczny", date: "2026-06-05", pinned: false },
    { id: "n4", title: "Telefon 24.09", tag: "Rozmowa", body: "Tomasz potwierdził ewaluację 1.10 o 10:00. Pyta, czy da się przyspieszyć poprawki LCP — developer ma czas dopiero w listopadzie.", author: "Anna Lis", date: "2026-09-24", pinned: false },
  ],
}

export type ActSource = "seo" | "pm" | "klient" | "sys"
export interface Activity { src: ActSource; who: string; text: string; date: string; detail?: string }
export const ACTIVITY: Record<string, Activity[]> = {
  simple: [
    { src: "seo", who: "mk", text: "Opublikował 2 artykuły na blogu", detail: "„Jak dobrać sofę do salonu” · „Fotel do czytania — poradnik”", date: "2026-09-29T14:20" },
    { src: "seo", who: "mk", text: "Zaktualizował arkusz słów kluczowych", detail: "+34 frazy · mapowanie na 12 nowych URL", date: "2026-09-29T10:05" },
    { src: "pm", who: "al", text: "Rozmowa telefoniczna z Tomaszem Mazurem", detail: "Potwierdzony termin ewaluacji: 1 paź, 10:00", date: "2026-09-24T09:40" },
    { src: "seo", who: "mk", text: "Wdrożył dane strukturalne Product", detail: "212 kart produktów · walidacja bez błędów", date: "2026-09-18T16:10" },
    { src: "klient", who: "Tomasz Mazur", text: "Zaakceptował plan treści na październik", date: "2026-09-15T11:30" },
    { src: "pm", who: "al", text: "Wysłała raport SEO za sierpień", date: "2026-09-04T13:15" },
    { src: "sys", who: "System", text: "Wystawiono fakturę FV/09/2026/114", detail: "8 000 zł netto · termin 15 wrz", date: "2026-09-01T08:00" },
    { src: "seo", who: "mk", text: "Audyt Core Web Vitals", detail: "LCP 3,4 s na kartach produktów · zgłoszono developerowi klienta", date: "2026-08-21T15:00" },
    { src: "pm", who: "al", text: "Dodała aneks nr 1 — zakres content", detail: "+4 artykuły miesięcznie", date: "2026-08-12T10:20" },
    { src: "seo", who: "mk", text: "Zoptymalizował meta title i description", detail: "48 kategorii", date: "2026-07-16T12:45" },
    { src: "seo", who: "mk", text: "Przekazał audyt SEO (czerwiec 2026)", date: "2026-06-24T17:00" },
    { src: "pm", who: "al", text: "Spotkanie kick-off z klientem", date: "2026-06-02T11:00" },
    { src: "sys", who: "System", text: "Utworzono projekt i dodano usługę SEO", date: "2026-06-01T09:00" },
  ],
}

export const AGENDA = [
  { day: "Dziś", date: "śr, 30 wrz", items: [
    { time: "11:00", end: "11:45", title: "Status z Nordwood", sub: "Google Meet · Piotr, Kasia, Mikołaj", kind: "meet" as const, client: "nordwood" },
    { time: "15:30", end: "16:30", title: "Przygotowanie ewaluacji Simple", sub: "Slajdy z Mikołajem", kind: "task" as const, client: "simple" },
  ]},
  { day: "Jutro", date: "czw, 1 paź", items: [
    { time: "10:00", end: "11:30", title: "Ewaluacja 4-miesięczna — Simple", sub: "Biuro klienta, Poznań", kind: "meet" as const, client: "simple" },
    { time: "14:00", end: "15:00", title: "Medica Clinic — spadek konwersji", sub: "Teams · pilne", kind: "urgent" as const, client: "medica" },
  ]},
  { day: "Pon", date: "5 paź", items: [
    { time: "—", end: "", title: "Termin raportów miesięcznych", sub: "5 klientów", kind: "deadline" as const, client: "" },
  ]},
]

export const FEED = [
  { who: "mk", client: "simple", mod: "seo" as ModuleId, text: "opublikował 2 artykuły na blogu", when: "wczoraj, 14:20" },
  { who: "pw", client: "nordwood", mod: "gads" as ModuleId, text: "podniósł budżet PMax o 15%", when: "wczoraj, 11:02" },
  { who: "ks", client: "flora", mod: "meta" as ModuleId, text: "wysłała 3 kreacje do akceptacji", when: "28 wrz, 16:45" },
  { who: "mk", client: "autopart", mod: "seo" as ModuleId, text: "zgłosił 38 błędów 404 po migracji", when: "28 wrz, 09:10" },
  { who: "pw", client: "medica", mod: "gads" as ModuleId, text: "wstrzymał 2 grupy reklam o niskim CR", when: "27 wrz, 13:30" },
]
