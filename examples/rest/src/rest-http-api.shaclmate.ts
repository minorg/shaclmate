import { zValidator as honoZodValidator } from "@hono/zod-validator";
import type { BlankNode, NamedNode } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { NTriplesIdentifier } from "@rdfx/string";
import {
  type Env,
  Hono,
  type ValidationTargets as HonoValidationTargets,
} from "hono";
import { type Either, Left, Right } from "purify-ts";
import { type ZodType, z } from "zod";

export function $parseBlankNode(identifier: string): Either<Error, BlankNode> {
  return $parseIdentifier(identifier).chain((identifier) =>
    identifier.termType === "BlankNode"
      ? Right(identifier)
      : Left(new Error("expected identifier to be BlankNode")),
  ) as Either<Error, BlankNode>;
}

const $parseIdentifier = NTriplesIdentifier.parser(dataFactory);

const $zValidator = <
  T extends ZodType,
  Target extends keyof HonoValidationTargets,
>(
  target: Target,
  schema: T,
) =>
  honoZodValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          detail: result.error.message,
          status: 400,
          title: "Request validation error",
        },
        400,
        {
          "Content-Type": "application/problem+json",
        },
      );
    }
    return undefined;
  });

export type ExampleError = {
  readonly $type: "ExampleError";
  readonly message: string;
};

export namespace ExampleError {
  export type Identifier = BlankNode;
  export namespace Identifier {
    export const parse = $parseBlankNode;
  }

  export const isExampleError = (object: $Object): object is ExampleError =>
    object.$type === "ExampleError";
}

export type $Object = ExampleError;

export interface ExampleService {
  get(parameters: { readonly identifier: NamedNode }): Promise<
    Either<
      ExampleError,
      {
        readonly $identifier: () => BlankNode | NamedNode;
        readonly result: string;
      }
    >
  >;
}

export function createExampleServiceHttpApi<EnvT extends Env>(
  service: ExampleService,
) {
  return new Hono<EnvT>().get(
    "/:identifier",
    $zValidator(
      "param",
      z.object({ identifier: z.object({ "@id": z.string().min(1) }) }),
    ),
  );
}
