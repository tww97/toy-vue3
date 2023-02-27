import { hasOwn } from "../shared"

const publicPropertiesMap = {
    //实现this.$el
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props
}


export const PublicInstanceProxyHandlers = {
    get({_: instance}, key){
        const { setupState, props } = instance

        if(hasOwn(setupState, key)){
            return setupState[key]
        }else if(hasOwn(props, key)){
            return props[key]
        }

        const publicGetter = publicPropertiesMap[key]
        if(publicGetter){
            return publicGetter(instance)
        }
    }    
}


