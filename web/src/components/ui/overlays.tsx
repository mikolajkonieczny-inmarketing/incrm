import * as React from "react"
import { Dialog as DialogPrimitive, DropdownMenu as DM, Select as SelectPrimitive, Tabs as TabsPrimitive } from "radix-ui"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

/* ---------- Dialog ---------- */
export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close
export function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border bg-popover p-6 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground opacity-70 transition hover:bg-accent hover:opacity-100">
          <X className="size-4" />
          <span className="sr-only">Zamknij</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
export function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-lg font-semibold tracking-tight", className)} {...props} />
}
export function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-[13px] text-muted-foreground", className)} {...props} />
}

/* ---------- Dropdown ---------- */
export const DropdownMenu = DM.Root
export const DropdownMenuTrigger = DM.Trigger
export function DropdownMenuContent({ className, align = "end", ...props }: React.ComponentProps<typeof DM.Content>) {
  return (
    <DM.Portal>
      <DM.Content
        align={align}
        sideOffset={6}
        className={cn("z-50 min-w-44 overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", className)}
        {...props}
      />
    </DM.Portal>
  )
}
export function DropdownMenuItem({ className, destructive, ...props }: React.ComponentProps<typeof DM.Item> & { destructive?: boolean }) {
  return (
    <DM.Item
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none transition-colors focus:bg-accent [&_svg]:size-4 [&_svg]:text-muted-foreground",
        destructive && "text-danger focus:bg-danger-soft [&_svg]:text-danger",
        className,
      )}
      {...props}
    />
  )
}
export function DropdownMenuSeparator() {
  return <DM.Separator className="-mx-1 my-1 h-px bg-border" />
}
export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof DM.Label>) {
  return <DM.Label className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)} {...props} />
}

/* ---------- Select ---------- */
export function Select({ value, onValueChange, placeholder, options, className, icon }: {
  value: string; onValueChange: (v: string) => void; placeholder: string; options: { value: string; label: string }[]; className?: string; icon?: React.ReactNode
}) {
  const ALL = "__all"
  return (
    <SelectPrimitive.Root value={value || ALL} onValueChange={(v) => onValueChange(v === ALL ? "" : v)}>
      <SelectPrimitive.Trigger
        className={cn(
          "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border border-input bg-card px-3 text-[13px] shadow-xs outline-none transition hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-primary/20 data-[placeholder]:text-muted-foreground [&_svg]:size-4 [&_svg]:text-muted-foreground",
          value && "border-primary/50 bg-primary-soft/60",
          className,
        )}
      >
        {icon}
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild><ChevronDown className="ml-auto opacity-60" /></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content position="popper" sideOffset={6} className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border bg-popover p-1 shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <SelectPrimitive.Viewport>
            {[{ value: ALL, label: placeholder }, ...options].map((o) => (
              <SelectPrimitive.Item key={o.value} value={o.value} className="relative flex cursor-default select-none items-center rounded-md py-1.5 pl-2 pr-8 text-[13px] outline-none focus:bg-accent">
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2"><Check className="size-4 text-primary-ink" /></SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

/* ---------- Tabs ---------- */
export const Tabs = TabsPrimitive.Root
export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn("flex items-center gap-1 overflow-x-auto border-b [scrollbar-width:none]", className)} {...props} />
}
export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "relative -mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-3 pb-3 pt-2 text-[13px] font-medium text-muted-foreground transition hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:[&_svg]:text-primary [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  )
}
export const TabsContent = TabsPrimitive.Content
