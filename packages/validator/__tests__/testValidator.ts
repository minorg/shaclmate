import datasetFactory from "@rdfjs/dataset";
import type { DatasetCore } from "@rdfjs/types";
import { RdfFile } from "@rdfx/fs";
import type { Either } from "purify-ts";
import { it } from "vitest";
import { testShapesGraphs } from "../../../test-shapes-graphs/index.js";
import { shaclShaclDataset } from "../src/shaclShaclDataset.js";
import type { Validator } from "../src/Validator.js";

export function testValidator(
  validatorFactory: (
    shapesGraph: DatasetCore,
  ) => Promise<Either<Error, Validator>>,
) {
  for (const [id, testShapesGraph] of Object.entries(testShapesGraphs)) {
    switch (testShapesGraph.kind) {
      case "dogfood":
      case "example":
        break;
      default:
        continue;
    }
    it(id, async ({ expect }) => {
      const dataGraph = datasetFactory.dataset();
      for (const filePath of testShapesGraph.filePaths) {
        await RdfFile.fromPath(filePath).unsafeCoerce().parseInto(dataGraph);
      }
      expect(dataGraph.size).toBeGreaterThan(0);

      const shapesGraph = shaclShaclDataset;

      const validatorEither = await validatorFactory(shapesGraph);
      if (validatorEither.isLeft()) {
        return;
      }
      const validator = validatorEither.unsafeCoerce();

      const validationReport = (
        await validator.validate(dataGraph)
      ).unsafeCoerce();
      expect(validationReport.conforms).toStrictEqual(true);
    }, 30000);
  }
}
