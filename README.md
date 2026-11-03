# inCRM

Prototyp modułowego CRM dla agencji [inmarketing](https://inmarketing.pl/). Pierwszy etap to widok **Project Managera** (PM): pulpit, projekty, karta klienta i podgląd usługi SEO. Widoki specjalistów (SEO, Ads itd.) powstaną osobno.

Dane w prototypie są przykładowe. Zmiany (notatki, taski, statusy treści) zapisują się tylko w przeglądarce.

## Uruchomienie

```bash
cd web
npm install
npm run dev -- --port 5180
```

Aplikacja: http://localhost:5180

## Co jest w widoku PM

- **Pulpit:** sprawy wymagające uwagi, agenda, puls kontaktu z klientami, czas PM w tygodniu, zadania cykliczne SEO na wszystkich klientach.
- **Projekty:** lista klientów z tierem, statusem, usługami, budżetem i datą startu.
- **Karta klienta:** przegląd, usługi, zespół, dokumenty, notatki, zadania PM z czasem, aktywność, czat AI (atrapa).
- **Usługa SEO:** przegląd (treści vs plan, budżet na linki), pozycje fraz, realizacja, content ze ścieżką statusów SEO/PM, linkowanie, zadania cykliczne.
- **Górny pasek:** wyszukiwarka (⌘K), pomiar czasu tasków, centrum powiadomień.

## Stack

React 19, TypeScript, Vite, Tailwind CSS 4, komponenty w stylu shadcn/ui (Radix), Recharts, Lucide.

## Wersja jednoplikowa

```bash
cd web
npm run build:artifact
```

Tworzy `web/dist-artifact/incrm-pm.html`, jeden plik HTML z całą aplikacją.
