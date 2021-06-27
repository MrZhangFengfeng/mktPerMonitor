// indicator: 指标
import { getObserver, hiddenTime, getScore } from './utils'
import { logIndicator } from './log'
import ttiPolyfill  from 'tti-polyfill'
let tbt = 0  // Total Blocking Time

/**
 * @description 获取页面加载相关信息
 */
export const getNavigationTime = () => {
    const navigation = window.performance.getEntriesByType('navigation')
    if(navigation.length >0) {
        const timing = navigation[0] as PerformanceNavigationTiming
        if(timing) {
            const {
                domainLookupEnd,
                domainLookupStart,
                transferSize,
                encodedBodySize,
                connectEnd,
                connectStart,
                workerStart,
                redirectEnd,
                redirectStart,
                redirectCount,
                responseEnd,
                responseStart,
                fetchStart,
                domContentLoadedEventEnd,
                domContentLoadedEventStart,
                requestStart,
            } = timing

            return {
                // redirect count and time
                redirect: {
                  count: redirectCount,
                  time: redirectEnd - redirectStart,
                },
                appCache: domainLookupStart - fetchStart,
                // dns lookup time
                dnsTime: domainLookupEnd - domainLookupStart,
                // handshake end - handshake start time
                TCP: connectEnd - connectStart,
                // HTTP head size
                headSize: transferSize - encodedBodySize || 0,
                responseTime: responseEnd - responseStart,
                // Time to First Byte
                TTFB: responseStart - requestStart,
                // fetch resource time
                fetchTime: responseEnd - fetchStart,
                // Service work response time
                workerTime: workerStart > 0 ? responseEnd - workerStart : 0,
                domReady: domContentLoadedEventEnd - fetchStart,
                // DOMContentLoaded time
                DCL: domContentLoadedEventEnd - domContentLoadedEventStart
              }
        }
    }
    return {}
}

/**
 * @description 获取网络信息
 */
export const getNetworkInfo = () => {
    if('connection' in window.navigator) {
        const connection = window.navigator['connection']
        const { effectiveType, downlink, rtt, saveData } = connection
        return {
            // 网络类型，4g 3g
            effectiveType,
            // 网络下行速度
            downlink,
            // 发送数据到接受数据的往返时间
            rtt,
            // 打开/请求数据保护模式  true false
            saveData
        }
    }
    return {}
}

/**
 * @description 页面渲染完成时间
 */
export const getPaintTime = () =>{
    getObserver('paint', entries => {
        entries.forEach(entry =>{
            const time = entry.startTime
            const name = entry.name
            if(name === 'first-contentful-paint') {
                // duration: 0
                // entryType: "paint"
                // name: "first-contentful-paint"
                // startTime: 895
                getLongTask(time)
                // FCP: 首次内容绘制。首次绘制文本、图片、非空白canvas的时间
                logIndicator('FCP', {
                    time,
                    score: getScore('fcp', time)
                })
            } else {
                logIndicator('FP', { time })
            }
        })
    })
}

/**
 * @description 获取首次输入延迟，记录在FCP和TTI之间用户与页面交互时响应的延迟
 */
export const getFID = ()=>{
    getObserver('first-input', entries =>{
        entries.forEach(entry =>{
            // 判断页面是否在前台
            if(entry.startTime < hiddenTime) {
                const time = entry.processingStart - entry.startTime
                logIndicator('FID', {
                    time,
                    score: getScore('fid', time),
                })
                // TBT：阻塞总时间。 记录在FCP和TTI之间长任务的阻塞时间
                logIndicator('TBT', {
                    time: tbt,
                    score: getScore('tbt', tbt),
                })
            }
        })
    })
}

/**
 * @description 获取最大内容绘制，用于监控网页可视区内“绘制面积”最大的元素开始呈现在屏幕上的时间点
 * @tips
 * LCP也不是完美的，也很容易出错，它具有如下问题：
 * 1、该算法在检查到用户与页面产生交互时停止，也就是说，如果在“主要内容”显示之前发生了“用户输入”，算法将不会捕获到主要内容。
 * 如果用户很早就开始与网页产生交互，该算法将会捕获错误的结果或者没有结果。
 * 2、由于元素一旦删除就不能被视为是面积最大，所以在具有大图片轮播的页面中会出现问题。如果在绘制下一张图时，当前图片被删除，
 * 并且下一张图被认为是面积最大，那么算法将基于轮播图不断更新LCP。
*/
export const getLCP = () =>{
    getObserver('largest-contentful-paint', entries =>{
        entries.forEach(entry =>{
            if(entry.startTime < hiddenTime) {
                const { loadTime, renderTime, size } = entry
                logIndicator('LCP Update', {
                    time: renderTime | loadTime,
                    size,
                    score: getScore('lcp', renderTime | loadTime)
                })
            }
        })
        const lastEntry = entries[entries.length - 1];
        const lcp = lastEntry.renderTime || lastEntry.loadTime;
        logIndicator('LCP End', {
            time: lcp,
            size: lastEntry.size,
            score: getScore('lcp', lcp)
        })
    })
}

/**
 * @description 获取累计位移偏量，记录页面上非预期的位移波动
*/
export const getCLS = () =>{
    getObserver('layout-shift', (entries) => {
        let value = 0
        entries.forEach(entry =>{
            if (!entry.hadRecentInput) {
                value += entry.value
            }
        })

        logIndicator('CLS Update', {
            value,
            score: getScore('cls', value),
        })
    })
}

/**
 * @description 获取累计位移偏量，记录页面上非预期的位移波动
*/
export const getLongTask = (fcp:number) => {
    window.__tti = { e: [] }
    getObserver('longtask', entries =>{
        window.__tti.e = window.__tti.e.concat(entries)
        entries.forEach(entry =>{
            // self: 由当前窗口中的eventloop产生的长任务.
            // startTime: 是一个存储毫秒级别的时间戳.
            if (entry.name !== 'self' || entry.startTime < fcp) {
                return
            }
            // 超过50毫秒就算阻塞
            // duration: 以一毫秒为粒度，存储开始于结束时间的差值.
            const blockingTime = entry.duration - 50
            if (blockingTime > 0) tbt += blockingTime
        })
    })
}

/**
 * @description 获取首次可交互时间 Time to Interactive
*/
export const getTTI = () =>{
    // 统计方式：谷歌实验室写的npm包，tti-polyfill
    ttiPolyfill.getFirstConsistentlyInteractive().then((tti) => {
        logIndicator('TTI', {
          value: tti
        })
    })
}