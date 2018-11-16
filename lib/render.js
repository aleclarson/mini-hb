Object.defineProperty(exports, "__esModule", { value: true });
/** For knowing if an argument should be evaluated into a primitive */
var LITERAL_RE = /^(-?\d+(\.\d+)?|true|false|null)$/;
/** The last line (if empty) */
var LAST_LINE_EMPTY = /\n[ ]*$/;
function render(template, nodes, context) {
    if (nodes.length == 0)
        return template;
    var payload = '';
    // Build the payload.
    var node;
    var prevNode = null;
    for (var _i = 0, _a = nodes; _i < _a.length; _i++) {
        node = _a[_i];
        var content = void 0;
        if (node.args || node.head) {
            var head = node.head || node;
            var body = node.body || '';
            // Ensure the function exists.
            var func = context.get(head.name);
            if (typeof func !== 'function') {
                var err = new ReferenceError("No function named \"" + head.name + "\" exists");
                err.node = head;
                throw err;
            }
            // Prepare the arguments.
            var args = head.args || [];
            if (head.args) {
                var i = 0;
                do {
                    var arg = args[i];
                    args[i] = LITERAL_RE.test(arg) ? eval(arg) : context.get(arg);
                } while (++i < args.length);
            }
            content = func.apply(void 0, [body, context].concat(args));
        }
        else {
            content = context.get(node.name);
        }
        /** The static content between nodes. */
        var slice = template.slice(prevNode ? prevNode.end : 0, (node.head || node).start);
        if (node.head) {
            // Lines with only {{ #foo }} or {{ /foo }} are omitted from the payload.
            slice = slice.replace(LAST_LINE_EMPTY, '');
        }
        payload += slice + (content !== undefined ? content : '');
        prevNode = node.tail || node;
    }
    // Fin.
    return payload + template.slice(prevNode.end);
}
exports.render = render;
