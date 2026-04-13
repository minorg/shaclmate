import base62 from "@sindresorhus/base62";
import reservedTsIdentifiers_ from "reserved-identifiers";
import { codeName } from "../codeName.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

const reservedTsIdentifiers = reservedTsIdentifiers_({
  includeGlobalProperties: true,
});

export const tsName = codeName((value) => {
  // Adapted from https://github.com/sindresorhus/to-valid-identifier , MIT license
  if (reservedTsIdentifiers.has(value)) {
    // We prefix with underscore to avoid any potential conflicts with the Base62 encoded string.
    return `$_${value}$`;
  }

  return value.replaceAll(
    /\P{ID_Continue}/gu,
    (x) => `$${base62.encodeInteger(x.codePointAt(0)!)}$`,
  );
}, syntheticNamePrefix);
