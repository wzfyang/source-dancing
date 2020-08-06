const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;  
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >

let root;
let currentParent = null;
let stack = [];
const TYPE_ELEMENT = 1;
const TYPE_TEXT = 3;

function createASTElement(tagName, attrs) {
    return {
        tag: tagName,
        type: TYPE_ELEMENT,
        attrs: attrs,
        parent: null,
        children: []
    };
}

function start(tagName, attrs) {
    console.log('start', tagName);
    currentParent = createASTElement(tagName, attrs);
    if (!root) {
        root = currentParent;
    }
    stack.push(currentParent);

}

function end(result) {
    console.log('end', result);
    const element = stack.pop();
    currentParent = stack[stack.length - 1];
    if (currentParent) {
        element.parent = currentParent;
        currentParent.children.push(element);
    }

}

function chars(text) {
    console.log('chars', text);
    text = text.replace(/\s/g);
    if (text) {
        currentParent.children.push({
            type: TYPE_TEXT,
            text
        })
    }
}

export function parseHTML(html) {
    // debugger
    html = html.replace(/[\r\n]/g, "");
    while(html) {
        html = html.replace(/(^\s*) | (\s*$)/g, "");
        let textEnd = html.indexOf('<');
        if (textEnd === 0) {
            const startTagMatch = parseStartTag();
            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue;
            }

            const endTagMatch = html.match(endTag);
            if (endTagMatch) {
                end(endTagMatch[0]);
                advance(endTagMatch[0].length);
                continue;
            }
            
        }

        let text;
        if (textEnd > 0) {
            text = html.substring(0, textEnd);
        }

        if (text) {
            chars(text);
            advance(text.length);
        }

    }

    function parseStartTag() {
        const startTag = html.match(startTagOpen);
        if (startTag) {
            const match = {
                tagName: startTag[1],
                attrs: []
            }

            advance(startTag[0].length);
            
            let attr, tagEnd;
            while(!(tagEnd = html.match(startTagClose)) && (attr = html.match(attribute))) {
                match.attrs.push({
                    name: attr[1],
                    value: attr[3]
                })

                advance(attr[0].length);
            }

            if (tagEnd) {
                advance(tagEnd[0].length);
                return match;
            }
        }
    }

    function advance(n) {
        html = html.substring(n);
    }

    return root;
}