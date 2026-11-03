import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

export function CommandDialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-1/2 top-[18%] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border bg-popover shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <DialogPrimitive.Title className="sr-only">Szukaj</DialogPrimitive.Title>
          <CommandPrimitive className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
            {children}
          </CommandPrimitive>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
export function CommandInput(props: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center gap-2.5 border-b px-4">
      <Search className="size-4 text-muted-foreground" />
      <CommandPrimitive.Input className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" {...props} />
    </div>
  )
}
export function CommandList(props: React.ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List className="max-h-80 overflow-y-auto p-1.5" {...props} />
}
export const CommandEmpty = (props: React.ComponentProps<typeof CommandPrimitive.Empty>) => (
  <CommandPrimitive.Empty className="py-8 text-center text-sm text-muted-foreground" {...props} />
)
export const CommandGroup = CommandPrimitive.Group
export function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn("flex cursor-default select-none items-center gap-3 rounded-lg px-3 py-2 text-[13px] outline-none data-[selected=true]:bg-accent [&_svg]:size-4 [&_svg]:text-muted-foreground", className)}
      {...props}
    />
  )
}
