import { zValidator as honoZodValidator } from "@hono/zod-validator";
import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { expandIri, type NamespaceBuilder, type PrefixMap } from "@rdfx/iri";
import { type Logger, nopLogger } from "@rdfx/logger";
import { NTriplesIdentifier } from "@rdfx/string";
import {
  type Env,
  Hono,
  type ValidationTargets as HonoValidationTargets,
} from "hono";
import { type ClientRequestOptions, hc } from "hono/client";
import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";
import { type ZodType, z } from "zod";

/**
 * Remove undefined values from a record.
 */
function $compactRecord<KeyT extends string, ValueT extends {}>(
  record: Record<KeyT, ValueT | undefined>,
): Record<KeyT, ValueT> {
  return globalThis.Object.entries(record).reduce(
    (definedProperties, [propertyName, propertyValue]) => {
      if (propertyValue !== undefined) {
        definedProperties[propertyName as KeyT] = propertyValue as ValueT;
      }
      return definedProperties;
    },
    {} as Record<KeyT, ValueT>,
  );
}

type $ConversionFunction<
  SourceT,
  TargetT,
  DefaultNamespaceT extends NamespaceBuilder = NamespaceBuilder,
> = (
  source: SourceT,
  options: { defaultNamespace: DefaultNamespaceT | undefined },
) => Either<Error, TargetT>;

function $convertToMaybe<
  DefaultNamespaceT extends NamespaceBuilder,
  ItemSourceT,
  ItemTargetT,
>(
  convertToItem: $ConversionFunction<
    ItemSourceT,
    ItemTargetT,
    DefaultNamespaceT
  >,
): $ConversionFunction<
  ItemSourceT | Maybe<ItemTargetT> | undefined,
  Maybe<ItemTargetT>,
  DefaultNamespaceT
> {
  return (value, options) => {
    switch (typeof value) {
      case "object": {
        if (Maybe.isMaybe(value)) {
          return Either.of(value as Maybe<ItemTargetT>);
        }
        break;
      }
      case "undefined":
        return Either.of(Maybe.empty());
    }

    return convertToItem(value, options).map(Maybe.of);
  };
}

/**
 * Convert a thrown error (type: unknown) to a problem details JSON object.
 */
export function $errorToProblemDetailsJson(
  error: unknown,
): $ProblemDetailsJson<500> {
  switch (typeof error) {
    case "bigint":
    case "boolean":
    case "number":
    case "string":
      return { detail: error.toString(), status: 500 };
    case "function":
    case "symbol":
    case "undefined":
      break;
    case "object": {
      if (error instanceof Error) {
        return {
          detail: error.message,
          status: 500,
          title: error.constructor?.name,
        };
      }
      break;
    }
  }

  return { status: 500 };
}

export type $FromJsonFunction<JsonValueT, ValueT, ValueSchemaT> = [
  ValueSchemaT,
] extends [undefined]
  ? (
      jsonValue: JsonValueT,
      options?: {
        context?: unknown;
        defaultNamespace?: NamespaceBuilder;
        prefixMap?: PrefixMap;
        schema?: unknown;
      },
    ) => Either<Error, ValueT>
  : (
      jsonValue: JsonValueT,
      options: {
        context?: unknown;
        defaultNamespace?: NamespaceBuilder;
        prefixMap?: PrefixMap;
        schema: ValueSchemaT;
      },
    ) => Either<Error, ValueT>;

function $identityConversionFunction<T>(
  value: T,
  _options: { defaultNamespace: NamespaceBuilder | undefined },
): Either<Error, T> {
  return Either.of(value);
}

function $identityValidationFunction<T>(
  _schema: unknown,
  value: T,
): Either<Error, T> {
  return Either.of(value);
}

function $iriFromJsonString(
  jsonString: string,
  options: Parameters<$FromJsonFunction<string, NamedNode, object>>[1],
): Either<Error, NamedNode> {
  return expandIri(jsonString, { ...options, dataFactory: dataFactory });
}

function $iriToJsonString<IriT extends string = string>(
  iri: NamedNode<IriT>,
): IriT {
  return iri.value;
}

function $maybeFromJsonValue<ItemJsonValueT, ItemT, ItemSchemaT>(
  itemFromJsonValue: $FromJsonFunction<ItemJsonValueT, ItemT, ItemSchemaT>,
): $FromJsonFunction<
  ItemJsonValueT | undefined,
  Maybe<ItemT>,
  $MaybeSchema<ItemSchemaT>
> {
  return (value, options) => {
    if (value === undefined) {
      return Either.of(Maybe.empty());
    }
    const { schema, ...otherOptions } = options;
    return itemFromJsonValue(value, {
      schema: schema.itemType,
      ...otherOptions,
    }).map((value) => Maybe.of(value));
  };
}

interface $MaybeSchema<ItemSchemaT> {
  readonly itemType: ItemSchemaT;
  readonly kind: "Option";
}

function $monkeyPatchObject<T extends object>(
  obj: T,
  methods: { toJson?: (obj: T) => object; $toString?: (obj: T) => string },
): T {
  if (
    methods.toJson &&
    (!globalThis.Object.prototype.hasOwnProperty.call(obj, "toJSON") ||
      typeof (obj as any).toJSON === "function")
  ) {
    const toJsonMethod = methods.toJson;
    (obj as any).toJSON = function (this: T, _key: string) {
      return toJsonMethod(this);
    };
  }

  if (
    methods.$toString &&
    (!globalThis.Object.prototype.hasOwnProperty.call(obj, "toString") ||
      typeof (obj as any).toJSON === "function")
  ) {
    const toStringMethod = methods.$toString;
    (obj as any).toString = function (this: T) {
      return toStringMethod(this);
    };
  }

  return obj;
}

export type $ObjectTypeGuardFunction<ObjectT extends $Object> = (
  object: $Object,
) => object is ObjectT;

export function $parseBlankNode(identifier: string): Either<Error, BlankNode> {
  return $parseIdentifier(identifier).chain((identifier) =>
    identifier.termType === "BlankNode"
      ? Right(identifier)
      : Left(new Error("expected identifier to be BlankNode")),
  ) as Either<Error, BlankNode>;
}

const $parseIdentifier = NTriplesIdentifier.parser(dataFactory);

function $primitiveToJsonValue<PrimitiveT extends boolean | number | string>(
  primitive: PrimitiveT,
): PrimitiveT {
  return primitive;
}

/**
 * Problem details JSON object, following RFC 9457.
 */
interface $ProblemDetailsJson<
  StatusT extends $ProblemDetailsJson.Status = $ProblemDetailsJson.Status,
> {
  /**
   * A human-readable explanation specific to this occurrence of the problem.
   */
  readonly detail?: string;

  /**
   * A URI reference that identifies the specific occurrence of the problem.
   */
  readonly instance?: string;

  /**
   * HTTP status code generated by the origin server for this occurrence of the problem.
   *
   * Must be the same status code as the one in the origin server's HTTP response.
   */
  readonly status: StatusT;

  /**
   * A short, human-readable summary of the problem type.
   *
   * It should not change from occurrence to occurrence of the problem, except for localization.
   */
  readonly title?: string;

  /**
   * A URI reference that identifies the problem type.
   */
  readonly type?: string;
}

namespace $ProblemDetailsJson {
  export type Status =
    // Client error 4xx
    | 400
    | 401
    | 402
    | 403
    | 404
    | 405
    | 406
    | 407
    | 408
    | 409
    | 410
    | 411
    | 412
    | 413
    | 414
    | 415
    | 416
    | 417
    | 418
    | 421
    | 422
    | 423
    | 424
    | 425
    | 426
    | 428
    | 429
    | 431
    | 451 // Server error 5xx
    | 500
    | 501
    | 502
    | 503
    | 504
    | 505
    | 506
    | 507
    | 508
    | 510
    | 511;
}

function $sequenceRecord<T extends Record<string, unknown>>(
  record: { [K in keyof T]: Either<Error, T[K]> },
): Either<Error, T> {
  const result: { [K in keyof T]?: T[K] } = {};

  for (const key of globalThis.Object.keys(record) as Array<keyof T>) {
    const either = record[key];
    if (either.isLeft()) {
      return either as unknown as Either<Error, T>;
    }
    result[key] = either.extract() as T[typeof key];
  }

  return Right(result as T);
}

function $stringFromJsonString<StringT extends string>(
  jsonString: StringT,
  _options: Parameters<
    $FromJsonFunction<StringT, StringT, $StringSchema<StringT>>
  >[1],
): Either<Error, StringT> {
  return Either.of(jsonString);
}

interface $StringSchema<StringT extends string> {
  readonly datatype: NamedNode;
  readonly hasValues?: readonly Literal[];
  readonly in?: readonly StringT[];
  readonly languageIn?: readonly string[];
  readonly kind: "String";
}

export type $ToLoggableFunction<T> = (value: T) => any;

export type $ToStringFunction<T> = (value: T) => string;

export type $ToStringRecordFunction<T> = (value: T) => Record<string, string>;

export interface $UnknownError {
  readonly error: Error;
}

export namespace $UnknownError {
  export type Discriminated = $UnknownError & { $type: "$UnknownError" };
}

function $validateMaybe<ItemSchemaT, ItemValueT>(
  validateItem: $ValidationFunction<ItemSchemaT, ItemValueT>,
) {
  return (
    schema: $MaybeSchema<ItemSchemaT>,
    valueMaybe: Maybe<ItemValueT>,
  ): Either<Error, Maybe<ItemValueT>> =>
    valueMaybe
      .map((value) =>
        validateItem(schema.itemType, value).map(() => valueMaybe),
      )
      .orDefault(Either.of(valueMaybe));
}

type $ValidationFunction<SchemaT, ValueT> = (
  schema: SchemaT,
  value: ValueT,
) => Either<Error, ValueT>;

const $xsd_string = dataFactory.namedNode(
  "http://www.w3.org/2001/XMLSchema#string",
);

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
          ...$errorToProblemDetailsJson(result.error),
          status: 400,
          title: "Request validation error",
        },
        400,
        { "Content-Type": "application/problem+json" },
      );
    }
    return undefined;
  });

/**
 * 403 Payment Required Error. Any properties must mirror problem JSON.
 */
export type PaymentRequiredError = {
  /**
   * A human-readable explanation specific to this occurrence of the problem.
   */
  readonly detail: Maybe<string>;
};

export namespace PaymentRequiredError {
  export const $toString: $ToStringFunction<object> = (_paymentRequiredError) =>
    `PaymentRequiredError(${JSON.stringify(PaymentRequiredError.toStringRecord(_paymentRequiredError))})`;

  export const create: <
    $DefaultNamespaceT extends NamespaceBuilder = NamespaceBuilder,
  >(
    parameters?: PaymentRequiredError.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, PaymentRequiredError.Discriminated> = (parameters = {}) =>
    $sequenceRecord({
      $type: Right("PaymentRequiredError" as const),
      detail: $convertToMaybe($identityConversionFunction)(parameters.detail, {
        defaultNamespace: parameters.$defaultNamespace,
      }).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PaymentRequiredError.schema.properties.detail.type,
          value,
        ),
      ),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: PaymentRequiredError.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends NamespaceBuilder = NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly detail?: string | Maybe<string>;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends NamespaceBuilder = NamespaceBuilder,
  >(
    parameters?: PaymentRequiredError.CreateParameters<$DefaultNamespaceT>,
  ) => PaymentRequiredError.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = PaymentRequiredError & {
    readonly $type: "PaymentRequiredError";
  };

  export const fromJson: $FromJsonFunction<
    PaymentRequiredError.Json,
    PaymentRequiredError.Discriminated,
    undefined
  > = (jsonObject, options = {}) =>
    $sequenceRecord({
      detail: $maybeFromJsonValue($stringFromJsonString<string>)(
        jsonObject["detail"],
        {
          ...options,
          schema: PaymentRequiredError.schema.properties.detail.type,
        },
      ),
    }).chain(PaymentRequiredError.create);

  export type Identifier = BlankNode;
  export namespace Identifier {
    export const parse = $parseBlankNode;
  }

  export const isPaymentRequiredError: $ObjectTypeGuardFunction<
    PaymentRequiredError.Discriminated
  > = (object): object is PaymentRequiredError.Discriminated =>
    object.$type === "PaymentRequiredError";

  export type Json = { detail?: string };

  export const schema = {
    kind: "Object",
    properties: {
      detail: {
        kind: "Shacl",
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
    },
  } as const;

  export type Schema = typeof schema;

  export const toLoggable: $ToLoggableFunction<PaymentRequiredError> = (
    _paymentRequiredError,
  ) =>
    $compactRecord({
      detail: _paymentRequiredError.detail.map((item) => item).extract(),
    });

  export const toStringRecord: $ToStringRecordFunction<object> = (
    _paymentRequiredError,
  ) => $compactRecord({});
}

/**
 * 403 Forbidden Error. Any properties must mirror problem JSON.
 */
export type ForbiddenError = {
  /**
   * A human-readable explanation specific to this occurrence of the problem.
   */
  readonly detail: Maybe<string>;
};

export namespace ForbiddenError {
  export const $toString: $ToStringFunction<object> = (_forbiddenError) =>
    `ForbiddenError(${JSON.stringify(ForbiddenError.toStringRecord(_forbiddenError))})`;

  export const create: <
    $DefaultNamespaceT extends NamespaceBuilder = NamespaceBuilder,
  >(
    parameters?: ForbiddenError.CreateParameters<$DefaultNamespaceT>,
  ) => Either<Error, ForbiddenError.Discriminated> = (parameters = {}) =>
    $sequenceRecord({
      $type: Right("ForbiddenError" as const),
      detail: $convertToMaybe($identityConversionFunction)(parameters.detail, {
        defaultNamespace: parameters.$defaultNamespace,
      }).chain((value) =>
        $validateMaybe($identityValidationFunction)(
          PaymentRequiredError.schema.properties.detail.type,
          value,
        ),
      ),
    }).map((object) =>
      $monkeyPatchObject(object, { $toString: ForbiddenError.$toString }),
    );

  export type CreateParameters<
    $DefaultNamespaceT extends NamespaceBuilder = NamespaceBuilder,
  > = {
    readonly $defaultNamespace?: $DefaultNamespaceT;
    readonly detail?: string | Maybe<string>;
  };

  export const createUnsafe: <
    $DefaultNamespaceT extends NamespaceBuilder = NamespaceBuilder,
  >(
    parameters?: ForbiddenError.CreateParameters<$DefaultNamespaceT>,
  ) => ForbiddenError.Discriminated = (parameters) =>
    create(parameters).unsafeCoerce();

  export type Discriminated = ForbiddenError & {
    readonly $type: "ForbiddenError";
  };

  export const fromJson: $FromJsonFunction<
    ForbiddenError.Json,
    ForbiddenError.Discriminated,
    undefined
  > = (jsonObject, options = {}) =>
    $sequenceRecord({
      detail: $maybeFromJsonValue($stringFromJsonString<string>)(
        jsonObject["detail"],
        {
          ...options,
          schema: PaymentRequiredError.schema.properties.detail.type,
        },
      ),
    }).chain(ForbiddenError.create);

  export type Identifier = BlankNode;
  export namespace Identifier {
    export const parse = $parseBlankNode;
  }

  export const isForbiddenError: $ObjectTypeGuardFunction<
    ForbiddenError.Discriminated
  > = (object): object is ForbiddenError.Discriminated =>
    object.$type === "ForbiddenError";

  export type Json = { detail?: string };

  export const schema = {
    kind: "Object",
    properties: {
      detail: {
        kind: "Shacl",
        type: {
          itemType: { datatype: $xsd_string, kind: "String" } as const,
          kind: "Option",
        } as const,
      } as const,
    },
  } as const;

  export type Schema = typeof schema;

  export const toLoggable: $ToLoggableFunction<ForbiddenError> = (
    _forbiddenError,
  ) =>
    $compactRecord({
      detail: _forbiddenError.detail.map((item) => item).extract(),
    });

  export const toStringRecord: $ToStringRecordFunction<object> = (
    _forbiddenError,
  ) => $compactRecord({});
}

export type $Object =
  | ForbiddenError.Discriminated
  | PaymentRequiredError.Discriminated;

export namespace $Object {
  export function $toString(object: $Object) {
    switch (object.$type) {
      case "ForbiddenError":
        return ForbiddenError.$toString(object);
      case "PaymentRequiredError":
        return PaymentRequiredError.$toString(object);
      default:
        object satisfies never;
        throw new Error("should never reach this point");
    }
  }
}

export interface ExampleService {
  get(parameters: {
    readonly identifier: NamedNode;
  }): Promise<
    Either<
      | ForbiddenError.Discriminated
      | PaymentRequiredError.Discriminated
      | $UnknownError.Discriminated,
      Maybe<{ readonly result: string }>
    >
  >;
}

export class LoggingExampleService implements ExampleService {
  private readonly delegate: ExampleService;
  private readonly logger: Logger;

  constructor({
    delegate,
    logger,
  }: { delegate: ExampleService; logger: Logger }) {
    this.delegate = delegate;
    this.logger = logger;
  }

  async get(parameters: {
    readonly identifier: NamedNode;
  }): Promise<
    Either<
      | ForbiddenError.Discriminated
      | PaymentRequiredError.Discriminated
      | $UnknownError.Discriminated,
      Maybe<{ readonly result: string }>
    >
  > {
    const logContext: Record<string, unknown> = {
      service: "ExampleService",
      operation: "get",
      parameters: { identifier: parameters.identifier.value },
    };
    this.logger.trace(logContext, "called");
    return (await this.delegate.get(parameters))
      .ifLeft((error) => {
        this.logger.error({ ...logContext, error }, "error");
      })
      .ifRight((output) => {
        this.logger.debug(
          {
            ...logContext,
            output: output
              .map((item) =>
                ((_object) => $compactRecord({ result: _object.result }))(item),
              )
              .extract(),
          },
          "success",
        );
      });
  }
}

export type ExampleServiceHttpApi<EnvT extends Env> = ReturnType<
  typeof ExampleServiceHttpApi.create<EnvT>
>;

export namespace ExampleServiceHttpApi {
  export function create<EnvT extends Env>(
    service: ExampleService,
    options?: { logger?: Logger },
  ) {
    const logger: Logger = options?.logger ?? nopLogger;
    return new Hono<EnvT>().get(
      "/:identifier",
      $zValidator("param", z.object({ identifier: z.string().min(1) })),
      async (c) =>
        (
          await service.get(
            $sequenceRecord({
              identifier: $iriFromJsonString(c.req.valid("param").identifier, {
                schema: { kind: "Iri" } as const,
              }),
            }).unsafeCoerce(),
          )
        )
          .mapLeft((error) => {
            let problemDetailsJson: $ProblemDetailsJson<402 | 403 | 500>;
            switch (error.$type) {
              case "ForbiddenError":
                problemDetailsJson = {
                  status: 403,
                  title: "ForbiddenError",
                  type: "http://example.com/ForbiddenError",
                  detail: error.detail.extract(),
                };
                break;
              case "PaymentRequiredError":
                problemDetailsJson = {
                  status: 402,
                  title: "PaymentRequiredError",
                  type: "http://example.com/PaymentRequiredError",
                  detail: error.detail.extract(),
                };
                break;
              case "$UnknownError":
                problemDetailsJson = $errorToProblemDetailsJson(error.error);
                break;
            }

            logger.error(
              {
                status: problemDetailsJson.status,
                type: problemDetailsJson.type,
              },
              problemDetailsJson.detail ?? "(no message)",
            );

            return c.json(problemDetailsJson, problemDetailsJson.status, {
              "Content-Type": "application/problem+json",
            });
          })
          .map((resultMaybe) => {
            const result = resultMaybe.extract();
            if (result === undefined) {
              return c.body(null, 404);
            }
            return c.json(
              ((_object) =>
                JSON.parse(
                  JSON.stringify({
                    result: $primitiveToJsonValue<string>(_object.result),
                  }),
                ))(result) as { result: string },
              200,
            );
          })
          .extract(),
    );
  }
}

export class ExampleServiceHttpClient implements ExampleService {
  private readonly honoClient: ReturnType<
    typeof hc<ExampleServiceHttpApi<Env>>
  >;

  constructor(baseUrl: string, options?: ClientRequestOptions) {
    this.honoClient = hc<ExampleServiceHttpApi<Env>>(baseUrl, options);
  }

  async get(parameters: {
    readonly identifier: NamedNode;
  }): Promise<
    Either<
      | ForbiddenError.Discriminated
      | PaymentRequiredError.Discriminated
      | $UnknownError.Discriminated,
      Maybe<{ readonly result: string }>
    >
  > {
    return EitherAsync(async (_eitherAsyncHelpers) => {
      const response = await this.honoClient[":identifier"].$get({
        param: {
          identifier: encodeURIComponent(
            $iriToJsonString<string>(parameters.identifier),
          ),
        },
      });

      if (response.status === 404) {
        return Maybe.empty();
      }

      if (response.status === 200) {
        let responseJson: { result: string };
        try {
          responseJson = await response.json();
        } catch (e) {
          return _eitherAsyncHelpers.throwE({
            error: e as Error,
            $type: "$UnknownError",
          });
        }

        return Maybe.of(
          await _eitherAsyncHelpers.liftEither(
            (
              ((
                jsonObject,
                options: Parameters<
                  $FromJsonFunction<
                    { result: string },
                    { readonly result: string },
                    undefined
                  >
                >[1] = {},
              ) =>
                $sequenceRecord({
                  result: $stringFromJsonString<string>(jsonObject["result"], {
                    ...options,
                    schema: { datatype: $xsd_string, kind: "String" } as const,
                  }),
                }).chain(((parameters) =>
                  $sequenceRecord({ result: Either.of(parameters.result) }).map(
                    (object) =>
                      $monkeyPatchObject(object, {
                        $toString: ((_object) =>
                          JSON.stringify(
                            ((_object) => $compactRecord({}))(_object),
                          )) satisfies $ToStringFunction<object>,
                      }),
                  )) satisfies <
                  $DefaultNamespaceT extends
                    NamespaceBuilder = NamespaceBuilder,
                >(parameters: {
                  readonly $defaultNamespace?: $DefaultNamespaceT;
                  readonly result: string;
                }) => Either<
                  Error,
                  { readonly result: string }
                >)) satisfies $FromJsonFunction<
                { result: string },
                { readonly result: string },
                undefined
              >
            )(responseJson).mapLeft((error) => ({
              error,
              $type: "$UnknownError",
            })),
          ),
        );
      }

      if (response.status === 403) {
        let responseJson: ForbiddenError.Json;
        try {
          responseJson = await response.json();
        } catch (e) {
          return _eitherAsyncHelpers.throwE({
            error: e as Error,
            $type: "$UnknownError",
          });
        }

        return _eitherAsyncHelpers.throwE(
          await _eitherAsyncHelpers.liftEither(
            ForbiddenError.fromJson(responseJson).mapLeft((error) => ({
              error,
              $type: "$UnknownError",
            })),
          ),
        );
      }

      if (response.status === 402) {
        let responseJson: PaymentRequiredError.Json;
        try {
          responseJson = await response.json();
        } catch (e) {
          return _eitherAsyncHelpers.throwE({
            error: e as Error,
            $type: "$UnknownError",
          });
        }

        return _eitherAsyncHelpers.throwE(
          await _eitherAsyncHelpers.liftEither(
            PaymentRequiredError.fromJson(responseJson).mapLeft((error) => ({
              error,
              $type: "$UnknownError",
            })),
          ),
        );
      }

      return _eitherAsyncHelpers.throwE({
        error: new Error(`unexpected response status: ${response.status}`),
        $type: "$UnknownError",
      });
    });
  }
}
