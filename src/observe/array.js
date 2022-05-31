// 重写数组的部分方法

let oldArrayProto = Array.prototype; // 数组的原型

export let newArrayProto = Object.create(oldArrayProto)

let methods = [// 所有的变异方法
    'push',
    'pop',
    'unshift',
    'shift',
    'reverse',
    'sort',
    'splice'
]

methods.forEach(method =>{
    // arr.push(1,2,3)
    newArrayProto[method] = function(...args){  // 重写了数组的方法
        const result = oldArrayProto[method].call(this, ...args)  // 内部调用原来的方法， 函数的劫持

        let inserted;
        let ob = this.__ob__
        switch(method){
            case 'push':
            case 'unshift':
                inserted = args;
            case 'splice':
                inserted = args.slice(2)
            default:
                break
        }
        
        if(inserted){
            // 对新增的内容再次劫持
            // 由于onserveArray是Observer类的内部函数。所以需要将数据绑定到实例的自定义方法上
            ob.observerArray(inserted)
        }

        return result
    }
})