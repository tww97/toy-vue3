import { isObject } from "../shared"
import { baseHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers"

export const ReactiveFlags = {
    IS_REACTIVE: '__is_reactive',
    IS_READONLY: '__is_readonly'
}

export function reactive(raw){
    return createActiveObject(raw, baseHandlers)
}

export function readonly(raw){
    return createActiveObject(raw, readonlyHandlers)
}

export function shallowReadonly(raw){
    return createActiveObject(raw, shallowReadonlyHandlers)
}

export function isReactive(raw){
    return !!raw[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(raw){
    return !!raw[ReactiveFlags.IS_READONLY]
}

export function isProxy(raw){
    return isReactive(raw) || isReadonly(raw)
}

function createActiveObject(raw, baseHandlers){
    if(!isObject(raw)){
        console.warn(`target ${raw} 必须是一个对象`)
        return raw
    }
    return new Proxy(raw, baseHandlers)
}

