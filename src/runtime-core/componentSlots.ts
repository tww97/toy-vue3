import { ShapeFlages } from "../shared/ShapeFlages"


export function initSlots(instance, children){
    const { vnode } = instance
    if(vnode.shapeFlages & ShapeFlages.SLOT_CHILDREN){
        normalizeObjectSlots(children, instance.slots)
    }
}

function normalizeObjectSlots(children, slots){
    for(const key in children){
        const value = children[key]
        slots[key] = (props) => normalizeSlotValue(value(props))
    }
}

function normalizeSlotValue(value){
    return Array.isArray(value) ? value : [value]
}