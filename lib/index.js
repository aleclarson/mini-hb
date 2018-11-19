"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("./context");
var parser_1 = require("./parser");
var render_1 = require("./render");
exports.hb = (function ($0) {
    var contexts = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        contexts[_i - 1] = arguments[_i];
    }
    if (typeof $0 == 'string') {
        var ctx = contexts.length == 1 && contexts[0] instanceof context_1.Context
            ? contexts[0]
            : new context_1.Context(contexts);
        return render_1.render($0, parser_1.parse($0), ctx);
    }
    else {
        return $0 instanceof context_1.Context
            ? $0.concat(contexts)
            : (contexts.unshift($0), new context_1.Context(contexts));
    }
});
// The `bind` method
exports.hb.bind = function ($0) {
    var contexts = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        contexts[_i - 1] = arguments[_i];
    }
    var bound;
    var ctx = new context_1.Context(contexts);
    if (typeof $0 == 'string') {
        var template_1 = $0;
        var nodes_1 = parser_1.parse($0);
        bound = function () {
            var contexts = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                contexts[_i] = arguments[_i];
            }
            return render_1.render(template_1, nodes_1, ctx.concat(contexts));
        };
        bound.template = template_1;
    }
    else {
        ctx.stack.unshift($0);
        bound = function (template) {
            var contexts = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                contexts[_i - 1] = arguments[_i];
            }
            return render_1.render(template, parser_1.parse(template), ctx.concat(contexts));
        };
    }
    bound.context = ctx;
    return bound;
};
