//provide和inject功能
//一个组件中同时使用provide和inject方法，inject方法只可以取到父组件的provides中的属性值，取不到本组件中provide方法设置的属性值
//组件嵌套：组件5 -> 组件4 -> 组件3 -> 组件2 -> 组件1 
//组件1               provides:{}
//组件2 执行provide   provides: {} -> {}
//组件3               provides: {} -> {}
//组件4 执行provide   provides: {} -> {} -> {}  执行inject，只能访问组件3中provides的属性
//组件5 执行inject    访问组件4中的provides: {} -> {} -> {}

import { getCurrentInstance } from "./component";

export function provide(key, value){

    const currentInstance:any = getCurrentInstance()

    if(currentInstance){

        let {provides} = currentInstance
        const parentProvides = currentInstance.parent ? currentInstance.parent.provides : currentInstance.provides
        //避免多次使用provides重复创建对象
        if(provides === parentProvides){
            //利用原型链将属性设置到空对象上
            provides = currentInstance.provides = Object.create(parentProvides)

        } 

        provides[key] = value
    }

} 

export function inject(key, defaultValue){

    const currentInstance: any = getCurrentInstance()

    if(currentInstance){

        const { parent } = currentInstance
        //在父组件的provides中进行属性查询
        const parentProvides = parent.provides

        if(key in parentProvides){
            return parentProvides[key]
        }else if(defaultValue){

            if(typeof defaultValue === 'function'){
                return defaultValue()
            }

            return defaultValue
        }
        
    }
}   