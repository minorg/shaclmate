import { describe } from "vitest";
import { ZazukoValidator } from "../src/ZazukoValidator.js";
import { testValidator } from "./testValidator.js";

describe("ZazukoValidator", () => {
  testValidator((shapesGraph) => new ZazukoValidator({ shapesGraph }));
});
