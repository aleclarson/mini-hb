"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("./common");
/** A stack of variable maps */
var Context = /** @class */ (function () {
    function Context(contexts) {
        this.stack = createStack(contexts);
    }
    Context.prototype.get = function (key) {
        var stack = this.stack;
        var path = key.split('.');
        for (var i = stack.length; i > 0;) {
            var value = common_1.dlv(stack[--i], path);
            if (value !== undefined) {
                return value;
            }
        }
        return '';
    };
    Context.prototype.concat = function () {
        var contexts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            contexts[_i] = arguments[_i];
        }
        var stack = this.stack.concat(createStack(contexts));
        return stack.length == this.stack.length ? this : new Context(stack);
    };
    return Context;
}());
exports.Context = Context;
var createStack = function (contexts) {
    return common_1.flatMap(contexts, unwrapContext).filter(isTruthy);
};
var unwrapContext = function (ctx) {
    return ctx instanceof Context ? ctx.stack : ctx;
};
var isTruthy = function (value) { return !!value; };
