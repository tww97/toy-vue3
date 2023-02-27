import { Fragment, Text } from './vnode';
import { EMPTY_OBJ, isObject } from "../shared"
import { ShapeFlages } from "../shared/ShapeFlages"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from './createApp';
import { effect } from '../reactivity/effect';
import { shouldUpdateComponent } from './componentUpdateUtils';
import { queueJobs } from './scheduler';



export function createRenderer(options){

    const {createElement: hostCreateElement,
        patchProps: hostPatchProps,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText } = options

    function render(vnode, container){
        patch(null, vnode, container, null, null)
    }

    function patch(n1, n2, container, parentComponent, anchor){
        const { shapeFlage, type } = n2

        switch (type){
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor)
                break;
            case Text:
                processText(n1, n2, container)
                break;
            default:
                if(shapeFlage & ShapeFlages.ELEMENT){
                    //处理元素
                    processElement(n1, n2, container, parentComponent, anchor)
                }else if(shapeFlage & ShapeFlages.STATEFUL_COMPONENT){
                    //处理组件
                    processComponent(n1, n2, container, parentComponent, anchor)
                }       
                break;     
        }
    }


    function processText(n1, n2, container){
        const { children } = n2
        const textNode = n2.el = document.createTextNode(children)
        container.append(textNode)
    }

    function processFragment(n1, n2, container, parentComponent, anchor){
        mountChildren(n2.children, container, parentComponent, anchor)
    }


    function processElement(n1, n2, container, parentComponent, anchor){

        if(!n1){
            //挂载阶段
            mountElement(n2, container, parentComponent, anchor)
        }else{
            //更新阶段
            patchElement(n1, n2, container, parentComponent, anchor)
        }
        
    }

    function patchElement(n1, n2, container, parentComponent, anchor){
        //处理props
        const oldProps = n1.props ||EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ

        const el = n2.el = n1.el

        patchChildren(n1, n2, el, parentComponent, anchor)
        patchProps(el, oldProps, newProps)


    }


    function patchChildren(n1, n2, container, parentComponent, anchor){

        //chidren有两种情况：text || array
        //1. 新：text  老：array
        //2. 新：text  老：text
        //3. 新：array  老：text
        //4. 新：array  老：array

        const prevShapFlag = n1.shapeFlage
        const { shapeFlage }  = n2
        const c1 = n1.children
        const c2 = n2.children

        if(shapeFlage & ShapeFlages.TEXT_CHILDREN){
            //1. 新：text  老：array
            if(prevShapFlag & ShapeFlages.ARRAY_CHILDREN){
                //1. 把老的children清空
                unmountChildren(n1.children)
   
            }
            //2. 新：text  老：text || array
            if( c1 !== c2){
                //2. 设置新的children，即text
                hostSetElementText(container, c2)
            }
            
        }else{
            //3. 新：array  老：text
            if(prevShapFlag & ShapeFlages.TEXT_CHILDREN){
                hostSetElementText(container, "")
                mountChildren(c2, container, parentComponent, anchor)
            }else{
                //4. 新：array  老：array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor)
            }
        }
    }

    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor){
        let i = 0
        let e1 = c1.length - 1
        let e2 = c2.length - 1

        function isSameVNodeType(n1, n2){
            return n1.type === n2.type && n1.key === n2.key
        }

        //双端对比，锁定中间乱序部分
        //左侧比较
        while(i <= e1 && i <= e2){
            const n1 = c1[i]
            const n2 = c2[i]

            if(isSameVNodeType(n1, n2)){
                //若n1和n2是相同节点，则调用patch递归比较子节点
                patch(n1, n2, container, parentComponent, parentAnchor)
            }else{
                break
            }

            i++
        }
        //右侧比较
        while(i <= e1 && i <= e2){
            const n1 = c1[e1]
            const n2 = c2[e2]

            if(isSameVNodeType(n1, n2)){
                patch(n1, n2, container, parentComponent, parentAnchor)
            }else{
                break
            }

            e1--
            e2--
        }

        //新的比老的多，创建新的中多的那些节点
        if(i > e1){
            if(i <= e2){
                const nextPos = e2 + 1
                const anchor = nextPos < c2.length ? c2[nextPos].el : null 
                while( i <= e2){
                    //考虑添加节点的位置
                    patch(null, c2[i], container, parentComponent, anchor)
                    i++
                }
                
            }
        }else if(i > e2){
            //老的比新的多，删除老的中多的那些节点
            while(i <= e1){
                hostRemove(c1[i].el)
                i++
            }
        } else{
            //中间对比，乱序的情况
            //三种情况
            //1. 创建新的（在老的里面不存在，新的里面存在）
            //2. 删除老的（在老的里面存在，在新的里面不存在）
            //3. 移动（节点存在于新的和老的里面，但是位置变了）
            let s1 = i
            let s2 = i

            const toBePatched = e2 - s2 + 1
            let patched = 0
            const keyToNewIndexMap = new Map()
            const newIndexToOldIndexMap = new Array(toBePatched)
            let moved = false
            let maxNewIndexSoFar = 0

            for(let i = 0; i < toBePatched; i++){
                newIndexToOldIndexMap[i] = 0
            }
            

            for(let i = s2; i <= e2; i++){
                const nextChild = c2[i]
                keyToNewIndexMap.set(nextChild.key, i)
            }

            for(let i = s1; i <= e1; i++){
                const prevChild = c1[i]

                if(patched >= toBePatched){
                    hostRemove(prevChild.el)
                    continue
                }

                let newIndex
                if(prevChild.key !== null){
                    newIndex = keyToNewIndexMap.get(prevChild.key)
                }else{
                    for(let j = s2; j <= e2; j++){
                        if(isSameVNodeType(prevChild, c2[j])){
                            newIndex = j
                            break
                        }
                    }
                }
                
                if(newIndex === undefined){
                    //在新的中不存在，删除
                    //2. 删除老的（在老的里面存在，在新的里面不存在）
                    hostRemove(prevChild.el)
                }else{
                    //在新的中存在，对比
                    if(newIndex >= maxNewIndexSoFar){
                        maxNewIndexSoFar = newIndex
                    }else{
                        moved = true
                    }
                    //newIndexToOldIndexMap中新节点的位置（从0开始）作为数组的key，对应的值是老节点的位置
                    newIndexToOldIndexMap[newIndex - s2] = i + 1
                    //递归对比子元素节点
                    patch(prevChild, c2[newIndex], container, parentComponent, null)
                    patched++
                }
            }

            //getSequence返回的是最长递增子序列的索引
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
            let j = increasingNewIndexSequence.length - 1

            for(let i = toBePatched - 1; i >= 0; i--){
                const nextIndex = i + s2
                const nextChild = c2[nextIndex]
                const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null

                if(newIndexToOldIndexMap[i] === 0){
                    //创建旧的中不存在新的中存在的节点
                    //1. 创建新的（在老的里面不存在，新的里面存在）
                    patch(null, nextChild, container, parentComponent, anchor)
                }else if(moved){
                    if(j < 0 || i !== increasingNewIndexSequence[j]){
                        //未匹配，该节点需要移动位置
                        //3. 移动（节点存在于新的和老的里面，但是位置变了）
                        hostInsert(nextChild.el, container, anchor)
                    }else{
                        j--
                    }
                }

            }
        } 

    }

    function unmountChildren(children){
        for(let i=0; i<children.length; i++){
            const el = children[i].el
            hostRemove(el)
        }
    }

    function patchProps(el, oldProps, newProps){ 
        //对比新旧props中的属性值是否相同，然后进一步进行修改或删除相关属性的操作
        if(oldProps !== newProps){
            for(const key in newProps){
                const prevProp = oldProps[key]
                const nextProp = newProps[key]
    
                if(prevProp !== nextProp){
                    hostPatchProps(el, key, prevProp, nextProp)
                }            
            }        

            if(oldProps !== EMPTY_OBJ){
                for(const key in oldProps){
                    if(!(key in newProps)){
                        hostPatchProps(el, key, oldProps[key], null)
                    }
                }
            }
        }

    }

    function mountElement(vnode, container, parentComponent, anchor){

        const el = vnode.el = hostCreateElement(vnode.type)

        //处理children
        const { children, shapeFlage } = vnode
        //children类型为string或array
        if(shapeFlage & ShapeFlages.TEXT_CHILDREN){
            el.textContent = children
        }else if(shapeFlage & ShapeFlages.ARRAY_CHILDREN){
            mountChildren(vnode.children, el, parentComponent, anchor)
        }
        

        //处理props
        const {props} = vnode
        

        for(const key in props){

            const val = props[key]

            hostPatchProps(el, key, null, val)
            
        }

        //挂载
        hostInsert(el, container, anchor)

    }


    function mountChildren(children, container, parentComponent, anchor){
        children.forEach((v) => {
            //需要处理数组中子元素不是vnode类型的情况
            if(typeof v === 'string'){
                container.append(v)
            }
            patch(null, v, container, parentComponent, anchor)
        })
    }

    function processComponent(n1, n2, container, parentComponent, anchor){
        if(!n1){
            mountComponent(n2, container, parentComponent, anchor)
        }else{
            updateComponent(n1, n2)
        }
        
    }

    function updateComponent(n1, n2){
        const instance = (n2.component = n1.component)
        if(shouldUpdateComponent(n1, n2)){ 
            instance.next = n2
            instance.update()
        }else{
            n1.el = n2.el
            instance.vnode = n2
        }

    }



    function mountComponent(initialVNode, container, parentComponent, anchor){
        const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent)

        setupComponent(instance)

        setupRenderEffect(instance, initialVNode, container, anchor)
    }

    function setupRenderEffect(instance, initialVNode, container, anchor){
        //使用effect进行依赖收集和触发依赖
        instance.update = effect(() => {
            if(!instance.isMounted){
                //初始化挂在流程
                const { proxy } = instance
                const subTree = instance.subTree = instance.render.call(proxy)
        
                //vnode -> patch
                //vnode -> element -> mount
                patch(null, subTree, container, instance, anchor)
                initialVNode.el = subTree.el

                instance.isMounted = true
            }else{
                //更新流程
                const { next, vnode } = instance
                if(next){
                    next.el = vnode.el
                    updateComponentPreRender(instance, next)
                }
                const { proxy } = instance
                const subTree = instance.render.call(proxy)
                const prevSubTree = instance.subTree

                instance.subTree = subTree

                patch(prevSubTree, subTree, container, instance, anchor)
            } 

        }, {
            scheduler(){
                queueJobs(instance.update)
            }
        })

    }

    return {
        createApp: createAppAPI(render)
    }

}

function updateComponentPreRender(instance, nextVNode){
    instance.vnode = nextVNode
    instance.next = null
    instance.props = nextVNode.props
}

//求数组最长递增子序列算法
function getSequence(arr){
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
        j = result[result.length - 1];
        if (arr[j] < arrI) {
            p[i] = j;
            result.push(i);
            continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
            c = (u + v) >> 1;
            if (arr[result[c]] < arrI) {
            u = c + 1;
            } else {
            v = c;
            }
        }
        if (arrI < arr[result[u]]) {
            if (u > 0) {
            p[i] = result[u - 1];
            }
            result[u] = i;
        }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
    }


