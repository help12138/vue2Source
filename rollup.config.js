import babel from 'rollup-plugin-babel'

export default {
    input: './src/index.js', // 入口
    output:{
        file: './dist/vue.js',  // 出口
        name: 'Vue',
        format: 'umd',  // 打包格式
        sourcemap:true
    },
    plugins:[
        babel({
            exclude: 'node_modules/**'   // 排除node_modules的所有文件
        })
    ]
}