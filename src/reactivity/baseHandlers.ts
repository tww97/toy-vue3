import { extend, isObject } from "../shared"
import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive"


const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)



function createGetter(isReadonly = false, isShallowReadonly = false){
    return function get(target, key){
        if(key === ReactiveFlags.IS_REACTIVE){
            return !isReadonly
        }else if(key === ReactiveFlags.IS_READONLY){
            return isReadonly
        }

        const res = Reflect.get(target, key)
        if(isShallowReadonly){
            return res
        }

        //看看res是否是object
        //嵌套对象转换成响应式
        if(isObject(res)){
            return isReadonly ? readonly(res) : reactive(res)
        }

        if(!isReadonly){
            track(target, key)
        }
        return res        
    }
}

function createSetter(){
    return function set(target, key, value){
        const res = Reflect.set(target, key, value)

        trigger(target, key)
        return res        
    }
}


export const baseHandlers = {
    get,
    set
}

export const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value){
        console.warn(`key:${key} set 失败，因为target是readonly`, target)
        return true
    }
}

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
})