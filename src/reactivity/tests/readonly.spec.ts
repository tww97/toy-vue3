import { isReactive, isReadonly, reactive, readonly } from "../reactive"

describe('readonly', () => {
    it('happy path', () => {
        const origional = {
            foo:1,
            bar:{
                baz:2
            }
        }
        const wrapped = readonly(origional)
        const res = reactive(origional)
        expect(wrapped).not.toBe(origional)
        expect(isReadonly(origional.bar)).toBe(false)
        expect(isReadonly(res.bar)).toBe(false)
        expect(isReactive(res.bar)).toBe(true)
        expect(isReadonly(wrapped.bar)).toBe(true)
        expect(wrapped.foo).toBe(1)
    })

    it('warn then call set', () => {
        console.warn = jest.fn()

        const user = readonly({
            age:10
        })

        user.age = 11
        expect(console.warn).toBeCalled()
    })
})