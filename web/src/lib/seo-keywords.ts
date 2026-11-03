// Monitoring pozycji fraz dla klienta Simple (dane przykładowe).
// Docelowo: monitoring pozycji z Senuto, odświeżany co tydzień.

export type KwGroup = "Sofy" | "Narożniki" | "Fotele" | "Pufy" | "Blog" | "Lokalne" | "Ogólne"

export interface Keyword {
  kw: string
  group: KwGroup
  volume: number // średnia liczba wyszukiwań miesięcznie
  start: number | null // pozycja na starcie współpracy (1 cze 2026); null = poza TOP100
  month: number | null // 4 tygodnie temu
  week: number | null // tydzień temu
  now: number | null // ostatni pomiar
  url: string
}

export const KW_CHECKED = "2026-09-28"
export const KW_GROUPS: KwGroup[] = ["Sofy", "Narożniki", "Fotele", "Pufy", "Blog", "Lokalne", "Ogólne"]

export const KEYWORDS: Keyword[] = [
  { kw: "narożnik", group: "Narożniki", volume: 110000, start: 64, month: 41, week: 36, now: 34, url: "/narozniki" },
  { kw: "sofa", group: "Sofy", volume: 74000, start: 52, month: 33, week: 29, now: 27, url: "/sofy" },
  { kw: "fotel", group: "Fotele", volume: 60500, start: 71, month: 48, week: 44, now: 39, url: "/fotele" },
  { kw: "kanapa", group: "Sofy", volume: 49500, start: 58, month: 37, week: 31, now: 30, url: "/sofy" },
  { kw: "narożnik z funkcją spania", group: "Narożniki", volume: 27100, start: 38, month: 19, week: 15, now: 12, url: "/narozniki/z-funkcja-spania" },
  { kw: "sofa rozkładana", group: "Sofy", volume: 22200, start: 29, month: 16, week: 13, now: 11, url: "/sofy/rozkladane" },
  { kw: "kanapa rozkładana", group: "Sofy", volume: 18100, start: 33, month: 13, week: 14, now: 14, url: "/sofy/rozkladane" },
  { kw: "fotel uszak", group: "Fotele", volume: 14800, start: 24, month: 15, week: 12, now: 9, url: "/fotele/uszaki" },
  { kw: "pufa", group: "Pufy", volume: 12100, start: 19, month: 11, week: 8, now: 7, url: "/pufy" },
  { kw: "meble tapicerowane", group: "Ogólne", volume: 9900, start: 44, month: 30, week: 26, now: 22, url: "/" },
  { kw: "sofa do salonu", group: "Sofy", volume: 8100, start: 21, month: 9, week: 7, now: 6, url: "/sofy" },
  { kw: "fotel wypoczynkowy", group: "Fotele", volume: 8100, start: 26, month: 14, week: 10, now: 8, url: "/fotele/wypoczynkowe" },
  { kw: "narożnik rozkładany", group: "Narożniki", volume: 6600, start: 31, month: 17, week: 13, now: 10, url: "/narozniki" },
  { kw: "sofa 3 osobowa", group: "Sofy", volume: 5400, start: 18, month: 8, week: 6, now: 5, url: "/sofy/3-osobowe" },
  { kw: "sofa welurowa", group: "Sofy", volume: 4400, start: 15, month: 7, week: 5, now: 4, url: "/sofy/welurowe" },
  { kw: "fotel obrotowy", group: "Fotele", volume: 4400, start: 40, month: 24, week: 25, now: 26, url: "/fotele" },
  { kw: "kanapa do salonu", group: "Sofy", volume: 3600, start: 30, month: 15, week: 12, now: 11, url: "/sofy" },
  { kw: "podnóżek", group: "Pufy", volume: 3600, start: 23, month: 14, week: 11, now: 9, url: "/pufy" },
  { kw: "sofa skandynawska", group: "Sofy", volume: 2900, start: 12, month: 6, week: 4, now: 3, url: "/sofy/skandynawskie" },
  { kw: "narożnik welurowy", group: "Narożniki", volume: 2900, start: 16, month: 9, week: 7, now: 6, url: "/narozniki/welurowe" },
  { kw: "sofa boucle", group: "Sofy", volume: 2400, start: 27, month: 12, week: 9, now: 8, url: "/sofy/boucle" },
  { kw: "fotel do czytania", group: "Blog", volume: 1900, start: null, month: 22, week: 9, now: 5, url: "/blog/fotel-do-czytania" },
  { kw: "sofa do małego salonu", group: "Blog", volume: 1600, start: 35, month: 8, week: 5, now: 3, url: "/blog/sofa-do-malego-salonu" },
  { kw: "jak dobrać sofę do salonu", group: "Blog", volume: 1300, start: null, month: null, week: 14, now: 4, url: "/blog/jak-dobrac-sofe" },
  { kw: "narożnik do małego salonu", group: "Narożniki", volume: 1300, start: 22, month: 10, week: 8, now: 7, url: "/narozniki" },
  { kw: "narożnik czy sofa", group: "Blog", volume: 1000, start: null, month: 12, week: 6, now: 6, url: "/blog/narożnik-czy-sofa" },
  { kw: "czyszczenie tapicerki welurowej", group: "Blog", volume: 880, start: null, month: null, week: null, now: 61, url: "/sofy/welurowe" },
  { kw: "sofa poznań", group: "Lokalne", volume: 880, start: 9, month: 4, week: 3, now: 2, url: "/" },
  { kw: "sklep z sofami", group: "Ogólne", volume: 720, start: 19, month: 7, week: 8, now: 8, url: "/" },
  { kw: "meble tapicerowane poznań", group: "Lokalne", volume: 590, start: 6, month: 3, week: 2, now: 1, url: "/" },
]

// Trend z 8 ostatnich tygodni (wykres w wierszu). Kotwice: start (ok. 17 tyg. temu), miesiąc (4 tyg.), tydzień (1 tyg.), teraz.
// null = fraza poza TOP100 w danym tygodniu.
export function trend(k: Keyword): (number | null)[] {
  const anchors: [number, number | null][] = [[17, k.start], [4, k.month], [1, k.week], [0, k.now]]
  const at = (w: number): number | null => {
    for (let i = 0; i < anchors.length - 1; i++) {
      const [w1, v1] = anchors[i], [w2, v2] = anchors[i + 1]
      if (w <= w1 && w >= w2) {
        if (v1 === null || v2 === null) return w === w2 ? v2 : null
        return Math.round(v2 + ((v1 - v2) * (w - w2)) / (w1 - w2))
      }
    }
    return null
  }
  return Array.from({ length: 8 }, (_, i) => at(7 - i))
}
