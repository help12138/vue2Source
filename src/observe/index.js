/**
 * 对象数据劫持方法
 */

import { newArrayProto } from "./array";

class Observe{
    constructor(data){
        
        Object.defineProperty(data, '__ob__',{
            // 此处this指的是observer的实例
            // 自定义的__ob__不可枚举
            value:this,
            enumerable:false
        })
        if(Array.isArray(data)){
            data.__proto__ = newArrayProto
            this.observerArray(data)
        }else{
            this.walk(data);
        }  
    }
    walk(data){  // 循环对象，对属性依次劫持
        // 重新定义属性
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
    }
    observerArray(data){
        // 观测数组
        data.forEach(item=>observe(item))
    }
}

export function defineReactive(target, key, value){
    observe(value)  // 对所有的对象都进行属性劫持
    Object.defineProperty(target,key,{
        get(){ // 取值的时候执行get
            return value
        },
        set(newValue){ // 修改的时候执行set
            if(newValue === value) return
            value = newValue
        }
    })
}

export function observe(data){
    // 对象数据劫持方法

    if (typeof data !== 'object' || data == null){
        return  // 只对对象劫持
    }
    if(data.__ob__ instanceof Observe){
        // 说明对象被监测过
        return data.__ob__
    }
    // console.log(data, "数据劫持")
    return new Observe(data)
}