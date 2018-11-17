"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isArray = Array.isArray;
/** Deeply flatten an array of arrays */
function flatMap(src, mapFn, dest) {
    if (dest === void 0) { dest = []; }
    for (var i = 0, val = void 0; i < src.length; i++) {
        exports.isArray((val = src[i]))
            ? flatMap(val, mapFn, dest)
            : dest.push(mapFn(val, i));
    }
    return dest;
}
exports.flatMap = flatMap;
// https://github.com/developit/dlv
function dlv(obj, key, def) {
    var p = 0;
    key = exports.isArray(key) ? key : key.split('.');
    while (obj && p < key.length)
        obj = obj[key[p++]];
    return obj === undefined || p < key.length ? def : obj;
}
exports.dlv = dlv;
