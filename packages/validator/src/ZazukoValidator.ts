import type { DatasetCore } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { ResourceSet } from "@rdfx/resource";
import { ValidationReport } from "@shaclmate/shacl-ast";
import { type Either, EitherAsync } from "purify-ts";
import SHACLValidator from "rdf-validate-shacl";
import { Validator } from "./Validator.js";

export class ZazukoValidator extends Validator {
  override async validate(
    dataGraph: DatasetCore,
  ): Promise<Either<Error, ValidationReport>> {
    return EitherAsync<Error, ValidationReport>(async ({ liftEither }) => {
      const validationReport = await new SHACLValidator(
        this.shapesGraph,
        {},
      ).validate(dataGraph);

      switch (validationReport.term.termType) {
        case "BlankNode":
        case "NamedNode":
          break;
        default:
          throw new RangeError(
            `unexpected sh:ValidationReport term type: ${validationReport.term.termType}`,
          );
      }

      return await liftEither(
        ValidationReport.fromRdfResource(
          new ResourceSet({
            dataFactory,
            dataset: validationReport.dataset,
          }).resource(validationReport.term),
        ),
      );
    });
  }
}
