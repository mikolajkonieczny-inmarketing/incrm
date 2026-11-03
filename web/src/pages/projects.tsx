import * as React from "react"
import { ArrowUpDown, ChevronRight, CircleAlert, Download, Ellipsis, ExternalLink, Layers, MessageSquare, Plus, Search, StickyNote, TriangleAlert, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, Input, Tooltip } from "@/components/ui/primitives"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Select } from "@/components/ui/overlays"
import { ClientLogo, PageHeader, ServiceBadge, StatusBadge, TierBadge } from "@/components/shared"
import { CLIENTS, MODULES, STATUS, type Client } from "@/lib/data"
import { go } from "@/lib/router"
import { cn, fmtLong, pln } from "@/lib/utils"

type SortKey = "name" | "tier" | "budget" | "start"
const TIER_ORDER = { S: 0, A: 1, B: 2, C: 3 }

export function Projects() {
  const [q, setQ] = React.useState("")
  const [status, setStatus] = React.useState("")
  const [tier, setTier] = React.useState("")
  const [svc, setSvc] = React.useState("")
  const [sort, setSort] = React.useState<{ key: SortKey; dir: 1 | -1 }>({ key: "budget", dir: -1 })

  const rows = CLIENTS.filter((c) =>
    (!q || `${c.name} ${c.legal} ${c.domain}`.toLowerCase().includes(q.toLowerCase())) &&
    (!status || c.status === status) && (!tier || c.tier === tier) && (!svc || c.services.includes(svc as never)),
  ).sort((a, b) => {
    const k = sort.key
    const v = k === "name" ? a.name.localeCompare(b.name) : k === "tier" ? TIER_ORDER[a.tier] - TIER_ORDER[b.tier] : k === "budget" ? a.budget - b.budget : a.start.localeCompare(b.start)
    return v * sort.dir
  })
  const filtered = q || status || tier || svc
  const total = rows.reduce((s, c) => s + c.budget, 0)

  const th = (key: SortKey, label: string, cls = "") => (
    <th className={cn("h-11 px-4 text-left text-[12px] font-medium text-muted-foreground", cls)}>
      <button onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }))} className={cn("inline-flex items-center gap-1 transition hover:text-foreground", sort.key === key && "text-foreground")}>
        {label}<ArrowUpDown className="size-3 opacity-60" />
      </button>
    </th>
  )

  const stats = [
    { label: "Wszyscy klienci", value: String(CLIENTS.length) },
    { label: "Aktywni", value: String(CLIENTS.filter((c) => c.status === "aktywny").length) },
    { label: "Budżet miesięczny", value: pln(CLIENTS.reduce((s, c) => s + c.budget, 0)) },
    { label: "Wymaga uwagi", value: String(CLIENTS.filter((c) => c.attention.length).length), tone: "text-danger" },
  ]

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Projekty"
        description="Wszyscy klienci, którymi się opiekujesz, z usługami i budżetem."
        actions={<>
          <Button variant="outline" onClick={() => toast("Eksport CSV pojawi się w kolejnym etapie")}><Download />Eksport</Button>
          <Button onClick={() => toast("Formularz nowego klienta pojawi się w kolejnym etapie")}><Plus />Dodaj klienta</Button>
        </>}
      />

      <Card className="grid grid-cols-2 divide-border lg:grid-cols-4 lg:divide-x">
        {stats.map((s, i) => (
          <div key={s.label} className={cn("px-5 py-4", i < 2 && "border-b lg:border-b-0", i % 2 === 0 && "border-r lg:border-r-0")}>
            <div className="text-[12.5px] text-muted-foreground">{s.label}</div>
            <div className={cn("mt-1 font-display text-[22px] font-semibold tracking-tight tnum", s.tone)}>{s.value}</div>
          </div>
        ))}
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj klienta lub domeny…" className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus} placeholder="Status" options={Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }))} />
        <Select value={tier} onValueChange={setTier} placeholder="Tier" options={["S", "A", "B", "C"].map((t) => ({ value: t, label: `Tier ${t}` }))} />
        <Select value={svc} onValueChange={setSvc} placeholder="Usługa" icon={<Layers />} options={MODULES.map((m) => ({ value: m.id, label: m.name }))} />
        {filtered && (
          <Button variant="ghost" size="sm" onClick={() => { setQ(""); setStatus(""); setTier(""); setSvc("") }}><X />Wyczyść</Button>
        )}
        <span className="ml-auto text-[12.5px] text-muted-foreground tnum">{rows.length} z {CLIENTS.length} klientów</span>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-[13.5px]">
            <thead className="border-b bg-muted/40">
              <tr>
                {th("name", "Klient", "pl-5")}
                {th("tier", "Tier")}
                <th className="h-11 px-4 text-left text-[12px] font-medium text-muted-foreground">Status</th>
                <th className="h-11 px-4 text-left text-[12px] font-medium text-muted-foreground">Usługi</th>
                {th("budget", "Budżet", "text-right [&>button]:ml-auto [&>button]:flex")}
                {th("start", "Start")}
                <th className="w-20" />
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => <Row key={c.id} c={c} />)}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="py-16 text-center text-muted-foreground">Żaden klient nie pasuje do filtrów.</td></tr>
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="border-t bg-muted/40">
                <tr>
                  <td className="px-5 py-3 text-[12.5px] text-muted-foreground" colSpan={4}>Razem</td>
                  <td className="px-4 py-3 text-right font-semibold tnum">{pln(total)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  )
}

function Row({ c }: { c: Client }) {
  const worst = c.attention.find((a) => a.sev === "bad") ?? c.attention.find((a) => a.sev === "warn")
  return (
    <tr onClick={() => go(`klient.${c.id}`)} className="group cursor-pointer border-b transition last:border-0 hover:bg-muted/40">
      <td className="px-4 py-3.5 pl-5">
        <div className="flex items-center gap-3">
          <ClientLogo name={c.name} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-medium">
              {c.name}
              {worst && (
                <Tooltip content={c.attention.map((a) => a.title).join(" · ")}>
                  <span className={worst.sev === "bad" ? "text-danger" : "text-warning"}>{worst.sev === "bad" ? <CircleAlert className="size-3.5" /> : <TriangleAlert className="size-3.5" />}</span>
                </Tooltip>
              )}
            </div>
            <div className="text-[12.5px] text-muted-foreground">{c.domain}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5"><TierBadge tier={c.tier} /></td>
      <td className="px-4 py-3.5"><StatusBadge status={c.status} /></td>
      <td className="px-4 py-3.5">
        <div className="flex flex-wrap gap-1">
          {c.services.slice(0, 2).map((s) => <ServiceBadge key={s} id={s} />)}
          {c.services.length > 2 && <Tooltip content={c.services.slice(2).join(", ")}><span className="rounded-md bg-muted px-1.5 py-0.5 text-[11.5px] text-muted-foreground">+{c.services.length - 2}</span></Tooltip>}
        </div>
      </td>
      <td className="px-4 py-3.5 text-right"><span className="font-semibold tnum">{pln(c.budget)}</span><div className="text-[11.5px] text-muted-foreground">miesięcznie</div></td>
      <td className="whitespace-nowrap px-4 py-3.5 text-foreground/80 tnum">{fmtLong(c.start)}</td>
      <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="opacity-60 group-hover:opacity-100" aria-label="Akcje"><Ellipsis /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => go(`klient.${c.id}`)}><ExternalLink />Otwórz projekt</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => go(`klient.${c.id}.notatki`)}><StickyNote />Notatki</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => go(`klient.${c.id}.czat`)}><MessageSquare />Zapytaj asystenta</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => toast("Edycja pojawi się w kolejnym etapie")}>Edytuj dane</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
      </td>
    </tr>
  )
}
