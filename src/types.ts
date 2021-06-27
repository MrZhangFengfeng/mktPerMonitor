
export type mktPerCallback = (entries: any[]) => void

export interface mktPerCbProps {
    tracker?: (type: mktPerDataType, data: any, allData: any) => void,
    log?: boolean
}

export type mktPerData = Object | number

export type mktPerDataType = 'navigationTime'
    | 'networkInfo'
    | 'fcp'
    | 'fp'
    | 'lcp'
    | 'cls'
    | 'fid'
    | 'tbt'
    | 'tti'
    | 'fmp'


export interface mktPerProps {
    // performance mark
    markStart: (name: string) => void 
    // performance mark and log measures
    markEnd: (startName: string, endName: string) => void
    // performance clearMarks
    clearMarks: (name?: string) => void
    // performance clearMeasures
    clearMeasures: (name?: string) => void
    // fmp start
    fmpStart: () => void
    // fmp end and log fmp measure
    fmpEnd: () =>void
}