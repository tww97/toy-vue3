import {reactive} from "../reactive"

describe('reactive', () => {
    it('happy path', () => {
        const origional = {foo: 1}
        const observed = reactive(origional)
        expect(observed).not.toBe(origional)
        expect(observed.foo).toBe(1)
    })
})