import type { Code } from "../ts-poet-wrapper.js";

export type AbstractType_JsType =
  | {
      typeof: "bigint";
    }
  | {
      typeof: "boolean";
    }
  | {
      typeof: "function";
    }
  | {
      typeof: "number";
    }
  | {
      instanceof: "Array";
      typeof: "object";
    }
  | {
      className: Code;
      instanceof: "class";
      typeof: "object";
    }
  | {
      instanceof: "Date";
      typeof: "object";
    }
  | {
      instanceof: "Maybe";
      typeof: "object";
    }
  | {
      instanceof: "Object";
      typeof: "object";
    }
  | {
      typeof: "string";
    }
  | {
      typeof: "undefined";
    };

export namespace AbstractType_JsType {
  export function equals(
    left: AbstractType_JsType,
    right: AbstractType_JsType,
  ): boolean {
    if (left.typeof !== right.typeof) {
      return false;
    }

    if (
      left.typeof === "object" &&
      right.typeof === "object" &&
      left.instanceof !== right.instanceof
    ) {
      return false;
    }

    return true;
  }
}
