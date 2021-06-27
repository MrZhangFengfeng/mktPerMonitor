import { config } from './config'
import { mktPerData, mktPerDataType } from './types'

// Partial作用：生成一个新类型，该类型与 Record<mktPerDataType, mktPerData> 拥有相同的属性，但是所有属性皆为可选项
const allData: Partial<Record<mktPerDataType, mktPerData>> = {}

const typeMap: Record<string, mktPerDataType> = {
  'Navigation Time': 'navigationTime',
  'Network Info': 'networkInfo',
  'FCP': 'fcp',
  'FP': 'fp',
  'LCP Update': 'lcp',
  'CLS Update': 'cls',
  'TBT': 'tbt',
  'FID': 'fid',
  'TTI': 'tti',
}

export default (type: string, data: mktPerData) => {
  const currentType = typeMap[type]
  allData[currentType] = data
  config.tracker && config.tracker(currentType, data, allData)
}