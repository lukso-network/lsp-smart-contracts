import { waffleJest } from "@ethereum-waffle/jest";

jest.setTimeout(200000);
expect.extend({
  ...waffleJest,
  toBeRevertedWith: async (promise: Promise<any>, revertReason: string) => {
    // The matcher is using `String.search(regExp)` whose parameter is always a RegExp.
    // To correctly match custom errors, we must escape any parens as they are otherwise interpreted
    // as capture groups.
    return waffleJest.toBeRevertedWith(
      promise,
      revertReason.replace(/[()]/g, "\\$&")
    );
  },
});
