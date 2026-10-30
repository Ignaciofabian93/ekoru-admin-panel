"use client";

import { useState } from "react";
import type { AnalyticsRange } from "@/components/Charts";

/** The period last picked, so moving between analytics screens keeps it. */
let remembered: AnalyticsRange = "LAST_30_DAYS";

export function useAnalyticsRange() {
  const [range, setRangeState] = useState<AnalyticsRange>(remembered);
  const setRange = (next: AnalyticsRange) => {
    remembered = next;
    setRangeState(next);
  };
  return { range, setRange };
}
