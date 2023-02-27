//props三点
//1. 在setup函数中接收props（把props作为参数传递给setup函数）
//2. render函数中可以访问到props中的属性（使用proxy代理）
//3. props只能访问，不能被修改（使用shallowReadonly处理props）

export function initProps(instance, rawProps){
    instance.props = rawProps || {}
}