import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/primitives"
import { MOD, STATUS, type ModuleId, type Status, type Tier } from "@/lib/data"
import { cn } from "@/lib/utils"

const TIER_STYLE: Record<Tier, string> = {
  S: "bg-brand-blue text-white",
  A: "bg-brand-blue-soft text-brand-blue ring-1 ring-inset ring-brand-blue/15",
  B: "bg-primary-soft text-primary-ink ring-1 ring-inset ring-primary/20",
  C: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
}
export function TierBadge({ tier, className }: { tier: Tier; className?: string }) {
  return (
    <span title={`Tier ${tier}`} className={cn("inline-flex size-6 items-center justify-center rounded-md font-display text-[11.5px] font-semibold", TIER_STYLE[tier], className)}>
      {tier}
    </span>
  )
}

export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS[status]
  return (
    <Badge variant={s.variant}>
      <span className="relative flex size-1.5">
        {status === "zagrozony" && <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />}
        <span className="relative inline-flex size-1.5 rounded-full bg-current" />
      </span>
      {s.label}
    </Badge>
  )
}

export function ServiceBadge({ id, className }: { id: ModuleId; className?: string }) {
  return <Badge variant="outline" className={cn("bg-card font-normal text-foreground/80", className)}>{MOD[id].name}</Badge>
}

const LOGO_COLORS = ["#FF6F61", "#27398A", "#002A93", "#00A6D6", "#0F9960", "#C27400", "#6E56CF"]
export function ClientLogo({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const h = [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
  const color = LOGO_COLORS[h % LOGO_COLORS.length]
  const s = { sm: "size-8 text-[12px] rounded-lg", md: "size-9 text-[13px] rounded-[10px]", lg: "size-14 text-xl rounded-2xl" }[size]
  const ini = name.replace(/[^A-Za-zŁŚŻŹĆŃÓĘĄ ]/g, "").split(" ").filter(Boolean).map((p) => p[0]).join("").slice(0, 2)
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center font-display font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,.25)_inset,0_1px_2px_rgba(0,0,0,.12)]", s)}
      style={{ background: `linear-gradient(145deg, color-mix(in oklab, ${color} 88%, white), ${color})` }}
    >
      {ini}
    </div>
  )
}

export function Delta({ value, suffix = "%", invert }: { value: number; suffix?: string; invert?: boolean }) {
  const good = invert ? value < 0 : value >= 0
  const Icon = value >= 0 ? TrendingUp : TrendingDown
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11.5px] font-medium tnum", good ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>
      <Icon className="size-3" />
      {value > 0 ? "+" : ""}{String(value).replace(".", ",")}{suffix}
    </span>
  )
}

export function PageHeader({ title, description, actions, eyebrow }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; eyebrow?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1.5 text-[13px] text-muted-foreground">{eyebrow}</div>}
        <h1 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
        {description && <p className="mt-1 text-[14px] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="text-[12px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 break-words text-[13.5px] font-medium tnum">{children}</div>
    </div>
  )
}
