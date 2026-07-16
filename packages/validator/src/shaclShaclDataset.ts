import { datasetFactory } from "@rdfx/collection";
import dataFactory from "@rdfx/data-factory";
import shaclShaclQuads from "./shaclShaclQuads.js";

export const shaclShaclDataset = datasetFactory.dataset(
  shaclShaclQuads({ factory: dataFactory }),
);
