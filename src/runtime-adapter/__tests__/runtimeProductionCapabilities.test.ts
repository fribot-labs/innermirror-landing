import {
    describe,
    expect,
    it,
} from "vitest";

import {
    isRuntimeMemoryTimelineEnabled,
} from "../runtimeProductionCapabilities";

describe(
  "runtimeProductionCapabilities",
  () => {
    it(
      "enables Runtime Memory Timeline outside production",
      () => {
        expect(
          isRuntimeMemoryTimelineEnabled(
            false
          )
        ).toBe(true);
      }
    );

    it(
      "disables Runtime Memory Timeline in production",
      () => {
        expect(
          isRuntimeMemoryTimelineEnabled(
            true
          )
        ).toBe(false);
      }
    );
  }
);