Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("./common");
var unwrapContext = function (ctx) {
    return ctx instanceof Context ? ctx.stack : ctx;
};
/** A stack of variable maps */
var Context = /** @class */ (function () {
    function Context(stack) {
        this.stack = stack ? common_1.flatMap(stack, unwrapContext) : [];
    }
    Context.prototype.get = function (key) {
        var stack = this.stack;
        for (var i = stack.length; i > 0;) {
            var value = common_1.dlv(stack[--i], key);
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
        var stack = this.stack.concat(common_1.flatMap(contexts, unwrapContext));
        return stack.length == this.stack.length ? this : new Context(stack);
    };
    return Context;
}());
exports.Context = Context;
