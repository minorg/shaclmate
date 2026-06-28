import { Either, Maybe } from "purify-ts";
import { describe } from "vitest";
import { ZazukoValidator } from "../src/ZazukoValidator.js";
import { testValidator } from "./testValidator.js";

describe("ZazukoValidator", () => {
  testValidator(async (shapesGraph) =>
    Either.of(Maybe.of(new ZazukoValidator({ shapesGraph }))),
  );
});
