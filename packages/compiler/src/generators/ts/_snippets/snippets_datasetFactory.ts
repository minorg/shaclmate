import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_datasetFactory = conditionalOutput(
  `${syntheticNamePrefix}datasetFactory`,
  code`const ${syntheticNamePrefix}datasetFactory = new ${imports.DatasetFactory}();`,
);
