import { ShapeFlages } from "../shared/ShapeFlages"

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')


export function createVNode(type, props?, children?){
    const vnode = {
        type, 
        props,
        children,
        component: null,
        key: props && props.key,
        shapeFlage: getShapeFlage(type),
        el: null
    }

    //children
    if(typeof children === 'string'){
        vnode.shapeFlage |= ShapeFlages.TEXT_CHILDREN
    }else if(Array.isArray(children)){
        vnode.shapeFlage |= ShapeFlages.ARRAY_CHILDREN
    }

    if(vnode.shapeFlage & ShapeFlages.STATEFUL_COMPONENT){
        if(typeof children === 'object'){
            vnode.shapeFlage |= ShapeFlages.SLOT_CHILDREN
        }
    }

    return vnode
}

export function createTextVNode(text){
    return createVNode(Text, {}, text)
}

function getShapeFlage(type){
    return typeof type === 'string' ? ShapeFlages.ELEMENT : ShapeFlages.STATEFUL_COMPONENT
}