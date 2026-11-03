import { useEffect, useState } from "react"

// Hash w formie #widok.id.zakladka[.podzakladka] (tylko litery i kropki, żeby działał też w udostępnionym linku)
export interface Route { view: string; id?: string; tab?: string; sub?: string }

const parse = (): Route => {
  const [view, id, tab, sub] = (window.location.hash || "#pulpit").slice(1).split(".")
  return { view: view || "pulpit", id, tab, sub }
}

export function useRoute() {
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const on = () => { setRoute(parse()); document.querySelector("main")?.scrollTo({ top: 0 }) }
    window.addEventListener("hashchange", on)
    return () => window.removeEventListener("hashchange", on)
  }, [])
  return route
}

export const go = (hash: string) => { window.location.hash = hash }
