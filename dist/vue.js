(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
    var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
    var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 开始标签名匹配规则

    var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配的是结束标签的名字

    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    var startTagClose = /^\s*(\/?)>/;

    function parseHTML(html) {
      var ElEMENT_TYPE = 1;
      var TEXT_TYPE = 3;
      var stack = []; // 用于存放元素

      var currentParent; // 指向的是栈中的最后一个

      var root; // 最终需要转化成一个抽象语法树

      function createASTElement(tag, attrs) {
        return {
          tag: tag,
          type: ElEMENT_TYPE,
          children: [],
          attrs: attrs,
          parent: null
        };
      }

      function start(tag, attrs) {
        var node = createASTElement(tag, attrs);

        if (!root) {
          // 看一下是否是空树
          root = node;
        }

        if (currentParent) {
          node.parent = currentParent; // 只赋予了parent属性

          currentParent.children.push(node); // 还需要让父亲记住自己
        }

        stack.push(node);
        currentParent = node; // 指针是栈中最后一个
      }

      function chars(text) {
        text = text.replace(/\s/g, ''); // 文本直接放到当前节点中

        text && currentParent.children.push({
          type: TEXT_TYPE,
          text: text,
          parent: currentParent
        });
      }

      function end(tag) {
        // 弹出最后一个
        stack.pop();
        currentParent = stack[stack.length - 1];
      }

      function advance(n) {
        // 截取标签后续内容
        html = html.substring(n);
      }

      function parseStartTag() {
        // 处理开头标签
        var start = html.match(startTagOpen);

        if (start) {
          var match = {
            tagName: start[1],
            // 标签名
            attrs: []
          };
          advance(start[0].length);

          var attr, _end;

          while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            // 如果不是结束标签就一直匹配下去
            advance(attr[0].length);
            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5] || true
            });
          }

          if (_end) {
            advance(_end[0].length);
          } // console.log(match)


          return match;
        }

        return false; // 不是开始标签
      }

      while (html) {
        var textEnd = html.indexOf('<'); // 如果indexOf的索引是0, 则说明是个标签

        if (textEnd == 0) {
          var startTagMatch = parseStartTag(); // 开始标签的匹配

          if (startTagMatch) {
            // 解析到开始标签
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
          }

          var endTagMatch = html.match(endTag);

          if (endTagMatch) {
            end(endTagMatch[1]);
            advance(endTagMatch[0].length);
            continue;
          }
        }

        if (textEnd > 0) {
          // 如果大于0,那就说明是文本
          var text = html.substring(0, textEnd); // console.log(html)

          if (text) {
            chars(text);
            advance(text.length); // 解析文本
          }
        }
      }

      console.log(root);
    }

    function compileToFunction(template) {
      // 1. 将template转化成ast语法树
      parseHTML(template); // 2. 生成render方法(render方法执行后的返回结果就是虚拟DOM)

      console.log(template);
    }

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

        if (option.el) {
          vm.$mount(option.el); // 实现数据的挂载
        }
      };

      Vue.prototype.$mount = function (el) {
        // 判断用户用何种方式进行的挂载
        var vm = this;
        el = document.querySelector(el);
        var ops = vm.$options;

        if (!ops.render) {
          // 先判断是否有render函数
          var template; // 没有render函数看是否写了template,没有就用外部的template

          if (!ops.template && el) {
            template = el.outerHTML;
          } else {
            if (el) {
              // 如果有el,则采用模板的内容
              template = ops.template;
            }
          }

          if (template) {
            var render = compileToFunction(template);
            ops.render = render;
          }
        }

        ops.render; // 最终都可以获取render方法
      };
    }

    function Vue(option) {
      this._init(option);
    }

    initMixin(Vue); // 扩展了init方法

    return Vue;

}));
//# sourceMappingURL=vue.js.map
