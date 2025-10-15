import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import * as N3 from "n3";
const dataFactory = N3.DataFactory;
import { NonEmptyList } from "purify-ts";
import { type FC, useMemo, useState } from "react";
import * as generated from "./generated.js";

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

const initialData = generated.FormNodeShape.$toJson(
  generated.FormNodeShape.$create({
    $identifier: dataFactory.namedNode("http://example.com/form"),
    nestedObjectProperty: generated.NestedNodeShape.$create({
      $identifier: dataFactory.namedNode("http://example.com/nested"),
      requiredStringProperty: "required/nested",
    }),
    nonEmptyStringSetProperty: NonEmptyList(["test"]),
    requiredIntegerProperty: 1,
    requiredStringProperty: "required/form",
  }),
);

const jsonSchema = generated.FormNodeShape.$jsonSchema();
const jsonSchemaString = JSON.stringify(jsonSchema, null, 2);
const jsonUiSchema = generated.FormNodeShape.$jsonUiSchema();
const jsonUiSchemaString = JSON.stringify(jsonUiSchema, null, 2);

const renderers = materialRenderers;

const App: FC = () => {
  const [data, setData] = useState<object>(initialData);
  const dataJsonString = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const dataRdfString = useMemo(
    () =>
      generated.FormNodeShape.$fromJson(data)
        .mapLeft((error) => error.toString())
        .map((instance) => {
          return new N3.Writer({ format: "N-Triples" }).quadsToString([
            ...generated.FormNodeShape.$toRdf(instance).dataset,
          ]);
        })
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
