import datasetFactory from "@rdfjs/dataset";
import dataFactory from "@rdfx/data-factory";
import shaclShaclQuads from "./shaclShaclQuads.js";

export const shaclShaclDataset = datasetFactory.dataset(
  shaclShaclQuads({ factory: dataFactory }),
);
