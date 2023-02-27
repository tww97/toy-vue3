import { hasChanged, isObject } from "../shared"
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive"



class RefImpl{
    private _value: any
    private _rawValue: any
    public dep
    public __is_ref = true
    constructor(value){
        this._rawValue = value
        this._value = covert(value)
        this.dep = new Set()
    }

    get value(){
        trackRefValue(this)
        return this._value
    }

    set value(newValue){
        if(hasChanged(this._rawValue, newValue)){
            this._rawValue = newValue
            this._value = covert(newValue)
            triggerEffects(this.dep)
        }

    }
}

function covert(value){
    //判断value是否是对象，若是，则使用reactive方法使其变成响应式对象
    return isObject(value) ? reactive(value) : value
}


function trackRefValue(ref){
    if(isTracking()){
        trackEffects(ref.dep)
    }   
}


export function ref(value){
    return new RefImpl(value)
}

export function isRef(ref){
    return !!ref.__is_ref
}

export function unRef(ref){
    return isRef(ref) ? ref.value : ref
}

export function proxyRefs(raw){
    return new Proxy(raw, {
        get(target, key){
            return unRef(Reflect.get(target, key))
        },

        set(target, key, value){
            if(isRef(target[key]) && !isRef(value)){
                //如果terget[key]是ref且value不是ref
                return target[key].value = value
            }else{
                return Reflect.set(target, key, value)
            }
        }
    })
} 