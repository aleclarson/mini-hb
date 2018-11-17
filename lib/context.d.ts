import { AnyObj } from './common';
/** A stack of variable maps */
export declare class Context {
    readonly stack: AnyObj[];
    constructor(stack?: AnyObj[]);
    get(key: string): any;
    concat(...contexts: AnyObj[]): Context;
}
