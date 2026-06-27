import path from "node:path";
import { fileURLToPath } from "node:url";

const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
// const compilerTestDataDirectoryPath = path.resolve(
//   path.join(thisDirectoryPath, "..", "compiler", "__tests__", "data"),
// );
const examplesDirectoryPath = path.resolve(
  path.join(thisDirectoryPath, "..", "..", "..", "examples"),
);

export const testData = {
  filePaths: {
    kitchenSinkExample: path.join(
      examplesDirectoryPath,
      "kitchen-sink",
      "src",
      "kitchen-sink.shaclmate.ttl",
    ),
  },
};
