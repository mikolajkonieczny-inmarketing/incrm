import { ArrowLeft, BarChart3, CalendarClock, FileText, ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge, Card } from "@/components/ui/primitives"
import { CL, MOD, type ModuleId } from "@/lib/data"
import { go, type Route } from "@/lib/router"

const PLANNED = [
  { icon: ListChecks, title: "Zadania specjalisty", desc: "Co jest w toku, co czeka na klienta, co zrobione." },
  { icon: BarChart3, title: "Wyniki", desc: "Widoczność, ruch, pozycje fraz, kondycja techniczna." },
  { icon: FileText, title: "Raporty", desc: "Raport miesięczny gotowy do wysyłki klientowi." },
  { icon: CalendarClock, title: "Historia", desc: "Każda akcja specjalisty trafia do zakładki Aktywność." },
]

export function ServicePage({ route }: { route: Route }) {
  const c = CL[route.id ?? ""]
  const m = MOD[route.tab as ModuleId]
  if (!c || !m) return <Card className="p-12 text-center text-muted-foreground">Nie znaleziono usługi.</Card>
  return (
    <div className="grid gap-6">
      <Card className="relative overflow-hidden p-8 sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-40 size-72 rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="relative grid max-w-2xl gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success"><span className="size-1.5 rounded-full bg-current" />Usługa aktywna</Badge>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{m.name} <span className="text-muted-foreground">· {c.name}</span></h1>
          <p className="text-[15px] leading-relaxed text-foreground/75">
            Podgląd tej usługi dla PM przygotujemy w kolejnym etapie. Znajdziesz tu to samo co przy SEO: postęp względem umowy, zadania specjalisty i wyniki.
          </p>
          <div><Button variant="outline" onClick={() => go(`klient.${c.id}.uslugi`)}><ArrowLeft />Wróć do usług klienta</Button></div>
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PLANNED.map((p) => (
          <Card key={p.title} className="p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary-ink"><p.icon className="size-5" /></div>
            <div className="mt-4 font-semibold">{p.title}</div>
            <p className="mt-1 text-[13px] text-muted-foreground">{p.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
