import typescript from "@rollup/plugin-typescript"
// import pkg from './package.json'

export default{
    input: './src/index.ts',
    output: [
        {
            format: "cjs",
            file: "lib/guide-toy-vue3.cjs.js"
        },
        {
            format: "es",
            file: "lib/guide-toy-vue3.esm.js"
        },
    ],
    plugins: [typescript()]
}