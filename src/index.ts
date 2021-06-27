import { isSupportPerformance  } from './utils'
import { log, logIndicator  } from './log'
import {
    getNavigationTime,
    getNetworkInfo,
    getPaintTime,
    getFID,
    getLCP,
    getCLS,
    getTTI,
  } from './indicator'
import { hiddenTime } from './utils'
import { mktPerCbProps, mktPerProps } from './types'
import { config } from './config'

export default class mktPerMonitor implements mktPerProps {
    constructor(args: mktPerCbProps) {
        config.tracker = args.tracker
        if(typeof args.log === 'boolean') {
            config.log = args.log
        }
        if(!isSupportPerformance()) {
            log(`Your browser doesn't support Performance API`)
            return
        }
        logIndicator('Navigation Time', getNavigationTime())
        logIndicator('Network Info', getNetworkInfo())
        getPaintTime()
        getFID()
        getLCP()
        getCLS()
        getTTI()

        // indicator not be measured when the page is loaded in a background tab
        document.addEventListener('visibilitychange', event =>{
            hiddenTime = Math.min(hiddenTime, event.timeStamp)
        }, {once: true})
    }

    /**
     * @description 
     * @param name string
     */
    markStart(name: string) {
        // .mark(): 从navigetionStart事件发生时刻到记录时刻间隔的毫秒数----MDN
        window.performance.mark(name)
    }

    /**
     * @description 结束一次测量
     * @param startName 
     * @param endName 
     */
    markEnd(startName: string, endName: string) {
        window.performance.mark(endName)
        const measureName = `mktPerMonitor-${startName}`
        // .measure() 在浏览器性能记录缓存中创建了一个名为时间戳的记录来记录两个特殊标志位
        // （通常称为开始标志和结束标志）。 被命名的时间戳称为一次测量（measure）-----MDN。
        // 返回值为空
        window.performance.measure(measureName, startName, endName)
        const measures = window.performance.getEntriesByName(measureName)
        measures.forEach((measure) => logIndicator(measureName, measure, true))
    }

    /**
     * @description 从缓存中移除声明的标记
     * @param name 
     */
    clearMarks(name?: string) {
        // clearMarks() 这个方法可以从浏览器的performance entry 缓存中移除声明的标记。
        // 如果调用这个方法时没有传递参数， 则所有带有entry type这类标记的performance entries
        //  将从 performance entry 缓存区中被移除。 -------MDN
        window.performance.clearMarks(name)
    }

    /**
     * @description 移除声明的度量衡
     * @param name 
     */
    clearMeasures(name?: string) {
        // clearMeasures() 方法可以从浏览器的性能入口缓存区中移除声明的度量衡。
        // 如果这个方法被调用时没有传入参数，则所有 entry type 标记值为"measure" 
        // 的性能实体将被从性能入口缓存区中移除。-------MDN
        performance.clearMeasures(`PerMoniteur-${name}`)
    }

    /**
     * @description first meaningful paint start
     */
    fmpStart() {
        this.markStart('fmp-start')
    }

    /**
     * @description first meaningful paint end
     */
    fmpEnd() {
        performance.mark('fmp-end')
        performance.measure('fmp', 'fmp-start', 'fmp-end')
        const measures = performance.getEntriesByName('fmp')
        measures.forEach((measure) =>
          logIndicator('fmp', {
            time: measure.duration,
          })
        )
    }
}