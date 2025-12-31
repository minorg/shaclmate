import type { Term } from "@rdfjs/types";

import type { Maybe } from "purify-ts";

type EqualsFunction<T> = (left: T, right: T) => boolean;

export function arrayEquals<T>(
  elementEquals: EqualsFunction<T>,
): EqualsFunction<readonly T[]> {
  return (left: readonly T[], right: readonly T[]): boolean => {
    if (left.length !== right.length) {
      return false;
    }

    for (let i = 0; i < left.length; i++) {
      if (!elementEquals(left[i], right[i])) {
        return false;
      }
    }

    return true;
  };
}

export function dateEquals(left: Date, right: Date): boolean {
  return left.getTime() === right.getTime();
}

export function maybeEquals<T>(
  valueEquals: EqualsFunction<T>,
): EqualsFunction<Maybe<T>> {
  return (left: Maybe<T>, right: Maybe<T>): boolean => {
    if (left.isJust()) {
      if (right.isJust()) {
        return valueEquals(left.unsafeCoerce(), right.unsafeCoerce());
      }
      return false;
    }

    if (right.isJust()) {
      return false;
    }

    return true;
  };
}

export function recordEquals<KeyT extends keyof any, ValueT>(
  valueEquals: EqualsFunction<ValueT>,
): EqualsFunction<Record<KeyT, ValueT>> {
  return (
    left: Readonly<Record<KeyT, ValueT>>,
    right: Readonly<Record<KeyT, ValueT>>,
  ): boolean => {
    const leftKeys = Object.keys(left) as unknown as readonly KeyT[];
    const rightKeys = Object.keys(right) as unknown as readonly KeyT[];

    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    for (const leftKey of leftKeys) {
      const leftValue = left[leftKey];
      const rightValue = right[leftKey];
      if (typeof rightValue === "undefined") {
        return false;
      }
      if (!valueEquals(leftValue, rightValue)) {
        return false;
      }
    }

    return true;
  };
}

export function setEquals<T>(
  elementEquals: EqualsFunction<T>,
): EqualsFunction<ReadonlySet<T>> {
  return (left: ReadonlySet<T>, right: ReadonlySet<T>): boolean => {
    if (left.size !== right.size) {
      return false;
    }
    return arrayEquals(elementEquals)([...left], [...right]);
  };
}

export function strictEquals<T>(left: T, right: T): boolean {
  return left === right;
}

export function termEquals(left: Term, right: Term): boolean {
  return left.equals(right);
}
