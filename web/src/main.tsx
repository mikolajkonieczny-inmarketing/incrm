import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ChevronRight } from "lucide-react"
import { Toaster } from "sonner"
import "./index.css"
import { AppShell } from "@/components/app-shell"
import { TooltipProvider } from "@/components/ui/primitives"
import { CL, MOD, type ModuleId } from "@/lib/data"
import { useRoute } from "@/lib/router"
import { ClientPage } from "@/pages/client"
import { Dashboard } from "@/pages/dashboard"
import { Projects } from "@/pages/projects"
import { ServicePage } from "@/pages/service"
import { SeoServicePage } from "@/pages/service-seo"
import { PmTaskDialogHost } from "@/pages/pm-tasks"

function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex min-w-0 items-center gap-1.5">
      {items.map((it, i) => (
        <span key={i} className="flex min-w-0 items-center gap-1.5">
          {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />}
          {it.href ? <a href={it.href} className="truncate text-muted-foreground transition hover:text-foreground">{it.label}</a> : <span className="truncate font-medium">{it.label}</span>}
        </span>
      ))}
    </nav>
  )
}

function App() {
  const route = useRoute()
  const client = CL[route.id ?? ""]
  let page, crumbs
  if (route.view === "projekty") {
    page = <Projects />; crumbs = [{ label: "Projekty" }]
  } else if (route.view === "klient") {
    page = <ClientPage route={route} />; crumbs = [{ label: "Projekty", href: "#projekty" }, { label: client?.name ?? "Klient" }]
  } else if (route.view === "usluga") {
    page = route.tab === "seo" ? <SeoServicePage key={route.id} route={route} /> : <ServicePage route={route} />
    crumbs = [{ label: "Projekty", href: "#projekty" }, { label: client?.name ?? "Klient", href: `#klient.${route.id}.uslugi` }, { label: MOD[route.tab as ModuleId]?.name ?? "Usługa" }]
  } else {
    page = <Dashboard />; crumbs = [{ label: "Pulpit" }]
  }
  return (
    <TooltipProvider>
      <AppShell route={route} title={<Crumbs items={crumbs} />}>
        <div key={`${route.view}.${route.id}`} className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">{page}</div>
      </AppShell>
      <PmTaskDialogHost />
      <Toaster position="bottom-right" toastOptions={{ className: "!rounded-xl !border !bg-popover !text-popover-foreground !shadow-lg !font-sans" }} />
    </TooltipProvider>
  )
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>)
