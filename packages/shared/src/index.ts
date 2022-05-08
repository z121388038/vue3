import { makeMap } from './makeMap'

export { makeMap }
export * from './patchFlags'
export * from './shapeFlags'
export * from './slotFlags'
export * from './globalsWhitelist'
export * from './codeframe'
export * from './normalizeProp'
export * from './domTagConfig'
export * from './domAttrConfig'
export * from './escapeHtml'
export * from './looseEqual'
export * from './toDisplayString'
export * from './typeUtils'

// 空对象，dev环境的话是冻结的空对象
export const EMPTY_OBJ: { readonly [key: string]: any } = __DEV__
  ? Object.freeze({})
  : {}

// 空数组，dev环境的话是冻结的空数组
export const EMPTY_ARR = __DEV__ ? Object.freeze([]) : []

// 空函数
export const NOOP = () => {}

/**
 * Always return false.
 */
// 永远返回false
export const NO = () => false

// 判断是否以on开头，并且on后面首字母不可以是a-z的小写字母，可以是例如：on123、onClick
const onRE = /^on[^a-z]/
export const isOn = (key: string) => onRE.test(key)

// 判断是否以：`onUpdate: ` 开头
// startsWith：是否以固定数据开头，返回true、false,对应的还有endsWith
export const isModelListener = (key: string) => key.startsWith('onUpdate:')

// 合并，Object.assign合并的时候，会影响第一个参数的数据
export const extend = Object.assign

// 删除数组的某一项
export const remove = <T>(arr: T[], el: T) => {
  const i = arr.indexOf(el)
  if (i > -1) {
    arr.splice(i, 1)
  }
}

// 判断是不是自己本身所拥有的属性，会忽略掉那些从原型链上继承到的属性
// 为什么用Object.prototype.hasOwnProperty.call?
// 答：JavaScript 并没有保护 hasOwnProperty 这个属性名，因此，当某个对象可能自有一个占用该属性名的属性时，就需要使用外部的 hasOwnProperty 获得正确的结果。例：
// ({}).hasOwnProperty.call(foo, 'bar');  // 但是这种方式会新建一个对象
// Object.prototype.hasOwnProperty.call(foo, 'bar');  // 这种最优，不会新建对象
// 具体文档说明：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key)

// 判断是否是数组
export const isArray = Array.isArray

// 判断是否Map对象
export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === '[object Map]'

// 判断是否Set集合
export const isSet = (val: unknown): val is Set<any> =>
  toTypeString(val) === '[object Set]'

// 判断是否Date对象
export const isDate = (val: unknown): val is Date => val instanceof Date

// 判断是否是函数
export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'

// 判断是否是字符串
export const isString = (val: unknown): val is string => typeof val === 'string'

// 判断是否为Symbol
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'

// 判断是否为对象
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'

// 判断是否Promise
export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}

// 具体细节文档说明：https://www.jb51.net/article/152365.htm
// 对象转字符串，例
// Object.prototype.toString.call('sdf')      //  '[object String]'
// Object.prototype.toString.call(123)        //  '[object Number]'
// Object.prototype.toString.call(null)       //  '[object Null]'
// Object.prototype.toString.call(undefined)  //  '[object Undefined]'
// Object.prototype.toString.call(()=>{})     //  '[object Function]'
// Object.prototype.toString.call({})         //  '[object Object]'
export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string =>
  objectToString.call(value)

// 获取原始类型的字符串
export const toRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}

// 是否是原始类型的Object对象
export const isPlainObject = (val: unknown): val is object =>
  toTypeString(val) === '[object Object]'

// 是否是整数类型的字符串键
export const isIntegerKey = (key: unknown) =>
  isString(key) &&
  key !== 'NaN' &&
  key[0] !== '-' &&
  '' + parseInt(key, 10) === key

// 是否是保留关键字符，类似于ECMA的保留关键字符的作用
export const isReservedProp = /*#__PURE__*/ makeMap(
  // the leading comma is intentional so empty string "" is also included
  ',key,ref,ref_for,ref_key,' +
    'onVnodeBeforeMount,onVnodeMounted,' +
    'onVnodeBeforeUpdate,onVnodeUpdated,' +
    'onVnodeBeforeUnmount,onVnodeUnmounted'
)

// 是否是内置指令
export const isBuiltInDirective = /*#__PURE__*/ makeMap(
  'bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo'
)

// 缓存字符串的函数
const cacheStringFunction = <T extends (str: string) => string>(fn: T): T => {
  const cache: Record<string, string> = Object.create(null)
  return ((str: string) => {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }) as any
}

// "-"连字符转小驼峰
const camelizeRE = /-(\w)/g
/**
 * @private
 */
export const camelize = cacheStringFunction((str: string): string => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
})


// 大写字母转"-"连字符
const hyphenateRE = /\B([A-Z])/g
/**
 * @private
 */
export const hyphenate = cacheStringFunction((str: string) =>
  str.replace(hyphenateRE, '-$1').toLowerCase()
)

/**
 * @private
 */
// 首字母转大写
export const capitalize = cacheStringFunction(
  (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
)

/**
 * @private
 */
export const toHandlerKey = cacheStringFunction((str: string) =>
  str ? `on${capitalize(str)}` : ``
)

// 判断值是否有变化
// compare whether a value has changed, accounting for NaN.
export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue)

// 遍历执行数组里的函数
export const invokeArrayFns = (fns: Function[], arg?: any) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg)
  }
}

// 定义一个不可枚举的对象
export const def = (obj: object, key: string | symbol, value: any) => {
  Object.defineProperty(obj, key, {
    configurable: true,   // 是否可被删除
    enumerable: false,    // 不可被遍历枚举
    value
  })
}

// 转数字
export const toNumber = (val: any): any => {
  const n = parseFloat(val)
  return isNaN(n) ? val : n
}

// 获取全局对象
// globalThis 在 nodejs 环境就是 global
// globalThis 在 浏览器 环境就是 window
// 还可能在别的环境（比如某个app内，小程序内等）
// globalThis的详细说明:https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/globalThis
let _globalThis: any
export const getGlobalThis = (): any => {
  return (
    _globalThis ||
    (_globalThis =
      typeof globalThis !== 'undefined'
        ? globalThis
        : typeof self !== 'undefined'
        ? self
        : typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
        ? global
        : {})
  )
}
