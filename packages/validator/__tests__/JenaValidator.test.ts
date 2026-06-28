import { describe } from "vitest";
import { JenaValidator } from "../src/JenaValidator.js";
import { testValidator } from "./testValidator.js";

describe.skipIf(process.env["CI"])("JenaValidator", () => {
  testValidator((shapesGraph) => JenaValidator.create({ shapesGraph }));
});
