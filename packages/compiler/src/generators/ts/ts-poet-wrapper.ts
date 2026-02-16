/**
 * Wrapper around ts-poet, enabled during debugging to throw errors on Code.toString.
 */

export * from "ts-poet";

import { Code } from "ts-poet";

const originalCodeToString = Code.prototype.toString;

Code.prototype.toString = function (
  opts?: Parameters<Code["toString"]>[0],
): string {
  if (!opts) {
    throw new Error("Code.toString should not be called without opts");
  }
  return originalCodeToString.call(this, opts);
};
