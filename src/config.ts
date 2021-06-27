import { mktPerCbProps } from './types'
import { isDev } from './utils'

export const config: mktPerCbProps = {
    tracker: () =>{},
    log: isDev()
}