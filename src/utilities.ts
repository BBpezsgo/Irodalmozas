export function BasePath() {
    if (window.location.host.endsWith('.github.io')) {
        return `${window.location.origin}/CSVB.Torizes.io/`
    } else {
        return `${window.location.origin}/`
    }
}

export function CreateElement(htmlString: string): Element {
    const div = document.createElement(htmlString.startsWith('<tr') ? 'tbody' : 'div')
    div.innerHTML = htmlString.trim()
    const result = div.firstElementChild
    if (!result) { throw new Error("wtf?") }
    return result
}

export function TryGetElement(id: string | null | undefined) {
    if (!id) { return null }
    return document.getElementById(id)
}

export function GetElement(id: string | null | undefined) {
    const element = TryGetElement(id)
    if (!element)
    { throw new Error(`Element with id "${id}" not found`) }
    return element
}

export function GetImageElement(id: string) {
    const element = TryGetElement(id)
    if (!element)
    { throw new Error(`Element with id "${id}" not found`) }
    if (element.tagName.toLowerCase() !== 'img')
    { throw new Error(`Element with id "${id}" is not <img>`) }
    return element as HTMLImageElement
}

export function TryGetInputElement(id: string) {
    const elements = document.getElementsByTagName('input')
    return elements.namedItem(id)
}

export function GetInputElement(id: string) {
    const element =  TryGetInputElement(id)
    if (!element)
    { throw new Error(`Element with id "${id}" not found`) }
    return element
}

export function ClearElement(element: HTMLElement) { if (!element) return; while (element.lastChild) { element.removeChild(element.lastChild) } }

/** @author Angelos Chalaris @link https://www.30secondsofcode.org/js/s/levenshtein-distance */
export function LevenshteinDistance(s: string, t: string) {
    if (!s) return t.length
    if (!t) return s.length
    const arr = []
    for (let i = 0; i <= t.length; i++) {
      arr[i] = [i]
      for (let j = 1; j <= s.length; j++) {
        arr[i][j] =
          i === 0
            ? j
            : Math.min(
                arr[i - 1][j] + 1,
                arr[i][j - 1] + 1,
                arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
              )
      }
    }
    return arr[t.length][s.length]
}

export function NormalizeString(v: string): string { return v.trim().toLowerCase().replace(/\s+/g, ' ') }

/** @param maxDifference Must be larger than -1 @returns True if `b` is contained in `a` by the specified maximum difference */
export function CompareString(a: string, b: string, maxDifference: number, trueIfBEmpty = false): boolean {
    if (NormalizeString(b).length === 0 && trueIfBEmpty) return true
    if (maxDifference < 0) { throw new Error('CompareString parameter error: maxDifference must be larger than -1') }
    if (NormalizeString(a).includes(NormalizeString(b))) return true
    if (LevenshteinDistance(NormalizeString(a), NormalizeString(b)) <= maxDifference) return true
    return false
}

export function AssignObjects<T extends object>(values: any[], constructor: () => T) {
    for (let i = 0; i < values.length; i++) { values[i] = Object.assign(constructor(), values[i]) }
}

export function IsRectOverlaps(a: DOMRect, b: DOMRect) {
    return !(b.left > a.right ||
      b.right < a.left ||
      b.top > a.bottom ||
      b.bottom < a.top)
}

export function GetRect(e: HTMLElement) {
    const rect = e.getBoundingClientRect()
    const bodyRect = document.body.getBoundingClientRect()
    return new DOMRect(rect.x - bodyRect.x, rect.y - bodyRect.y, rect.width, rect.height)
}
