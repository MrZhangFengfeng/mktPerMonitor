import tracker from './tracker'
import { config } from './config'
import { mktPerData } from './types'

export const log = (message?: any) =>{
    if(!config.log) return

    console.log(
        `%cPer`,
        'background: #409EFF; color: white; padding: 1px 10px; border-radius: 3px;',
        message
      )
}

export const logIndicator = (type:string, data:mktPerData, measure = false) =>{
    !measure && tracker(type, data)
    if(!config.log) return

    console.log(
        `%cPer%c${type}`,
        'background: #409EFF; color: white; padding: 1px 10px; border-top-left-radius: 3px; border-bottom-left-radius: 3px;',
        'background: #67C23A; color: white; padding: 1px 10px; border-top-right-radius: 3px;border-bottom-right-radius: 3px;',
        data
    )
}