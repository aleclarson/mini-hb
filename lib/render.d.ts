import { Context } from './context';
import { Block, Node } from './parser';
/** For reference errors thrown by the renderer */
export interface IRenderError extends ReferenceError {
    node: Node;
}
export declare type RenderFn<T extends any[] = any[]> = (body: string, context: Context, ...args: T) => any;
export declare function render(template: string, nodes: Array<Node | Block>, context: Context): string;
