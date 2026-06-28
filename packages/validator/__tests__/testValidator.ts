import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DatasetCore } from "@rdfjs/types";
import { it } from "vitest";
import type { Validator } from "../src/Validator.js";

const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
// const compilerTestDataDirectoryPath = path.resolve(
//   path.join(thisDirectoryPath, "..", "compiler", "__tests__", "data"),
// );
const examplesDirectoryPath = path.resolve(
  path.join(thisDirectoryPath, "..", "..", "..", "examples"),
);

const testFilePaths = {
  kitchenSinkExample: path.join(
    examplesDirectoryPath,
    "kitchen-sink",
    "src",
    "kitchen-sink.shaclmate.ttl",
  ),
};

export function testValidator(
  validatorFactory: (shapesGraph: DatasetCore) => Validator,
) {
  for (const id of [
    "kitchenSinkExample",
  ] satisfies readonly (keyof typeof testFilePaths)[]) {
    it(id, async () => {
        const dataGraph = new
    }
  }
}
