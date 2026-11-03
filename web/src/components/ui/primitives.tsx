import * as React from "react"
import { Avatar as AvatarPrimitive, Progress as ProgressPrimitive, Separator as SeparatorPrimitive, Tooltip as TooltipPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ---------- Card ---------- */
export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("bg-card text-card-foreground rounded-xl border shadow-[0_1px_2px_rgba(28,31,30,.04)]", className)} {...props} />
}
export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-start gap-3 px-5 pt-5", className)} {...props} />
}
export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("text-[15px] font-semibold tracking-tight leading-none", className)} {...props} />
}
export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-muted-foreground text-[13px] mt-1.5", className)} {...props} />
}
export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-5 py-5", className)} {...props} />
}

/* ---------- Badge ---------- */
export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap [&_svg]:size-3 shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary-soft text-primary-ink",
        blue: "bg-brand-blue-soft text-brand-blue",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        danger: "bg-danger-soft text-danger",
        muted: "bg-muted text-muted-foreground",
        outline: "border text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
)
export function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

/* ---------- Avatar ---------- */
export function Avatar({ className, name, color, size = "md" }: { className?: string; name: string; color: string; size?: "xs" | "sm" | "md" | "lg" | "xl" }) {
  const s = { xs: "size-6 text-[10px]", sm: "size-7 text-[11px]", md: "size-8 text-xs", lg: "size-10 text-sm", xl: "size-14 text-lg" }[size]
  const ini = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
  return (
    <AvatarPrimitive.Root className={cn("relative flex shrink-0 overflow-hidden rounded-full ring-2 ring-card", s, className)}>
      <AvatarPrimitive.Fallback
        className="flex size-full items-center justify-center font-semibold text-white"
        style={{ background: `linear-gradient(135deg, ${color}, color-mix(in oklab, ${color} 70%, black))` }}
      >
        {ini}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

/* ---------- Progress ---------- */
export function Progress({ className, value, indicatorClassName }: { className?: string; value: number; indicatorClassName?: string }) {
  return (
    <ProgressPrimitive.Root className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-muted", className)} value={value}>
      <ProgressPrimitive.Indicator className={cn("h-full rounded-full bg-primary transition-all", indicatorClassName)} style={{ width: `${Math.min(100, value)}%` }} />
    </ProgressPrimitive.Root>
  )
}

/* ---------- Separator ---------- */
export function Separator({ className, orientation = "horizontal" }: { className?: string; orientation?: "horizontal" | "vertical" }) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={cn("bg-border shrink-0", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)}
    />
  )
}

/* ---------- Tooltip ---------- */
export const TooltipProvider = TooltipPrimitive.Provider
export function Tooltip({ children, content, side = "top" }: { children: React.ReactNode; content: React.ReactNode; side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <TooltipPrimitive.Root delayDuration={150}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content side={side} sideOffset={6} className="z-50 rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-md animate-in fade-in-0 zoom-in-95 max-w-72">
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

/* ---------- Input / Textarea ---------- */
export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-[13px] shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20",
        className,
      )}
      {...props}
    />
  )
}
export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-[13px] leading-relaxed shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 resize-y",
        className,
      )}
      {...props}
    />
  )
}
export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-xs font-medium text-muted-foreground", className)} {...props} />
}

/* ---------- Kbd ---------- */
export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return <kbd className={cn("inline-flex h-5 items-center rounded border bg-card px-1.5 font-mono text-[10px] font-medium text-muted-foreground", className)} {...props} />
}
