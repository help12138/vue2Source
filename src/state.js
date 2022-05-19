import { observe } from './observe/index'

export function initState(vm){ // 初始化状态
    const opts = vm.$options
    if(opts.data){
        initData(vm)
    }
}

function proxy(vm, target, key) {
    // 用来使用数据时能直接vm.data使用 
    Object.defineProperty(vm, key,{
        get(){
            return vm[target][key]  // vm._data.name
        },
        set(newValue){
            vm[target][key] = newValue
        }
    })
}

function initData(vm){
    let data = vm.$options.data  // data可能是函数或者数据
    data =  typeof data === 'function' ? data.call(vm) : data
    // console.log(data, '初始化数据')

    vm._data = data  // 将返回的对象放到_data上
    observe(data)  // 将data数据进行劫持

    // 将vm._data 用vm来代理
    for(let key in data){
        proxy(vm, '_data', key)
    }
    
}