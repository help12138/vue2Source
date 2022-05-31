(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  // 重写数组的部分方法
  var oldArrayProto = Array.prototype; // 数组的原型

  var newArrayProto = Object.create(oldArrayProto);
  var methods = [// 所有的变异方法
  'push', 'pop', 'unshift', 'shift', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    // arr.push(1,2,3)
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 重写了数组的方法
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 内部调用原来的方法， 函数的劫持


      var inserted;
      var ob = this.__ob__;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;

        case 'splice':
          inserted = args.slice(2);
      }

      if (inserted) {
        // 对新增的内容再次劫持
        // 由于onserveArray是Observer类的内部函数。所以需要将数据绑定到实例的自定义方法上
        ob.observerArray(inserted);
      }

      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);

      Object.defineProperty(data, '__ob__', {
        // 此处this指的是observer的实例
        // 自定义的__ob__不可枚举
        value: this,
        enumerable: false
      });

      if (Array.isArray(data)) {
        data.__proto__ = newArrayProto;
        this.observerArray(data);
      } else {
        this.walk(data);
      }
    }

    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        // 循环对象，对属性依次劫持
        // 重新定义属性
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observerArray",
      value: function observerArray(data) {
        // 观测数组
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);

    return Observe;
  }();

  function defineReactive(target, key, value) {
    observe(value); // 对所有的对象都进行属性劫持

    Object.defineProperty(target, key, {
      get: function get() {
        // 取值的时候执行get
        return value;
      },
      set: function set(newValue) {
        // 修改的时候执行set
        if (newValue === value) return;
        value = newValue;
      }
    });
  }
  function observe(data) {
    // 对象数据劫持方法
    if (_typeof(data) !== 'object' || data == null) {
      return; // 只对对象劫持
    }

    if (data.__ob__ instanceof Observe) {
      // 说明对象被监测过
      return data.__ob__;
    } // console.log(data, "数据劫持")


    return new Observe(data);
  }

  function initState(vm) {
    // 初始化状态
    var opts = vm.$options;

    if (opts.data) {
      initData(vm);
    }
  }

  function proxy(vm, target, key) {
    // 用来使用数据时能直接vm.data使用 
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key]; // vm._data.name
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data; // data可能是函数或者数据

    data = typeof data === 'function' ? data.call(vm) : data; // console.log(data, '初始化数据')

    vm._data = data; // 将返回的对象放到_data上

    observe(data); // 将data数据进行劫持
    // 将vm._data 用vm来代理

    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }

  function initMixin(Vue) {
    // 给Vue增加init方法
    Vue.prototype._init = function (option) {
      // 用于初始化操作
      var vm = this;
      vm.$options = option; // 将用户数据选项挂载在实例上

      initState(vm); // 初始化状态
    };
  }

  function Vue(option) {
    this._init(option);
  }

  initMixin(Vue); // 扩展了init方法

  return Vue;

}));
//# sourceMappingURL=vue.js.map
