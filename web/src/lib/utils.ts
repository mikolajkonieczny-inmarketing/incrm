import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TODAY = new Date("2026-09-30T12:00:00")

const MS = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"]
const ML = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"]
export const MONTHS = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"]

export const toDate = (s: string) => new Date(s.length <= 10 ? s + "T12:00:00" : s)
export const fmt = (s: string) => { const d = toDate(s); return `${d.getDate()} ${MS[d.getMonth()]} ${d.getFullYear()}` }
export const fmtLong = (s: string) => { const d = toDate(s); return `${d.getDate()} ${ML[d.getMonth()]} ${d.getFullYear()}` }
export const fmtTime = (s: string) => { const d = toDate(s); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` }
export const daysSince = (s: string) => Math.round((TODAY.getTime() - toDate(s).getTime()) / 864e5)
export const pln = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " zł"
export const initials = (name: string) => name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()

export const lastDay = (monthKey: string) => new Date(Number(monthKey.slice(0, 4)), Number(monthKey.slice(5, 7)), 0).getDate()
export const monthBounds = (monthKey: string) => ({ from: `${monthKey}-01`, to: `${monthKey}-${String(lastDay(monthKey)).padStart(2, "0")}` })
export const group3 = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0")

// Odmiana polska: plural(3, "tekst", "teksty", "tekstów") → "3 teksty"
export function plural(n: number, one: string, few: string, many: string) {
  const w = n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many
  return `${n} ${w}`
}
