import { AnyObj } from './common';
/** A stack of variable maps */
export declare class Context {
    readonly stack: AnyObj[];
    constructor(contexts: AnyObj[]);
    get(key: string): any;
    concat(...contexts: AnyObj[]): Context;
}
