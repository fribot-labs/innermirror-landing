import { useCallback, useEffect, useState } from "react";
import type { ProjectAnalysisMemoryEvent } from "../types/projectAnalysisMemory";
import {
    clearProjectAnalysisMemoryEvents,
    readProjectAnalysisMemoryEvents,
    saveProjectAnalysisMemoryEvent,
} from "./projectAnalysisMemoryStore";

export function useProjectAnalysisMemory() {
  const [events, setEvents] = useState<ProjectAnalysisMemoryEvent[]>([]);

  const refresh = useCallback(() => {
    setEvents(readProjectAnalysisMemoryEvents());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveEvent = useCallback(
    (event: ProjectAnalysisMemoryEvent) => {
      const nextEvents = saveProjectAnalysisMemoryEvent(event);
      setEvents(nextEvents);
    },
    []
  );

  const clearEvents = useCallback(() => {
    clearProjectAnalysisMemoryEvents();
    setEvents([]);
  }, []);

  return {
    events,
    saveEvent,
    clearEvents,
    refresh,
  };
}