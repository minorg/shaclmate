import type { BuiltinCallable } from "./BuiltinCallable.js";
import type { DeclaredCallable } from "./DeclaredCallable.js";
import type { InlineCallable } from "./InlineCallable.js";

export type Callable = InlineCallable | DeclaredCallable | BuiltinCallable;
