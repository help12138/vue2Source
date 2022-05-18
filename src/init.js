import { initState } from './state'


export function initMixin(Vue){ // 给Vue增加init方法
    Vue.prototype._init = function(option){  // 用于初始化操作
        const vm = this
        vm.$options = option  // 将用户数据选项挂载在实例上

        initState(vm)  // 初始化状态
    }
}
