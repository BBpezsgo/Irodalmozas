import { BigDateString } from "./big-date"

export type Data = {
    start: BigDateString
    end: BigDateString
    eras: Era[]
    mans: Man[]
    poems: Poem[]
}

export type Era = {
    name: string
    start: BigDateString
    end: BigDateString
    color: string
}

export type Man = {
    name: string
    bornAt: BigDateString
    diedAt: BigDateString
    important?: true
    imageUrl?: string
    desc?: string
    
    indent?: number
    elementId?: string
}

export type Poem = {
    author: string
    title: string
    madeAt: BigDateString
    
    elementId?: string
}

