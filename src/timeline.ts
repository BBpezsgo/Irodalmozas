import * as Time from './big-date'
import * as Utils from './utilities'
import { Data, Man } from './data'

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

    // console.log(currentTotalRel, lastTotalRel)

    return currentTotalRel / lastTotalRel

    // const firstMonth = first.month
    // const firstDay = first.day
    // 
    // const lastMonth = last.month
    // const lastDay = last.day
    // 
    // const lastInt = ((lastMonth - firstMonth) * 30) + (lastDay - firstDay)
    // 
    // const thisMonth = current.month
    // const thisDay = current.day
    // 
    // const thisInt = ((thisMonth - firstMonth) * 30) + (thisDay - firstDay)
    // 
    // return thisInt / lastInt
}

export function Show(data: Data, onDateClick: (index: number) => void, onRangeClick: (index: number) => void) {
    // console.log('Timeline points:', dates)
    // console.log('Timeline intervals:', ranges)

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
    
    function AnyIntervalOverlapped(man: Man) {
        let count = 0
        for (const other of data.mans) {
            if (man.name === other.name) { continue }
            if (man.indent !== other.indent) { continue }
            if (Time.IsIntervalOverlapped([ man.bornAt, man.diedAt ], [ other.bornAt, other.diedAt ])) {
                count++
            }
        }
        return count
    }

    if (data.poems.length < 2 && data.mans.length === 0) {
        $("#line").hide()
        return
    }

    const first = Time.Parse(data.start)
    const last = Time.Parse(data.end)

    const lineRect = Utils.GetRect(Utils.GetElement('lineCont'))

    for (let i = 0; i < data.eras.length; i++) {
        const era = data.eras[i]
        const startPos = CalculatePosition(first, last, era.start)
        const endPos = CalculatePosition(first, last, era.end)

        const topPx = Math.max(0, startPos * lineRect.height + lineRect.top)
        const heightPx = (endPos - startPos) * lineRect.height

        $("body").append(
            `<div class="era" id="era${i}" style="position: absolute; top: ${topPx}px; height: ${heightPx}px; background-color: ${era.color}; box-shadow: ${era.color} 0px 0px 32px 32px">` +
                `<span>` +
                    era.name +
                `</span>` +
            `</div>`)
    }

    for (let i = 0; i < data.poems.length; i++) {
        AppendCircle(i, CalculatePosition(first, last, data.poems[i].madeAt), `${data.poems[i].author} - ${data.poems[i].title}`)
    }

    for (let i = 0; i < data.mans.length; i++) {
        const startPos = CalculatePosition(first, last, data.mans[i].bornAt)
        const endPos = CalculatePosition(first, last, data.mans[i].diedAt)

        data.mans[i].indent = AnyIntervalOverlapped(data.mans[i])
        $("#line").append(
            `<div class="range" id="range${i}" style="top: ${startPos * 100}%; left: ${data.mans[i].indent as number * 10}px; height: ${(endPos - startPos) * 100}%;">` +
                `<div class="popupSpan">` +
                data.mans[i].name +
                `</div>` +
            `</div>`)
        
        const eInterval = Utils.GetElement(`range${i}`)

        const elemRect = Utils.GetRect(eInterval)

        let ePreview: HTMLElement | null = document.createElement('div')
        ePreview.innerText = data.mans[i].name
        ePreview.classList.add('preview')
        ePreview.style.position = 'absolute'
        ePreview.style.top = `${elemRect.top}px`
        ePreview.style.left = `${30}px`

        for (const other of previewElements) {
            const otherRect = Utils.GetRect(other)
            const d = Math.abs((elemRect.y - otherRect.y))
            if (Utils.IsRectOverlaps(elemRect, otherRect) || d < 100) {
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
