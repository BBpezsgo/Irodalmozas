import * as Utilities from './utilities'
import * as Timeline from './timeline'
import * as Time from './big-date'
import { Data } from './data';

declare global {
    interface Window {
        
    }
}

function EscapeHtml(unsafe: string)
{
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function OnTimelineDateClick(_: number) {
    
}

function OnTimelineRangeClick(_: number) {
    
}

async function Main() {
    const data: Data = eval(await (await fetch('./data.js')).text())

    Timeline.Show(data, OnTimelineDateClick, OnTimelineRangeClick)

    const eManSearch = Utilities.GetElement('man-search') as HTMLInputElement
    eManSearch.addEventListener('input', _ => {
        Utilities.GetElement('search-error-label').textContent = ''
    })
    eManSearch.addEventListener('keypress', e => {
        if (e.key !== 'Enter') { return }
        let found = null
        for (const man of data.mans) {
            if (man.name.toLowerCase().trim().includes(eManSearch.value.toLowerCase().trim())) {
                if (found) {
                    Utilities.GetElement('search-error-label').textContent = 'Ebből több is van'
                    window.location.hash = ''
                    return
                } else {
                    found = man.elementId
                }
            }
        }
        if (found) {
            window.location.hash = `#${found}`
        } else {
            Utilities.GetElement('search-error-label').textContent = 'Nem találtam ilyet :('
            window.location.hash = ''
        }
    })

    const eRanges = document.getElementsByClassName('range') as HTMLCollectionOf<HTMLDivElement>
    for (let i = 0; i < eRanges.length; i++) {
        const eRange = eRanges.item(i)
        if (!eRange) { continue }
        eRange.addEventListener('focus', _ => {
            const eFocusedRanges = document.getElementsByClassName('focused-range') as HTMLCollectionOf<HTMLDivElement>
            for (let j = 0; j < eFocusedRanges.length; j++) {
                eFocusedRanges.item(j)?.classList.remove('focused-range')
            }
            eRange.classList.add('focused-range')
        })
        eRange.addEventListener('blur', _ => {
            eRange.classList.remove('focused-range')
        })
    }
    
    const lineRect = Utilities.GetRect(Utilities.GetElement('lineCont'))

    const dayToPx = (lineRect.height / (Time.ToDays(data.end) - Time.ToDays(data.start)))
    const pxToDay = 1 / dayToPx

    const eDateLabel = Utilities.GetElement('date-label')

    function UpdateDateLabel(pageX: number, pageY: number) {
        const date = Time.FromDays(((pageY - Timeline.OFFSET_Y) * pxToDay) + Time.ToDays(data.start))
        eDateLabel.style.left = `${Math.min(Math.max(pageX, 0), window.innerWidth - 70)}px`
        eDateLabel.style.top = `${Math.max(pageY, window.scrollY + 90)}px`
        eDateLabel.style.opacity = '100%'
        eDateLabel.textContent = date.year.toString()
    }

    document.addEventListener('mousemove', e => {
        UpdateDateLabel(e.pageX + 3, e.pageY - 3)
    })

    document.addEventListener('scroll', _ => {
        eDateLabel.style.opacity = '0%'
    })
}

document.addEventListener('DOMContentLoaded', () => { Main() })
