import { useSyncExternalStore } from "react"

// Współdzielony stan prototypu zapisywany w localStorage (notatki, dokumenty).
// Docelowo zastąpi go API rdzenia CRM.
export function createPersisted<T>(key: string, initial: T) {
  return createStore(initial, key)
}

// Stan współdzielony między komponentami; z kluczem dodatkowo zapisywany w localStorage.
export function createStore<T>(initial: T, key?: string) {
  let value: T = initial
  if (key) {
    try {
      const raw = localStorage.getItem("incrm." + key)
      if (raw) value = JSON.parse(raw) as T
    } catch { /* brak dostępu do storage */ }
  }
  const subs = new Set<() => void>()
  const set = (next: T | ((prev: T) => T)) => {
    value = typeof next === "function" ? (next as (p: T) => T)(value) : next
    if (key) try { localStorage.setItem("incrm." + key, JSON.stringify(value)) } catch { /* ignoruj */ }
    subs.forEach((s) => s())
  }
  const subscribe = (cb: () => void) => { subs.add(cb); return () => { subs.delete(cb) } }
  const use = () => [useSyncExternalStore(subscribe, () => value), set] as const
  return { use, set, get: () => value }
}
