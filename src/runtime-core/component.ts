import { proxyRefs } from "../reactivity"
import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

export function createComponentInstance(vnode, parent){
    const component = {
        vnode,
        type: vnode.type,
        next: null,
        setupState: {}, 
        props: {},
        emit: () => {},
        slots: {},
        //取父组件中的provides
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {}
    }

    component.emit = emit.bind(null, component) as any

    return component
}

export function setupComponent(instance){
    
    initProps(instance, instance.vnode.props)

    initSlots(instance, instance.vnode.children)

    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance){
    const Component = instance.type

    const { setup } = Component

    //对setupResult的结果进行代理
    //同时提供一些属性供使用者访问：如this.$el
    instance.proxy = new Proxy({
        _: instance
    }, PublicInstanceProxyHandlers)

    if(setup){
        setCurrentInstance(instance)
        //setup的返回值为function或object
        const setupResult = setup(shallowReadonly(instance.props), {emit: instance.emit})

        setCurrentInstance(null)

        handleSetupResult(instance, setupResult)
    }
}

function handleSetupResult(instance, setupResult){
    if(typeof setupResult === 'object'){
        //将setup函数的执行结果setupResult挂载到instance实例中
        //使用proxyRefs包裹setupResult，便于直接拿到ref实例的值，不用再去访问ref实例的value使用
        instance.setupState = proxyRefs(setupResult)
    }


    finishComponentSetup(instance)
}

function finishComponentSetup(instance){
    const Component = instance.type

    if(Component.render){
        instance.render = Component.render
    }
}

let currentInstance = null

export function getCurrentInstance(){
    return currentInstance
}

export function setCurrentInstance(instance){
    currentInstance = instance
}