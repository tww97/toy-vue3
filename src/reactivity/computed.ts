import { ReactiveEffect } from "./effect";

//computed
//1. 首次执行computed时getter不执行
//2. 当依赖的响应式对象的值不变时重复获取value值不会重新执行getter方法，只会返回之前的值
//3. 当依赖的响应式对象的值发生改变时获取value的值会重新执行getter方法

export class ComputedRfImp{
    private _getter;
    private _effect;
    private _dirty: boolean = true
    private _value
    constructor(getter){
        this._getter = getter
        this._effect = new ReactiveEffect(getter, () => {
            if(!this._dirty){
                this._dirty = true
            }
            
        })
    }

    get value(){
        if(this._dirty){
            this._dirty = false
            this._value = this._effect.run()
        }

        return this._value
    }
} 

export function computed(getter){
    return new ComputedRfImp(getter)
}