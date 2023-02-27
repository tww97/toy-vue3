import { h, createTextVNode, getCurrentInstance, provide,ref } from "./lib/guide-toy-vue3.esm.js"
import { Child } from './Child.js'


export const App = {
    render(){
        const btn = h('button', {onClick: () => {this.change()}}, 'push')
        return h('div', {}, [btn, h('div', {}, `${this.count}`)])
    },

    setup(){
        const count = ref(0)
        const change = () => {
            console.log('change')
            count.value = count.value + 1
        }
        return {
            count,
            change
        }
    }
}