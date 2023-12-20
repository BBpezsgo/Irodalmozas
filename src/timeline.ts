import * as Time from './big-date'
import * as Utils from './utilities'
import { Data, Man } from './data'

export const OFFSET_Y = 60

export type TimelinePoint = {
    date: Time.BigDate
    label: string
}

export type TimelineInterval = {
    interval: { start: Time.BigDate, end: Time.BigDate }
    label: string
    indent: number
}

function FormatDate(date: Time.BigDate) {
    return `${date.year}. ${date.month}. ${date.day}.`
}

function AppendCircle(index: number, percent: number, label: string/*, spanClass: 'center' | 'right'*/) {
    $("#line")
        .append(
        `<div class="circle" id="circle${index}" style="top: ${percent * 100}%;">` +
            `<div class="popupSpan">` +
            label +
            `</div>` +
        `</div>`)
}

function HandleDateClick(e: MouseEvent, callback: (index: number) => void) {
    if (!e.target) { return }
    let spanNum = (e.target as HTMLElement).id
    if (!spanNum) { return }
    spanNum = spanNum.replace('circle', '')
    try {
        // console.log('clicked on date', spanNum)
        const i = parseInt(spanNum)
        // $(".active").removeClass("active")
        // $("#circle" + i).addClass("active")
        callback(i)
    } catch (error) {
        console.warn(error)
    }
}

function HandleRangeClick(e: MouseEvent, callback: (index: number) => void) {
    if (!e.target) { return }
    let spanNum = (e.target as HTMLElement).id
    if (!spanNum) { return }
    spanNum = spanNum.replace('range', '')
    try {
        // console.log('clicked on range', spanNum)
        const i = parseInt(spanNum)
        // $(".active").removeClass("active")
        // $("#range" + i).addClass("active")
        callback(i)
    } catch (error) {
        console.warn(error)
    }
}

function CalculatePosition(first: Time.BigDate | Time.BigDateString, last: Time.BigDate | Time.BigDateString, current: Time.BigDate | Time.BigDateString) {
    if (typeof first === 'string')
    { first = Time.Parse(first) }
    if (typeof last === 'string')
    { last = Time.Parse(last) }
    if (typeof current === 'string')
    { current = Time.Parse(current) }
    
    const firstTotal = Time.ToDays(first)
    const lastTotal = Time.ToDays(last)
    const currentTotal = Time.ToDays(current)

    const lastTotalRel = lastTotal - firstTotal
    const currentTotalRel = currentTotal - firstTotal

    return currentTotalRel / lastTotalRel
}

export function Show(data: Data, onDateClick: (index: number) => void, onRangeClick: (index: number) => void) {
    for (let i = 0; i < data.mans.length; i++) {
        data.mans[i].indent = 0
    }

    const previewElements: HTMLElement[] = []

    data.mans.sort((a, b) => {
        const intervalA: Time.Interval<Time.BigDate> = [ Time.Parse(a.bornAt), Time.Parse(a.diedAt) ]
        const intervalB: Time.Interval<Time.BigDate> = [ Time.Parse(b.bornAt), Time.Parse(b.diedAt) ]
        const lifetimeA = Time.ToDays(intervalA[1]) - Time.ToDays(intervalA[0])
        const lifetimeB = Time.ToDays(intervalB[1]) - Time.ToDays(intervalB[0])
        return lifetimeA - lifetimeB
    })
    
    data.eras.sort((a, b) => {
        const intervalA: Time.Interval<Time.BigDate> = [ Time.Parse(a.start), Time.Parse(a.end) ]
        const intervalB: Time.Interval<Time.BigDate> = [ Time.Parse(b.start), Time.Parse(b.end) ]
        const lifetimeA = Time.ToDays(intervalA[1]) - Time.ToDays(intervalA[0])
        const lifetimeB = Time.ToDays(intervalB[1]) - Time.ToDays(intervalB[0])
        return lifetimeB - lifetimeA
    })
    
    if (data.poems.length < 2 && data.mans.length === 0) {
        $("#line").hide()
        return
    }

    const first = Time.Parse(data.start)
    const last = Time.Parse(data.end)

    const lineRect = Utils.GetRect(Utils.GetElement('lineCont'))

    const dayToPx = (lineRect.height / (Time.ToDays(last) - Time.ToDays(first)))
    const pxToDay = 1 / dayToPx

    function IndentInterval(man: Man) {
        let count = man.indent ?? 0
        for (let i = 0; i < data.mans.length; i++) {
            const other = data.mans[i]
            if (man.name === other.name) { continue }
            if (count !== other.indent) { continue }
            if (Time.IsIntervalOverlapped([ man.bornAt, man.diedAt ], [ other.bornAt, other.diedAt ], 120 * pxToDay)) {
                count++
                i = 0
            }
        }
        return count
    }

    for (let i = 0; i < data.eras.length; i++) {
        const era = data.eras[i]
        const startPos = CalculatePosition(first, last, era.start)
        const endPos = CalculatePosition(first, last, era.end)

        const topPx = Math.max(0, startPos * lineRect.height + lineRect.top) + OFFSET_Y
        const heightPx = (endPos - startPos) * lineRect.height

        $("body").append(
            `<div class="era" id="era${i}" style="position: absolute; top: ${topPx}px; height: ${heightPx}px; background-color: ${era.color}; box-shadow: ${era.color} 0px 0px 32px 32px">` +
                `<span style="position: sticky; top: 70px">` +
                    era.name +
                `</span>` +
            `</div>`)
    }

    for (let i = 0; i < data.poems.length; i++) {
        const poem = data.poems[i]
        const position = CalculatePosition(first, last, data.poems[i].madeAt)
        $("#line")
            .append(
            `<div class="circle" id="circle${i}" style="top: ${position * 100}%;">` +
                `<div class="popupSpan">` +
                `${poem.author} - ${poem.title}` +
                `</div>` +
            `</div>`)
    }

    for (let i = 0; i < data.mans.length; i++) {
        const startPos = CalculatePosition(first, last, data.mans[i].bornAt)
        const endPos = CalculatePosition(first, last, data.mans[i].diedAt)

        data.mans[i].indent = IndentInterval(data.mans[i])
        data.mans[i].elementId = `range${i}`

        const man = data.mans[i]

        let html = ''

        html += `<div tabindex="0" class="range ${(man.important ? 'important-man' : '')}" id="${man.elementId}" style="top: ${startPos * 100}%; left: ${man.indent as number * 20}px; min-height: ${(endPos - startPos) * 100}%;">`
        html += `<div class="popupSpan">`
        html += `<h1>`
        html += man.name
        html += `</h1>`

        html += '<div class="details">'
        html += `<p>Született: <b>${Time.ToString(man.bornAt)}</b></p>`
        html += `<p>Elhunyt: <b>${Time.ToString(man.diedAt)}</b></p>`
        if (man.imageUrl) {
            html += `<img src="${man.imageUrl}" width="150" title="${man.name} portréja" alt="${man.name} portréja">`
        }        
        html += `</div>`

        html += `</div>`
        html += `</div>`

        $("#line").append(html)
        
        const eInterval = Utils.GetElement(man.elementId)

        let expandedWidth = eInterval.querySelector('.popupSpan')?.getBoundingClientRect().width ?? 0
        expandedWidth = Math.max(expandedWidth, 250)
        if (man.imageUrl)
        { expandedWidth = Math.max(expandedWidth, 150 + 20) }
        eInterval.style.setProperty('--bruh', `${expandedWidth}px`)

        eInterval.querySelector('.popupSpan')?.classList.add('rotated')

        if (man.important) {
            const elemRect = Utils.GetRect(eInterval)
    
            let ePreview: HTMLElement | null = document.createElement('div')
            ePreview.innerText = man.name
            ePreview.classList.add('preview')
            ePreview.style.position = 'absolute'
            ePreview.style.top = `${elemRect.top + OFFSET_Y}px`
            ePreview.style.left = `${30}px`
    
            for (const other of previewElements) {
                const otherRect = Utils.GetRect(other)
                const d = Math.abs((elemRect.y - otherRect.y))
                if (Utils.IsRectOverlaps(elemRect, otherRect) || d < 50) {
                    ePreview.remove()
                    ePreview = null
                    break
                }
            }
    
            if (ePreview) {
                previewElements.push(ePreview)
                document.body.appendChild(ePreview)
            }
        }
    }

    const allCircles = document.getElementsByClassName('circle') as HTMLCollectionOf<HTMLElement>
    for (let i = 0; i < allCircles.length; i++) {
        const circle = allCircles.item(i)
        circle?.addEventListener('click', e => HandleDateClick(e, onDateClick))
    }
    
    const allRanges = document.getElementsByClassName('range') as HTMLCollectionOf<HTMLElement>
    for (let i = 0; i < allRanges.length; i++) {
        const range = allRanges.item(i)
        range?.addEventListener('click', e => HandleRangeClick(e, onRangeClick))
    }
}
