import { compileToFunction } from './compiler'
import { initState } from './state'


export function initMixin(Vue){ // 给Vue增加init方法
    Vue.prototype._init = function(option){  // 用于初始化操作
        const vm = this
        vm.$options = option  // 将用户数据选项挂载在实例上

        initState(vm)  // 初始化状态

        if(option.el){
            vm.$mount(option.el)  // 实现数据的挂载
        }
    }
    Vue.prototype.$mount = function(el){
        // 判断用户用何种方式进行的挂载
        const vm = this
        el = document.querySelector(el)
        let ops = vm.$options
        if(!ops.render){  // 先判断是否有render函数
            let template;  // 没有render函数看是否写了template,没有就用外部的template
            if(!ops.template && el){
                template = el.outerHTML
            }else{
                if(el){  // 如果有el,则采用模板的内容
                    template = ops.template
                }
            }
            if(template){
                const render = compileToFunction(template)
                ops.render = render
            }
        }

        ops.render  // 最终都可以获取render方法
    }
}
