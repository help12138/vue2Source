import { initMixin } from './init'

function Vue(option){
    this._init(option)
}

initMixin(Vue)  // 扩展了init方法

export default Vue