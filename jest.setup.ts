import { waffleJest } from "@ethereum-waffle/jest";

jest.setTimeout(20000);
expect.extend(waffleJest);
