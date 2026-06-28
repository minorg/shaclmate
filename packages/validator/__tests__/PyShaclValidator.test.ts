import { describe } from "vitest";
import { PyShaclValidator } from "../src/PyShaclValidator.js";
import { testValidator } from "./testValidator.js";

describe.skipIf(process.env["CI"])("PyShaclValidator", () => {
  testValidator((shapesGraph) => PyShaclValidator.create({ shapesGraph }));
});
