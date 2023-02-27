export const extend = Object.assign

export function isObject(value){
    return value !== null && typeof value === 'object'
}

export function hasChanged(oldVal, newVal){
    return !Object.is(oldVal, newVal)
}

export function hasOwn(val, key){
    return Object.prototype.hasOwnProperty.call(val, key)
}

//首字母大写
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

//on+事件名
export const toHandlerKey = (str) => {
    return str ? 'on' + capitalize(str) : ''
}

//
export const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : ''
    })
}

export const EMPTY_OBJ = {}

export const isString = (val) => typeof val === "string";