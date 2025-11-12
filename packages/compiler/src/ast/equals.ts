import type { Term } from "@rdfjs/types";
import type { Maybe } from "purify-ts";

export function arrayEquals<T>(
  left: readonly T[],
  right: readonly T[],
  equalator: (left: T, right: T) => boolean,
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let i = 0; i < left.length; i++) {
    if (!equalator(left[i], right[i])) {
      return false;
    }
  }

  return true;
}

export function maybeEquals<T>(
  left: Maybe<T>,
  right: Maybe<T>,
  equalator: (left: T, right: T) => boolean,
): boolean {
  if (left.isJust()) {
    if (right.isJust()) {
      return equalator(left.unsafeCoerce(), right.unsafeCoerce());
    }
    return false;
  }

  if (right.isJust()) {
    return false;
  }

  return true;
}

export function setEquals<T>(
  left: Set<T>,
  right: Set<T>,
  equalator: (left: T, right: T) => boolean,
): boolean {
  if (left.size !== right.size) {
    return false;
  }
  return arrayEquals([...left], [...right], equalator);
}

export function strictEquals<T>(left: T, right: T): boolean {
  return left === right;
}

export function termEquals(left: Term, right: Term): boolean {
  return left.equals(right);
}
