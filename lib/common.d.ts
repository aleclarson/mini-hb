import { Context } from './context';
export declare type AnyObj = {
    [key: string]: any;
};
export declare type RenderFn = (template: string, ...contexts: AnyObj[]) => string;
export declare type TemplateFn = (...contexts: AnyObj[]) => string;
export interface IHandleBars {
    bind: IBindFn;
    /** Parse a template and render it into a string */
    (template: string, ...contexts: AnyObj[]): string;
    /** Create an immutable context that can be reused */
    (...contexts: AnyObj[]): Context;
}
export interface IBoundProps {
    readonly template?: string;
    readonly context: Context;
}
export interface IBindFn extends Function {
    /** Bind a template (and optionally some context) to the renderer */
    (template: string, ...contexts: AnyObj[]): TemplateFn & IBoundProps;
    /** Bind some context to the renderer */
    (...contexts: AnyObj[]): RenderFn & IBoundProps;
}
export declare const isArray: (arg: any) => arg is any[];
/** Deeply flatten an array of arrays */
export declare function flatMap<T, U>(src: T[], mapFn: (val: T, i: number) => U, dest?: U[]): U[];
export declare function dlv(obj: AnyObj, path: string[], def?: any): any;
