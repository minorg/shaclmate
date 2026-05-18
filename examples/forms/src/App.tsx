import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import {Grid, Typography} from "@mui/material";
import dataFactory from "@rdfx/data-factory";
import { type FC, useMemo, useState } from "react";
import * as generated from "./generated.js";
import { Writer } from "n3";
import { z } from "zod";

const classes = {
  container: {
    padding: "1em",
    width: "100%",
  },
  title: {
    textAlign: "center",
    padding: "0.25em",
  },
  dataContent: {
    display: "flex",
    justifyContent: "center",
    borderRadius: "0.25em",
    backgroundColor: "#cecece",
    marginBottom: "1rem",
  },
  resetButton: {
    margin: "auto !important",
    display: "block !important",
  },
  demoform: {
    margin: "auto",
    padding: "1rem",
  },
};

const initialData = generated.FormNodeShape.toJson(
  generated.FormNodeShape.createUnsafe({
    $identifier: dataFactory.namedNode("http://example.com/form"),
    nestedObjectProperty: generated.NestedNodeShape.createUnsafe({
      $identifier: dataFactory.namedNode("http://example.com/nested"),
      requiredStringProperty: "required/nested",
    }),
    nonEmptyStringSetProperty: ["test"],
    requiredIntProperty: 1,
    requiredStringProperty: "required/form",
  }),
);

const jsonSchema = z.toJSONSchema(generated.FormNodeShape.Json.schema(), {target: "draft-7"});
const jsonSchemaString = JSON.stringify(jsonSchema, null, 2);
const jsonUiSchema = generated.FormNodeShape.Json.uiSchema();
const jsonUiSchemaString = JSON.stringify(jsonUiSchema, null, 2);

const renderers = materialRenderers;

const App: FC = () => {
  const [data, setData] = useState<object>(initialData);
  const dataJsonString = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const dataRdfString = useMemo(
    () =>
      generated.FormNodeShape.Json.parse(data)
        .chain(generated.FormNodeShape.fromJson)
        .map((instance) => {
          return new Writer({ format: "N-Triples" }).quadsToString([
            ...generated.FormNodeShape.toRdfResource(instance).dataset,
          ]);
        })
        .mapLeft((error) => error.toString())
        .extract(),
    [data],
  );

  return (
    <Grid
      container
      justifyContent={"center"}
      spacing={4}
      style={classes.container}
    >
      <Grid item sm={6}>
        <Typography variant={"h4"}>Data (JSON)</Typography>
        <div style={classes.dataContent}>
          <pre id="dataJson">{dataJsonString}</pre>
        </div>
        <Typography variant={"h4"}>Data (RDF)</Typography>
        <div style={classes.dataContent}>
          <pre
            id="dataRdf"
            style={{ padding: "0.5rem", whiteSpace: "pre-wrap" }}
          >
            {dataRdfString}
          </pre>
        </div>
        <Typography variant={"h4"}>JSON schema</Typography>
        <div style={classes.dataContent}>
          <pre id="jsonSchema">{jsonSchemaString}</pre>
        </div>
        <Typography variant={"h4"}>JSON Forms schema</Typography>
        <div style={classes.dataContent}>
          <pre id="jsonUiSchema">{jsonUiSchemaString}</pre>
        </div>
      </Grid>
      <Grid item sm={6}>
        <Typography variant={"h4"}>Rendered form</Typography>
        <div style={classes.demoform}>
          <JsonForms
            schema={jsonSchema as any}
            uischema={jsonUiSchema}
            data={data}
            renderers={renderers}
            cells={materialCells}
            onChange={({ data }) => setData(data)}
          />
        </div>
      </Grid>
    </Grid>
  );
};

export default App;
