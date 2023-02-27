import { computed } from "../computed"
import { reactive } from "../reactive"


describe('computed', () => {
    it('happy path', () => {
        const user = reactive({
            foo: 1
        })

        const getter = jest.fn(() => {
            return user.foo
        })
        const val = computed(getter)

        expect(getter).not.toHaveBeenCalled()

        expect(val.value).toBe(1)
        expect(getter).toHaveBeenCalledTimes(1)
    })
})