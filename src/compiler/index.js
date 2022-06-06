const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 开始标签名匹配规则
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)   // 匹配的是结束标签的名字
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const startTagClose = /^\s*(\/?)>/
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

// 对模板进行编译处理
function parseHTML(html){

    const ElEMENT_TYPE = 1
    const TEXT_TYPE = 3
    const stack = []  // 用于存放元素
    let currentParent  // 指向的是栈中的最后一个
    let root

    // 最终需要转化成一个抽象语法树
    function createASTElement(tag, attrs){
        return {
            tag,
            type:ElEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }

    function start(tag, attrs){
        let node = createASTElement(tag, attrs)
        if(!root){  // 看一下是否是空树
            root = node
        }
        if(currentParent){
            node.parent = currentParent  // 只赋予了parent属性
            currentParent.children.push(node)  // 还需要让父亲记住自己
        }
        stack.push(node)
        currentParent = node  // 指针是栈中最后一个
    }
    function chars(text){
        text = text.replace(/\s/g, '')
        // 文本直接放到当前节点中
        text && currentParent.children.push({
            type:TEXT_TYPE,
            text,
            parent: currentParent
        })
    }
    function end(tag){
        // 弹出最后一个
        stack.pop()
        currentParent = stack[stack.length - 1]
    }
    
    function advance(n){
        // 截取标签后续内容
        html = html.substring(n)
    }
    function parseStartTag(){
        // 处理开头标签
        const start = html.match(startTagOpen)
        if(start){
            const match = {
                tagName: start[1], // 标签名
                attrs:[]
            }
            advance(start[0].length)
            let attr, end
            while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
                // 如果不是结束标签就一直匹配下去
                advance(attr[0].length)
                match.attrs.push({name: attr[1], value: attr[3] || attr[4] || attr[5] || true})
            }
            if(end){
                advance(end[0].length)
            }
            // console.log(match)
            return match
            
        }

        return false // 不是开始标签
    }
    while(html){
        let textEnd = html.indexOf('<')  // 如果indexOf的索引是0, 则说明是个标签
        if(textEnd == 0){
            const startTagMatch = parseStartTag()  // 开始标签的匹配

            if(startTagMatch){  // 解析到开始标签
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }

            let endTagMatch =  html.match(endTag)
            if(endTagMatch){
                end(endTagMatch[1])
                advance(endTagMatch[0].length)
                continue
            }
        }
        if(textEnd > 0){
            // 如果大于0,那就说明是文本
            let text = html.substring(0, textEnd)
            // console.log(html)
            if(text){
                chars(text)
                advance(text.length)  // 解析文本
            }
        }
    }
    console.log(root)
}

export function compileToFunction(template){
    // 1. 将template转化成ast语法树
    let ast = parseHTML(template)

    // 2. 生成render方法(render方法执行后的返回结果就是虚拟DOM)
    console.log(template)
}