import terser from "@rollup/plugin-terser"

export default [
    {
        input: 'src/export.js',
        output: {
            file: 'dist/jregexer.js',
            format: 'module'
        }
    },
    {
        input: 'src/export.js',
        output: {
            file: 'dist/jregexer.min.js',
            format: 'module'
        },
        plugins: [
            terser(),
        ]
    }
]
