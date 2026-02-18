export function removeUndefined<T>(obj: T): T {
  if (obj !== null && typeof obj === "object") {
    if (Array.isArray(obj)) {
      return obj.map(removeUndefined).filter((v) => v !== undefined) as T;
    }

    if (Object.getPrototypeOf(obj) === Object.prototype) {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          (acc as any)[key] = removeUndefined(value);
        }
        return acc;
      }, {} as any);
    }
  }

  return obj;
}
