import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { dataset } from "./dataset.js";
import { $RdfjsDatasetObjectSet, graphqlSchema } from "./generated.js";

const yoga = createYoga({
  context: {
    objectSet: new $RdfjsDatasetObjectSet({ dataset }),
  },
  schema: graphqlSchema,
});

const server = createServer(yoga);

const port = 3000;
server.listen(port);
