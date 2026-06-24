export type QueryOne = <T extends Element = Element>(selector: string) => T | null;
export type QueryAll = <T extends Element = Element>(selector: string) => T[];

export const queryOne: QueryOne = (selector) => document.querySelector(selector);
export const queryAll: QueryAll = (selector) => Array.from(document.querySelectorAll(selector));
