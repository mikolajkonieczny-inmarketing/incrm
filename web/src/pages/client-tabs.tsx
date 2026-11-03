import * as React from "react"
import {
  Bot, CornerDownLeft, Download, Ellipsis, ExternalLink, File, FileSpreadsheet, FileText, Link2, MessageSquare, Pencil, Pin, PinOff,
  Plus, Presentation, Search, Send, Settings, Sparkles, Trash2, Upload, User,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Textarea } from "@/components/ui/primitives"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/overlays"
import type { FullClient } from "@/pages/client"
import { ACTIVITY, DOCS, ME, NOTES, PEOPLE, type ActSource, type Doc, type Note } from "@/lib/data"
import { createPersisted } from "@/lib/store"
import { cn, fmt, fmtLong, fmtTime, MONTHS, pln, toDate } from "@/lib/utils"

const notesStore = createPersisted<Record<string, Note[]>>("notes.v2", NOTES)
const docsStore = createPersisted<Record<string, Doc[]>>("docs.v2", DOCS)

export function useClientNotes(id: string) {
  const [all, set] = notesStore.use()
  return [all[id] ?? [], (fn: (n: Note[]) => Note[]) => set((p) => ({ ...p, [id]: fn(p[id] ?? []) }))] as const
}
export function useClientDocs(id: string) {
  const [all, set] = docsStore.use()
  return [all[id] ?? [], (fn: (d: Doc[]) => Doc[]) => set((p) => ({ ...p, [id]: fn(p[id] ?? []) }))] as const
}

/* ================= DOKUMENTY ================= */
const KIND: Record<Doc["kind"], { icon: typeof File; cls: string; label: string }> = {
  pdf: { icon: FileText, cls: "bg-danger-soft text-danger", label: "PDF" },
  docx: { icon: FileText, cls: "bg-brand-blue-soft text-brand-blue", label: "Word" },
  sheet: { icon: FileSpreadsheet, cls: "bg-success-soft text-success", label: "Arkusz Google" },
  gdoc: { icon: FileText, cls: "bg-brand-blue-soft text-brand-blue", label: "Dokument Google" },
  slides: { icon: Presentation, cls: "bg-warning-soft text-warning", label: "Prezentacja Google" },
  file: { icon: File, cls: "bg-muted text-muted-foreground", label: "Plik" },
  link: { icon: Link2, cls: "bg-muted text-muted-foreground", label: "Link" },
}
const kindFromUrl = (u: string): Doc["kind"] => /spreadsheets/.test(u) ? "sheet" : /document/.test(u) ? "gdoc" : /presentation/.test(u) ? "slides" : "link"

export function DocumentsTab({ c }: { c: FullClient }) {
  const [docs, setDocs] = useClientDocs(c.id)
  const [q, setQ] = React.useState("")
  const [over, setOver] = React.useState(false)
  const [linkOpen, setLinkOpen] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const match = (d: Doc) => d.title.toLowerCase().includes(q.toLowerCase())
  const files = docs.filter((d) => !d.url && match(d))
  const links = docs.filter((d) => d.url && match(d))

  const addFiles = (list: FileList) => {
    const added: Doc[] = [...list].map((f, i) => {
      const ext = (f.name.split(".").pop() ?? "").toLowerCase()
      const kind: Doc["kind"] = ext === "pdf" ? "pdf" : /docx?/.test(ext) ? "docx" : /xlsx?|csv/.test(ext) ? "sheet" : /pptx?/.test(ext) ? "slides" : "file"
      const size = f.size > 1e6 ? `${(f.size / 1e6).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(f.size / 1e3))} KB`
      return { id: `f${Date.now()}${i}`, kind, title: f.name, size, by: ME.name, date: "2026-09-30" }
    })
    setDocs((d) => [...added, ...d])
    toast.success(`Dodano ${added.length} ${added.length === 1 ? "plik" : "pliki"}`)
  }

  const row = (d: Doc) => {
    const k = KIND[d.kind]
    return (
      <div key={d.id} className="group flex items-center gap-3 px-5 py-3 transition hover:bg-muted/40">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", k.cls)}><k.icon className="size-[18px]" /></div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-medium">{d.title}</div>
          <div className="text-[12px] text-muted-foreground">{k.label}{d.size && ` · ${d.size}`} · {d.by} · {fmt(d.date)}</div>
        </div>
        {d.url ? (
          <Button variant="outline" size="sm" asChild><a href={d.url} target="_blank" rel="noopener noreferrer"><ExternalLink />Otwórz</a></Button>
        ) : (
          <Button variant="ghost" size="icon-sm" onClick={() => toast("Pobieranie zadziała po podpięciu magazynu plików")} aria-label="Pobierz"><Download /></Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Więcej"><Ellipsis /></Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => toast("Zmiana nazwy pojawi się w kolejnym etapie")}><Pencil />Zmień nazwę</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => { setDocs((all) => all.filter((x) => x.id !== d.id)); toast("Usunięto", { description: d.title }) }}><Trash2 />Usuń</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj dokumentu…" className="pl-9" />
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => setLinkOpen(true)}><Link2 />Dodaj link Google</Button>
          <Button onClick={() => fileRef.current?.click()}><Upload />Dodaj pliki</Button>
        </div>
        <input ref={fileRef} type="file" multiple hidden onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = "" }} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3"><div className="flex-1"><CardTitle>Załączniki</CardTitle><CardDescription>Umowy, aneksy, briefy, audyty</CardDescription></div><Badge variant="muted">{files.length}</Badge></CardHeader>
          <div className="divide-y border-t">{files.map(row)}{files.length === 0 && <div className="px-5 py-8 text-center text-[13px] text-muted-foreground">Brak plików</div>}</div>
          <div className="p-4">
            <button
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setOver(true) }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) }}
              className={cn("flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-[13px] text-muted-foreground transition", over ? "border-primary bg-primary-soft text-foreground" : "hover:border-foreground/20 hover:bg-muted/40")}
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-muted"><Upload className="size-4" /></div>
              <span><span className="font-medium text-foreground">Kliknij, aby dodać</span> albo przeciągnij pliki</span>
              <span className="text-[12px]">PDF, DOCX, XLSX, PPTX</span>
            </button>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="pb-3"><div className="flex-1"><CardTitle>Linki Google</CardTitle><CardDescription>Arkusze, dokumenty i prezentacje</CardDescription></div><Badge variant="muted">{links.length}</Badge></CardHeader>
          <div className="divide-y border-t">{links.map(row)}{links.length === 0 && <div className="px-5 py-8 text-center text-[13px] text-muted-foreground">Brak linków</div>}</div>
        </Card>
      </div>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent>
          <div><DialogTitle>Dodaj link Google</DialogTitle><DialogDescription className="mt-1">Typ (arkusz, dokument, prezentacja) rozpoznamy po adresie.</DialogDescription></div>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              const f = new FormData(e.currentTarget)
              const url = String(f.get("url")).trim(), title = String(f.get("title")).trim()
              setDocs((d) => [...d, { id: `l${Date.now()}`, kind: kindFromUrl(url), title, url, by: ME.name, date: "2026-09-30" }])
              setLinkOpen(false); toast.success("Link dodany", { description: title })
            }}
          >
            <div className="grid gap-1.5"><Label htmlFor="lt">Nazwa</Label><Input id="lt" name="title" required placeholder="np. Plan treści — październik" autoFocus /></div>
            <div className="grid gap-1.5"><Label htmlFor="lu">Adres URL</Label><Input id="lu" name="url" type="url" required placeholder="https://docs.google.com/spreadsheets/…" /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setLinkOpen(false)}>Anuluj</Button><Button type="submit"><Plus />Dodaj link</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ================= NOTATKI ================= */
const TAGS = ["Spotkanie", "Rozmowa", "Do zrobienia", "Techniczne", "Inne"]
const TAG_VARIANT: Record<string, "blue" | "success" | "warning" | "muted" | "default"> = { Spotkanie: "blue", Rozmowa: "success", "Do zrobienia": "default", Techniczne: "warning", Inne: "muted" }

export function NotesTab({ c }: { c: FullClient }) {
  const [notes, setNotes] = useClientNotes(c.id)
  const [editing, setEditing] = React.useState<Note | "new" | null>(null)
  const [deleting, setDeleting] = React.useState<Note | null>(null)
  const [q, setQ] = React.useState("")
  const list = notes
    .filter((n) => `${n.title} ${n.body}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date))
  const current = editing === "new" ? null : editing

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj w notatkach…" className="pl-9" />
        </div>
        <span className="text-[12.5px] text-muted-foreground tnum">{notes.length} notatek</span>
        <Button className="ml-auto" onClick={() => setEditing("new")}><Plus />Nowa notatka</Button>
      </div>

      {list.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted"><MessageSquare className="size-5 text-muted-foreground" /></div>
          <div className="font-medium">{q ? "Brak notatek dla tego wyszukiwania" : "Brak notatek"}</div>
          <p className="text-[13px] text-muted-foreground">Zapisuj ustalenia ze spotkań, rozmów i dostępy.</p>
          {!q && <Button onClick={() => setEditing("new")}><Plus />Dodaj pierwszą notatkę</Button>}
        </Card>
      ) : (
        <div className="columns-1 gap-4 md:columns-2 2xl:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {list.map((n) => (
            <Card key={n.id} className={cn("group p-5 transition hover:shadow-md", n.pinned && "border-primary/30 bg-gradient-to-b from-primary-soft/40 to-card")}>
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-1.5">
                    {n.tag && <Badge variant={TAG_VARIANT[n.tag] ?? "muted"}>{n.tag}</Badge>}
                    {n.pinned && <Badge variant="outline" className="bg-card"><Pin />Przypięta</Badge>}
                  </div>
                  <h3 className="text-[15px] font-semibold tracking-tight">{n.title}</h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" className="-mr-2 -mt-1 opacity-60 group-hover:opacity-100" aria-label="Akcje notatki"><Ellipsis /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setEditing(n)}><Pencil />Edytuj</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setNotes((all) => all.map((x) => x.id === n.id ? { ...x, pinned: !x.pinned } : x))}>{n.pinned ? <PinOff /> : <Pin />}{n.pinned ? "Odepnij" : "Przypnij"}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive onSelect={() => setDeleting(n)}><Trash2 />Usuń</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-foreground/80">{n.body}</p>
              <div className="mt-4 flex items-center gap-2 border-t pt-3 text-[12px] text-muted-foreground">
                <Avatar name={n.author} color={Object.values(PEOPLE).find((p) => p.name === n.author)?.color ?? "#6d717c"} size="xs" />
                <span>{n.author}</span><span>·</span><span>{fmt(n.date)}</span>{n.edited && <span>· edytowano</span>}
                <button onClick={() => setEditing(n)} className="ml-auto rounded px-1.5 py-0.5 font-medium text-foreground/70 opacity-0 transition hover:bg-muted group-hover:opacity-100">Edytuj</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-xl">
          <div><DialogTitle>{current ? "Edytuj notatkę" : "Nowa notatka"}</DialogTitle><DialogDescription className="mt-1">{c.name} · widoczna dla zespołu projektu</DialogDescription></div>
          <NoteForm
            key={current?.id ?? "new"}
            note={current}
            onCancel={() => setEditing(null)}
            onSave={(data) => {
              if (current) setNotes((all) => all.map((x) => x.id === current.id ? { ...x, ...data, edited: true } : x))
              else setNotes((all) => [{ id: `n${Date.now()}`, author: ME.name, date: "2026-09-30", pinned: false, ...data }, ...all])
              setEditing(null); toast.success(current ? "Zapisano zmiany" : "Notatka dodana")
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <div><DialogTitle>Usunąć notatkę?</DialogTitle><DialogDescription className="mt-1.5">„{deleting?.title}” zniknie dla całego zespołu projektu.</DialogDescription></div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>Anuluj</Button>
            <Button variant="destructive" onClick={() => { setNotes((all) => all.filter((x) => x.id !== deleting!.id)); setDeleting(null); toast("Notatka usunięta") }}><Trash2 />Usuń</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function NoteForm({ note, onSave, onCancel }: { note: Note | null; onSave: (d: { title: string; body: string; tag: string }) => void; onCancel: () => void }) {
  const [tag, setTag] = React.useState(note?.tag ?? "Spotkanie")
  return (
    <form className="grid gap-4" onSubmit={(e) => {
      e.preventDefault()
      const f = new FormData(e.currentTarget)
      onSave({ title: String(f.get("title")).trim() || "Bez tytułu", body: String(f.get("body")).trim(), tag })
    }}>
      <div className="grid gap-1.5"><Label htmlFor="nt">Tytuł</Label><Input id="nt" name="title" defaultValue={note?.title} placeholder="np. Ustalenia z ewaluacji" required autoFocus /></div>
      <div className="grid gap-1.5">
        <Label>Kategoria</Label>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((t) => (
            <button type="button" key={t} onClick={() => setTag(t)} className={cn("rounded-full border px-3 py-1 text-[12.5px] transition", tag === t ? "border-primary bg-primary text-white" : "hover:bg-muted")}>{t}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-1.5"><Label htmlFor="nb">Treść</Label><Textarea id="nb" name="body" defaultValue={note?.body} placeholder="Co ustaliliście? Kto co robi i do kiedy?" className="min-h-44" /></div>
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}>Anuluj</Button><Button type="submit">{note ? "Zapisz zmiany" : "Dodaj notatkę"}</Button></div>
    </form>
  )
}

/* ================= AKTYWNOŚĆ ================= */
const SRC: Record<ActSource, { label: string; icon: typeof User; cls: string }> = {
  seo: { label: "Specjalista SEO", icon: Sparkles, cls: "bg-primary-soft text-primary-ink ring-primary/20" },
  pm: { label: "PM", icon: User, cls: "bg-brand-blue-soft text-brand-blue ring-brand-blue/20" },
  klient: { label: "Klient", icon: MessageSquare, cls: "bg-success-soft text-success ring-success/20" },
  sys: { label: "System", icon: Settings, cls: "bg-muted text-muted-foreground ring-border" },
}

export function ActivityTab({ c }: { c: FullClient }) {
  const [filter, setFilter] = React.useState<ActSource | "all">("all")
  const all = ACTIVITY[c.id] ?? [{ src: "sys" as const, who: "System", text: `Utworzono projekt ${c.name}`, date: c.start + "T09:00" }]
  const list = all.filter((a) => filter === "all" || a.src === filter)
  const groups = list.reduce<Record<string, typeof list>>((acc, a) => {
    const d = toDate(a.date); const k = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
    ;(acc[k] ??= []).push(a); return acc
  }, {})

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
          {(["all", "seo", "pm", "klient", "sys"] as const).map((k) => (
            <button key={k} onClick={() => setFilter(k)} className={cn("rounded-md px-3 py-1.5 text-[12.5px] font-medium transition", filter === k ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {k === "all" ? "Wszystko" : SRC[k].label}
              <span className="ml-1.5 text-muted-foreground tnum">{k === "all" ? all.length : all.filter((a) => a.src === k).length}</span>
            </button>
          ))}
        </div>
        <span className="ml-auto inline-flex items-center gap-2 text-[12.5px] text-muted-foreground"><span className="size-1.5 animate-pulse rounded-full bg-success" />Wpisy specjalistów pojawiają się automatycznie</span>
      </div>

      <Card>
        <CardContent className="grid gap-8 py-6">
          {Object.entries(groups).map(([month, items]) => (
            <div key={month}>
              <div className="mb-4 text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{month}</div>
              <ol className="relative grid gap-5 before:absolute before:bottom-3 before:left-[17px] before:top-3 before:w-px before:bg-border">
                {items.map((a, i) => {
                  const s = SRC[a.src]
                  const p = PEOPLE[a.who]
                  return (
                    <li key={i} className="relative flex gap-4">
                      <div className={cn("z-10 flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-card", s.cls)}><s.icon className="size-4" /></div>
                      <div className="min-w-0 flex-1 pt-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                          <p className="text-[13.5px]"><span className="font-medium">{p ? p.name : a.who}</span> <span className="text-foreground/80">{a.text.charAt(0).toLowerCase() + a.text.slice(1)}</span></p>
                          <time className="shrink-0 text-[12px] text-muted-foreground tnum">{fmt(a.date)}, {fmtTime(a.date)}</time>
                        </div>
                        {a.detail && <div className="mt-1.5 inline-block rounded-lg bg-muted/70 px-3 py-1.5 text-[12.5px] text-foreground/75">{a.detail}</div>}
                        <div className="mt-1.5"><Badge variant="muted" className="font-normal">{s.label}</Badge></div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          ))}
          {list.length === 0 && <div className="py-8 text-center text-[13px] text-muted-foreground">Brak wpisów dla tego filtra.</div>}
        </CardContent>
      </Card>
    </div>
  )
}

/* ================= CZAT AI (atrapa wewnętrznego LLM) ================= */
interface Msg { who: "me" | "ai"; text: string; src?: string }

function answer(c: FullClient, q: string): Msg {
  const s = q.toLowerCase()
  const K = c.contact, B = c.billing, D = c.dates
  if (/telefon|numer|kontakt|zadzwoni|mail/.test(s))
    return { who: "ai", src: "Karta klienta · notatka „Dostępy”", text: `**${K.name}**${K.role ? `, ${K.role}` : ""}\nTelefon: ${K.phone}\nE-mail: ${K.email}\nPreferuje: ${K.prefers}.` + (c.id === "simple" ? "\n\nSprawy techniczne: developer klienta Paweł, pawel@simple-przyklad.pl." : "") }
  if (/umow|wypowiedz|okres|aneks|zakres/.test(s))
    return { who: "ai", src: "Umowa o świadczenie usług SEO.pdf · Aneks nr 1.pdf", text: `**${c.agreement}**, obowiązuje od ${D.contractStart ? fmtLong(D.contractStart) : "—"}.\n\n• Minimalny okres: do ${D.minTerm ? fmtLong(D.minTerm) : "—"}\n• Wypowiedzenie: ${B.notice}\n• Waloryzacja: ${D.indexation ? fmtLong(D.indexation) : "—"}` + (c.id === "simple" ? "\n• Aneks nr 1 (12 sie 2026): +4 artykuły miesięcznie" : "") }
  if (/bud|faktur|płat|plat|kwot|płaci|nip/.test(s))
    return { who: "ai", src: "Rozliczenia · historia faktur", text: `Budżet: **${pln(c.budget)} netto / mies.**\nPłatność: ${B.terms}.\n\nFaktury na: ${B.name}, NIP ${B.nip}\nWysyłka: ${B.invoiceEmail}\nOstatnia: FV/09/2026/114 z 1 wrz 2026, opłacona.` }
  if (/ewaluac|spotkan|przygot/.test(s))
    return { who: "ai", src: "Notatka „Ewaluacja — co przygotować” · wyniki SEO", text: `Ewaluacja: **${D.evaluation ? fmtLong(D.evaluation) : "brak terminu"}, 10:00**, biuro klienta w Poznaniu.\n\nCo pokazać:\n• frazy w TOP10: 120 → 142 (+18%)\n• ruch organiczny: 4 820 / mies. (+12%)\n• wdrożone: meta w 48 kategoriach, dane strukturalne na 212 produktach, 2 nowe artykuły\n\nNa co uważać: poprawki LCP czekają na developera klienta do listopada.\nOkazja: zapytaj o Google Ads od listopada, klient sam wspominał o sezonie.` }
  if (/dział|ostatn|podsum|nowego|zrobi|aktywn|tydzie/.test(s))
    return { who: "ai", src: "Zakładka Aktywność", text: "Ostatnie tygodnie:\n" + (ACTIVITY[c.id] ?? []).slice(0, 5).map((a) => `• ${fmt(a.date)}: ${a.text}${a.detail ? ` (${a.detail})` : ""}`).join("\n") }
  if (/seo|pozycj|wynik|ruch|fraz/.test(s))
    return { who: "ai", src: "Raport SEO za sierpień", text: "Wyniki SEO, wrzesień 2026:\n• frazy w TOP10: **142** (+18% od startu)\n• ruch organiczny: **4 820 / mies.** (+12%)\n• kondycja techniczna: 86/100\n\nOtwarty problem: LCP 3,4 s na kartach produktów." }
  return { who: "ai", text: `Mogę odpowiedzieć na pytania o ${c.name}: kontakty, zapisy umowy i aneksów, rozliczenia, historię współpracy, wyniki usług i przygotowanie do spotkań.\n\nTo prototyp, więc odpowiedzi są przykładowe. Docelowo odpowiada wewnętrzny model agencji podłączony do danych klienta.` }
}

function RichText({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((p, i) => p.startsWith("**") ? <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong> : <React.Fragment key={i}>{p}</React.Fragment>)}</>
}

const chats: Record<string, Msg[]> = {}

export function ChatTab({ c }: { c: FullClient }) {
  const [msgs, setMsgs] = React.useState<Msg[]>(() => chats[c.id] ?? [{ who: "ai", text: `Cześć Anna. Mam dostęp do umowy, aneksów, notatek, dokumentów i działań specjalistów dla **${c.name}**. O co chcesz zapytać?` }])
  const [typing, setTyping] = React.useState(false)
  const [input, setInput] = React.useState("")
  const end = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => { chats[c.id] = msgs; end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }) }, [msgs, typing, c.id])

  const ask = (q: string) => {
    q = q.trim(); if (!q || typing) return
    setMsgs((m) => [...m, { who: "me", text: q }]); setInput(""); setTyping(true)
    setTimeout(() => { setMsgs((m) => [...m, answer(c, q)]); setTyping(false) }, 900)
  }
  const sugg = ["Podaj numer do klienta", "Jaki mamy okres wypowiedzenia?", "Co się działo w ostatnich tygodniach?", "Przygotuj mnie do ewaluacji", "Ile płaci i na jakie dane faktura?"]

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
      <Card className="flex h-[min(680px,calc(100dvh-220px))] min-h-[480px] flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b px-5 py-3.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#27398A] to-[#1a2766] text-white shadow-sm"><Bot className="size-[18px]" /></div>
          <div className="flex-1"><div className="text-[14px] font-semibold">Asystent inmarketing</div><div className="text-[12px] text-muted-foreground">Wewnętrzny LLM · kontekst: {c.name}</div></div>
          <Badge variant="warning">Prototyp</Badge>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto bg-shell px-5 py-5">
          {msgs.map((m, i) => m.who === "me" ? (
            <div key={i} className="flex justify-end"><div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-brand-blue px-4 py-2.5 text-[13.5px] text-white">{m.text}</div></div>
          ) : (
            <div key={i} className="flex gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-blue-soft text-brand-blue"><Sparkles className="size-3.5" /></div>
              <div className="max-w-[85%]">
                <div className="whitespace-pre-wrap rounded-2xl rounded-tl-md border bg-card px-4 py-3 text-[13.5px] leading-relaxed shadow-xs"><RichText text={m.text} /></div>
                {m.src && <div className="mt-1.5 flex items-center gap-1.5 pl-1 text-[11.5px] text-muted-foreground"><FileText className="size-3" />Źródło: {m.src}</div>}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-brand-blue-soft text-brand-blue"><Sparkles className="size-3.5" /></div>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border bg-card px-4 py-3.5">
                {[0, 150, 300].map((d) => <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          )}
          <div ref={end} />
        </div>
        <div className="border-t bg-card p-3">
          <div className="mb-2.5 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
            {sugg.map((s) => <button key={s} onClick={() => ask(s)} className="shrink-0 rounded-full border bg-card px-3 py-1 text-[12px] text-foreground/80 transition hover:border-primary/50 hover:bg-primary-soft">{s}</button>)}
          </div>
          <form className="flex items-center gap-2 rounded-xl border bg-card p-1.5 pl-3.5 shadow-xs focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/20" onSubmit={(e) => { e.preventDefault(); ask(input) }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Zapytaj o ${c.name}: umowa, kontakty, historia…`} className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground" />
            <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex"><CornerDownLeft className="size-3" />Enter</span>
            <Button type="submit" size="icon-sm" disabled={!input.trim() || typing} aria-label="Wyślij"><Send /></Button>
          </form>
        </div>
      </Card>

      <Card className="h-fit">
        <CardHeader><CardTitle className="text-[14px]">Z czego korzysta asystent</CardTitle></CardHeader>
        <CardContent className="grid gap-2.5 pt-4 text-[13px]">
          {["Umowa i aneksy (PDF)", "Rozliczenia i faktury", "Kontakty po stronie klienta", "Notatki PM i zespołu", "Działania specjalistów", "Arkusze i dokumenty Google"].map((s) => (
            <div key={s} className="flex items-center gap-2.5"><div className="flex size-5 items-center justify-center rounded-full bg-success-soft text-success"><svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth={3}><path d="M20 6 9 17l-5-5" /></svg></div>{s}</div>
          ))}
          <p className="mt-2 rounded-lg bg-muted/60 p-3 text-[12.5px] leading-relaxed text-muted-foreground">Odpowiada tylko na podstawie danych tego klienta i zawsze podaje źródło.</p>
        </CardContent>
      </Card>
    </div>
  )
}
