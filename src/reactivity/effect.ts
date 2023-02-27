import {extend} from '../shared'
let activeEffect
let shouldTrack


export class ReactiveEffect {
    private _fn: any
    active = true
    deps = []
    onStop?: () => void
    constructor(fn, public scheduler?){
        this._fn = fn
    }

    run(){
        if(!this.active){
            return this._fn()
        }
        shouldTrack = true
        activeEffect = this
        const result = this._fn()
        shouldTrack = false
        return result
    }

    stop(){
        if(this.active){
            cleanupEffect(this)
            if(this.onStop){
                this.onStop()
            }
            this.active = false
        }
        
    }
}

//依赖清除
function cleanupEffect(effect){
    effect.deps.forEach((dep) => {
        dep.delete(effect)
    })

    effect.deps.length = 0
}


//依赖收集
const targetMaps = new Map()
export function track(target, key){
    //判断是否满足收集条件
    if(!isTracking()) return

    let depsMap = targetMaps.get(target)
    if(!depsMap){
        depsMap = new Map()
        targetMaps.set(target, depsMap)
    }

    let dep = depsMap.get(key)
    if(!dep){
        dep = new Set()
        depsMap.set(key, dep)
    }

    trackEffects(dep)
}

export function trackEffects(dep){
    //判断依赖是否已经被收集
    if(dep.has(activeEffect)) return

    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}

export function isTracking(){
    return shouldTrack && activeEffect !== undefined
}


//触发依赖
export function trigger(target, key){
    const depsMap = targetMaps.get(target)
    const dep = depsMap.get(key)

    triggerEffects(dep)
}

export function triggerEffects(dep){
    for(const effect of dep){
        if(effect.scheduler){
            effect.scheduler()
        }else{
            effect.run()
        }
        
    }
}



export function effect(fn, options:any = {}){
    const _effect = new ReactiveEffect(fn, options.scheduler)
    extend(_effect, options)
    _effect.run()

    const runner:any = _effect.run.bind(_effect)
    runner.effect = _effect

    return runner
}

export function stop(runner){
    runner.effect.stop()
}