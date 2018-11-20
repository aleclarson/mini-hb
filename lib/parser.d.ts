/** Each node represents a pair of `{{` and `}}` */
export interface Node {
    /** For blocks, this equals "#" for the head and "/" for the tail */
    type?: '#' | '/';
    /** The reference name */
    name: string;
    /** Arguments to a function call */
    args?: string[];
    /** Character offset where this node begins */
    start: number;
    /** The line number this node is on */
    line: number;
    /** Character offset where this node ends */
    end: number;
}
/** Each block represents a pair of `{{ #foo }}` and `{{ /foo }}` */
export interface Block {
    head: Node;
    body: string;
    tail: Node;
    parent: Block | null;
}
/** For syntax errors thrown by the parser */
export interface IParserError extends SyntaxError {
    node: Node;
}
/** @internal */
export declare function parse(template: string): (Node | Block)[];
