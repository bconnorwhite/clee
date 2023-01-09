
export async function mapAllSeries<T, R>(array: T[], fn: (item: T, index: number) => R) {
  return array.reduce(async (retval: Promise<R[]>, item, index) => {
    return retval.then(async (result) => {
      const value = await fn(item, index);
      return [...result, value];
    });
  }, Promise.resolve([]));
}

export async function reduceAllSeries<T, R>(array: T[], fn: (accumulator: R, item: T, index: number) => Promise<R>, initial: R) {
  return array.reduce(async (accumulator: Promise<R>, item, index) => {
    return accumulator.then(async (result) => {
      return fn(result, item, index);
    });
  }, Promise.resolve(initial));
}
