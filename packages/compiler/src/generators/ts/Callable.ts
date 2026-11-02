import type { DeclaredCallable } from "./DeclaredCallable.js";
import type { InlineCallable } from "./InlineCallable.js";
import type { ReferenceCallable } from "./ReferenceCallable.js";

export type Callable = InlineCallable | DeclaredCallable | ReferenceCallable;
