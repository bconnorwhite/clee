
export type Defined<T> = T extends undefined ? never : T;

export function isDefined<T>(value: T): value is Defined<T> {
  return value !== undefined;
}

export async function mapAllSeries<A extends Array<unknown>, R>(array: A, fn: (item: A[number], index: number) => R) {
  return array.reduce(async (retval: Promise<R[]>, item, index) => {
    return retval.then(async (result) => {
      const value = await fn(item, index);
      return [...result, value];
    });
  }, Promise.resolve([]));
}

export async function reduceAllSeries<A extends Array<unknown>, R>(array: A, fn: (accumulator: R, item: A[number], index: number) => Promise<R>, initial: R) {
  return array.reduce(async (accumulator: Promise<R>, item, index) => {
    return accumulator.then(async (result) => {
      return fn(result, item, index);
    });
  }, Promise.resolve(initial));
}
