// Express 4 does not forward rejected promises from async route handlers to
// the error middleware — an unhandled rejection crashes the whole process.
// Patch the router layer once so every handler's rejection reaches next()
// (same technique as the `express-async-errors` package, kept dependency-free).
// Import this module before any router is constructed.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - express internal module, no type declarations
import Layer from 'express/lib/router/layer.js';

type Handler = (...args: any[]) => any;

const WRAPPED = Symbol('quophy.asyncWrapped');

function wrap(fn: Handler): Handler {
  const wrapped: Handler = function (this: unknown, ...args: any[]) {
    const next: Handler = args[args.length - 1];
    try {
      const ret = fn.apply(this, args);
      if (ret && typeof ret.catch === 'function') ret.catch((err: unknown) => next(err));
      return ret;
    } catch (err) {
      next(err);
      return undefined;
    }
  };
  // Express decides sync vs error middleware by fn.length — preserve it.
  Object.defineProperty(wrapped, 'length', { value: fn.length });
  (wrapped as any)[WRAPPED] = true;
  return wrapped;
}

const original = (Layer as any).prototype.handle_request;
(Layer as any).prototype.handle_request = function (this: any, req: any, res: any, next: any) {
  const fn: Handler | undefined = this.handle;
  if (fn && fn.length <= 3 && !(fn as any)[WRAPPED]) {
    this.handle = wrap(fn);
  }
  return original.call(this, req, res, next);
};
