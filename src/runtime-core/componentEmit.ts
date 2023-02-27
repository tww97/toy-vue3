import { camelize, toHandlerKey } from './../shared/index';
//emit功能
//1. 在组件内部调用emit方法
//2. emit函数根据传入的函数名调用props中相关函数

export function emit(instance, event, ...args){
    const { props } = instance

    const handleName = toHandlerKey(camelize(event))
    const handler = props[handleName]

    handler && handler(...args)
}