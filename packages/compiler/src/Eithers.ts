import type { Either } from "purify-ts";

export namespace Eithers {
  export function chain2<R1, R2>(
    either1: Either<Error, R1>,
    either2: Either<Error, R2>,
  ): Either<Error, [R1, R2]> {
    return either1.chain((r1) => either2.map((r2) => [r1, r2]));
  }

  export function chain3<R1, R2, R3>(
    either1: Either<Error, R1>,
    either2: Either<Error, R2>,
    either3: Either<Error, R3>,
  ): Either<Error, [R1, R2, R3]> {
    return either1.chain((r1) =>
      either2.chain((r2) => either3.map((r3) => [r1, r2, r3])),
    );
  }

  export function chain4<R1, R2, R3, R4>(
    either1: Either<Error, R1>,
    either2: Either<Error, R2>,
    either3: Either<Error, R3>,
    either4: Either<Error, R4>,
  ): Either<Error, [R1, R2, R3, R4]> {
    return either1.chain((r1) =>
      either2.chain((r2) =>
        either3.chain((r3) => either4.map((r4) => [r1, r2, r3, r4])),
      ),
    );
  }

  export function chain5<R1, R2, R3, R4, R5>(
    either1: Either<Error, R1>,
    either2: Either<Error, R2>,
    either3: Either<Error, R3>,
    either4: Either<Error, R4>,
    either5: Either<Error, R5>,
  ): Either<Error, [R1, R2, R3, R4, R5]> {
    return either1.chain((r1) =>
      either2.chain((r2) =>
        either3.chain((r3) =>
          either4.chain((r4) => either5.map((r5) => [r1, r2, r3, r4, r5])),
        ),
      ),
    );
  }

  export function chain6<R1, R2, R3, R4, R5, R6>(
    either1: Either<Error, R1>,
    either2: Either<Error, R2>,
    either3: Either<Error, R3>,
    either4: Either<Error, R4>,
    either5: Either<Error, R5>,
    either6: Either<Error, R6>,
  ): Either<Error, [R1, R2, R3, R4, R5, R6]> {
    return either1.chain((r1) =>
      either2.chain((r2) =>
        either3.chain((r3) =>
          either4.chain((r4) =>
            either5.chain((r5) =>
              either6.map((r6) => [r1, r2, r3, r4, r5, r6]),
            ),
          ),
        ),
      ),
    );
  }

  export function chain7<R1, R2, R3, R4, R5, R6, R7>(
    either1: Either<Error, R1>,
    either2: Either<Error, R2>,
    either3: Either<Error, R3>,
    either4: Either<Error, R4>,
    either5: Either<Error, R5>,
    either6: Either<Error, R6>,
    either7: Either<Error, R7>,
  ): Either<Error, [R1, R2, R3, R4, R5, R6, R7]> {
    return either1.chain((r1) =>
      either2.chain((r2) =>
        either3.chain((r3) =>
          either4.chain((r4) =>
            either5.chain((r5) =>
              either6.chain((r6) =>
                either7.map((r7) => [r1, r2, r3, r4, r5, r6, r7]),
              ),
            ),
          ),
        ),
      ),
    );
  }

  export function chain8<R1, R2, R3, R4, R5, R6, R7, R8>(
    either1: Either<Error, R1>,
    either2: Either<Error, R2>,
    either3: Either<Error, R3>,
    either4: Either<Error, R4>,
    either5: Either<Error, R5>,
    either6: Either<Error, R6>,
    either7: Either<Error, R7>,
    either8: Either<Error, R8>,
  ): Either<Error, [R1, R2, R3, R4, R5, R6, R7, R8]> {
    return either1.chain((r1) =>
      either2.chain((r2) =>
        either3.chain((r3) =>
          either4.chain((r4) =>
            either5.chain((r5) =>
              either6.chain((r6) =>
                either7.chain((r7) =>
                  either8.map((r8) => [r1, r2, r3, r4, r5, r6, r7, r8]),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  export function chain9<R1, R2, R3, R4, R5, R6, R7, R8, R9>(
    either1: Either<Error, R1>,
    either2: Either<Error, R2>,
    either3: Either<Error, R3>,
    either4: Either<Error, R4>,
    either5: Either<Error, R5>,
    either6: Either<Error, R6>,
    either7: Either<Error, R7>,
    either8: Either<Error, R8>,
    either9: Either<Error, R9>,
  ): Either<Error, [R1, R2, R3, R4, R5, R6, R7, R8, R9]> {
    return either1.chain((r1) =>
      either2.chain((r2) =>
        either3.chain((r3) =>
          either4.chain((r4) =>
            either5.chain((r5) =>
              either6.chain((r6) =>
                either7.chain((r7) =>
                  either8.chain((r8) =>
                    either9.map((r9) => [r1, r2, r3, r4, r5, r6, r7, r8, r9]),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  export function chain10<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10>(
    either1: Either<Error, R1>,
    either2: Either<Error, R2>,
    either3: Either<Error, R3>,
    either4: Either<Error, R4>,
    either5: Either<Error, R5>,
    either6: Either<Error, R6>,
    either7: Either<Error, R7>,
    either8: Either<Error, R8>,
    either9: Either<Error, R9>,
    either10: Either<Error, R10>,
  ): Either<Error, [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10]> {
    return either1.chain((r1) =>
      either2.chain((r2) =>
        either3.chain((r3) =>
          either4.chain((r4) =>
            either5.chain((r5) =>
              either6.chain((r6) =>
                either7.chain((r7) =>
                  either8.chain((r8) =>
                    either9.chain((r9) =>
                      either10.map((r10) => [
                        r1,
                        r2,
                        r3,
                        r4,
                        r5,
                        r6,
                        r7,
                        r8,
                        r9,
                        r10,
                      ]),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  export function chain11<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11>(
    either1: Either<Error, R1>,
    either2: Either<Error, R2>,
    either3: Either<Error, R3>,
    either4: Either<Error, R4>,
    either5: Either<Error, R5>,
    either6: Either<Error, R6>,
    either7: Either<Error, R7>,
    either8: Either<Error, R8>,
    either9: Either<Error, R9>,
    either10: Either<Error, R10>,
    either11: Either<Error, R11>,
  ): Either<Error, [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11]> {
    return either1.chain((r1) =>
      either2.chain((r2) =>
        either3.chain((r3) =>
          either4.chain((r4) =>
            either5.chain((r5) =>
              either6.chain((r6) =>
                either7.chain((r7) =>
                  either8.chain((r8) =>
                    either9.chain((r9) =>
                      either10.chain((r10) =>
                        either11.map((r11) => [
                          r1,
                          r2,
                          r3,
                          r4,
                          r5,
                          r6,
                          r7,
                          r8,
                          r9,
                          r10,
                          r11,
                        ]),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
