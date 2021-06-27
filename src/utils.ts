import { mktPerCallback } from './types'

export const isSupportPerformance = () =>{
    const performance = window.performance

    return performance &&
            !!performance.getEntriesByType &&
            !!performance.now &&
            !!performance.mark
}

export const isDev = () =>{
    return process.env.NODE_ENV === 'develpoment'
}

export const getObserver = (type: string, cb: mktPerCallback) =>{
    const perObserver = new PerformanceObserver(entryList =>{
        cb(entryList.getEntries())
    })
    perObserver.observe({entryTypes: [type], buffered: true})
}

export let hiddenTime = document.visibilityState === 'hidden' ? 0 : Infinity

//Record: 定义一个对象的 key 和 value 类型
export const scores: Record<string, number[]> = {
    fcp: [2000, 4000],
    lcp: [2500, 4000],
    fid: [100, 300],
    tbt: [300, 600],
    cls: [0.1, 0.25]
}

export const scoreLevel = ['good', 'needsImprovement', 'poor']

export const getScore = (type: string, data: number) => {
    const score = scores[type]
    for (let i = 0; i < score.length; i++) {
      if (data <= score[i]) return scoreLevel[i]
    }
  
    return scoreLevel[2]
}