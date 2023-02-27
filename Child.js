import { h, inject } from "./lib/guide-toy-vue3.esm.js"

export const Child = {
    render(){
        const btn = h('button', {onClick: () => {this.change(this.msg)}}, 'Child')
        return h('div', {class:'blue'}, [btn, h('div', {}, `${this.n}`)])
    },

    setup(props, {emit}){
        const { n } = props
        const change = (val) => {
            console.log("msg: ", val)
            // debugger
            emit('add', val)
        }
        return {
            msg: 'hello',
            change,
            n
        }
    }
}