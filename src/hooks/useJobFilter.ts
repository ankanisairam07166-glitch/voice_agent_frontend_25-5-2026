/**
 * useJobFilter — manages active filter tab, filtered job list, and counts.
 * Extracted from Step2JobListings to keep the component focused on rendering.
 */

import { useState, useCallback } from "react";
import type { Job, FilterTab } from "../types";

export function useJobFilter(allJobs: Job[]) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const filtered = activeFilter === "all"
    ? allJobs
    : allJobs.filter((j) => j.filter_tags.includes(activeFilter));

  const applyFilter = useCallback((tab: FilterTab) => {
    setActiveFilter(tab);
  }, []);

  return { filtered, activeFilter, applyFilter };
}
