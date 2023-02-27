import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
    test('should not make non-reactive properties reactive', () => {
        const obj = {
            n: {
                foo: 1
            }
        }

        const props = shallowReadonly(obj)

        expect(isReadonly(props)).toBe(true)
        expect(isReadonly(props.n)).toBe(false)
    })
})

