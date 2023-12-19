import * as Utilities from './utilities'
import * as Timeline from './timeline'
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

    const manSearch = Utilities.GetElement('man-search') as HTMLInputElement
    manSearch.addEventListener('input', () => {
        console.log(manSearch.value)
    })
}

document.addEventListener('DOMContentLoaded', () => { Main() })
