import { Text } from './../runtime-core/vnode';
import { createRenderer } from '../runtime-core'

function createElement(type){
    return document.createElement(type)
}

function patchProps(el, key, prevVal, nextVal){
    const isOn = (key) => /^on[A-Z]/.test(key)
    //处理props中的事件
    if(isOn(key)){
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, nextVal)
    }else{
        if(nextVal === undefined || nextVal === null){
            //新的属性值为undefined或者null，则删除该属性
            el.removeAttribute(key)
        }else{
            el.setAttribute(key, nextVal)
        }
        
    }    
}

function insert(child, parent, anchor){
    parent.insertBefore(child, anchor || null)
}

function remove(child){
    const parent = child.parentNode
    if(parent){
        parent.removeChild(child)
    }
}

function setElementText(el ,text){
    el.textContent = text
}

const renderer: any = createRenderer({
    createElement,
    patchProps,
    insert,
    remove,
    setElementText
})

export function createApp(...args){
    return renderer.createApp(...args)
}

export * from '../runtime-core'