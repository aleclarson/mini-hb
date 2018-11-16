Object.defineProperty(exports, "__esModule", { value: true });
// Character codes
var LINE_BREAK = '\n'.charCodeAt(0);
var L_BRACKET = '{'.charCodeAt(0);
var R_BRACKET = '}'.charCodeAt(0);
var COMMA = ','.charCodeAt(0);
var SPACE = ' '.charCodeAt(0);
var SLASH = '/'.charCodeAt(0);
var HASH = '#'.charCodeAt(0);
/** For validating variable names */
var VAR_RE = /^[a-z_$][a-z0-9_.$]*$/i;
/** For removing the first level of indentation */
var INDENT_RE = /(^|\n)  /g;
/** The first line (if empty) */
var FIRST_LINE_EMPTY = /^[ ]*\n/;
/** The last line (if empty) */
var LAST_LINE_EMPTY = /\n[ ]*$/;
/** For defining a non-nullable property. */
var nil = undefined;
/** @internal */
function parse(template) {
    /** List of top-level nodes */
    var nodes = [];
    /** 0-based char offset */
    var i = -1;
    /** 1-based line offset */
    var line = 1;
    /** Current in-progress node */
    var node = null;
    /** Current block */
    var block = null;
    while (i < template.length - 1) {
        var ch = template.charCodeAt(++i);
        if (ch == LINE_BREAK) {
            line++;
            continue;
        }
        if (!node) {
            // Parse the opening brackets.
            if (ch !== L_BRACKET)
                continue;
            ch = template.charCodeAt(i + 1);
            if (ch !== L_BRACKET)
                continue;
            i++;
            // Create an unclosed node.
            node = {
                type: nil,
                name: nil,
                args: nil,
                start: i - 1,
                line: line,
                end: nil,
            };
            continue;
        }
        // Parse the closing brackets.
        if (ch !== R_BRACKET)
            continue;
        ch = template.charCodeAt(i + 1);
        if (ch !== R_BRACKET)
            continue;
        i++;
        // Extract the contents between {{ and }}
        var content = template.slice(node.start + 2, i - 1).trim();
        node.end = i + 1;
        // The first char indicates the node type.
        ch = content.charCodeAt(0);
        // Opening a block.
        if (ch == HASH) {
            node.type = '#';
            block = {
                head: parseNode(node, content, !!block),
                body: nil,
                tail: nil,
                parent: block,
            };
        }
        // Closing a block.
        else if (ch == SLASH) {
            node.type = '/';
            parseNode(node, content, !!block);
            if (!block || node.name !== block.head.name) {
                var err = new SyntaxError("Unexpected closing node on line " + node.line);
                err.node = node;
                throw err;
            }
            if (!block.parent) {
                var body = template.slice(block.head.end, node.start);
                block.body =
                    node.line == block.head.line
                        ? body
                        : body
                            .replace(FIRST_LINE_EMPTY, '') // remove first line (if empty)
                            .replace(LAST_LINE_EMPTY, '') // remove last line (if empty)
                            .replace(INDENT_RE, '$1'); // dedent one level
                block.tail = node;
                nodes.push(block);
            }
            block = block.parent;
        }
        // Push top-level nodes only.
        else if (!block) {
            nodes.push(parseNode(node, content));
        }
        // The node is fully parsed.
        node = null;
    }
    // Were all nodes closed?
    if (node) {
        var err = new SyntaxError("Unclosed node on line " + node.line);
        err.node = node;
        throw err;
    }
    // Were all blocks closed?
    if (block) {
        var err = new SyntaxError("Unclosed block on line " + block.head.line);
        err.node = block.head;
        throw err;
    }
    return nodes;
}
exports.parse = parse;
/** For parsing the content between `{{` and `}}` */
function parseNode(node, content, skipArgs) {
    var i = node.type ? 1 : 0;
    // Parse the variable/function name.
    var name = '';
    for (; i < content.length; i++) {
        if (content.charCodeAt(i) == SPACE)
            break;
        name += content[i];
    }
    // Validate the name.
    if (VAR_RE.test(name)) {
        node.name = name;
    }
    else {
        throw badVariableName(name, node);
    }
    // Parse the arguments.
    if (!skipArgs && ++i < content.length) {
        var arg = '';
        var args = [];
        for (; i < content.length; i++) {
            var ch = content.charCodeAt(i);
            if (ch == SPACE)
                continue;
            if (ch == COMMA) {
                args.push(arg);
                arg = '';
            }
            else {
                arg += content[i];
            }
        }
        args.push(arg);
        node.args = args;
    }
    return node;
}
function badVariableName(name, node) {
    var err = new SyntaxError("Invalid variable name \"" + name + "\" on line " + node.line);
    err.node = node;
    return err;
}
