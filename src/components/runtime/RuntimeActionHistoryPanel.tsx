import {
  useMemo,
  useState,
} from "react";

import {
  createRuntimeActionHistoryViewModel,
} from "../../runtime-action-history/createRuntimeActionHistoryViewModel";

import type {
  RuntimeActionHistoryEntry,
  RuntimeActionTransition,
} from "../../runtime-action-history/runtimeActionHistoryTypes";

import {
  RuntimeActionHistoryEntryCard,
} from "./RuntimeActionHistoryEntryCard";

import type {
  RuntimeRecommendationPresentation,
} from "../runtimeRecommendationPresentation";

type RuntimeActionHistoryPanelProps = {
  entries:
    RuntimeActionHistoryEntry[];

  transitions:
    RuntimeActionTransition[];

  currentRecommendationPresentation?:
    RuntimeRecommendationPresentation | null;

  activeEntryId:
    string | null;

  onClear:
    () => void;
};

export function RuntimeActionHistoryPanel({
  entries,
  transitions,
  activeEntryId,
  onClear,
}: RuntimeActionHistoryPanelProps) {
  const [
    isExpanded,
    setIsExpanded,
  ] = useState(false);

  const viewModel =
    useMemo(
      () =>
        createRuntimeActionHistoryViewModel({
          entries,
          transitions,
          activeEntryId,
        }),
      [
        entries,
        transitions,
        activeEntryId,
      ]
    );

  if (
    viewModel.totalCount === 0
  ) {
    return null;
  }

  return (
    <section
      className="runtime-action-history-panel"
      aria-labelledby="runtime-action-history-title"
    >
      <div className="runtime-action-history-panel__header">
        <div>
          <div className="runtime-action-history-panel__eyebrow">
            RUNTIME ACTION HISTORY
          </div>

          <h2
            id="runtime-action-history-title"
            className="runtime-action-history-panel__title"
          >
            Recommendation history
          </h2>

          <p className="runtime-action-history-panel__summary">
            Runtime has recorded{" "}
            {viewModel.totalCount} recommendation
            {viewModel.totalCount === 1
              ? ""
              : "s"}{" "}
            for this project.
          </p>
        </div>

        <button
          type="button"
          className="runtime-action-history-panel__toggle"
          onClick={() =>
            setIsExpanded(
              (current) =>
                !current
            )
          }
          aria-expanded={
            isExpanded
          }
        >
          <span
            aria-hidden="true"
            className="runtime-action-history-panel__toggle-icon"
          >
            {isExpanded
              ? "▾"
              : "▸"}
          </span>

          <span>
            {isExpanded
              ? "Hide recommendation history"
              : "Show recommendation history"}
          </span>
        </button>
      </div>

      <div className="runtime-action-history-panel__stats">
        {viewModel.activeEntryId !== null ? (
          <span>
            Current
          </span>
        ) : null}

        <span>
          Completed{" "}
          {viewModel.completedCount}
        </span>

        <span>
          Repeated{" "}
          {viewModel.repeatedCount}
        </span>
      </div>

      {isExpanded ? (
        <>
          <div className="runtime-action-history-list">
            {viewModel.entries.map(
              (entry) => (
                <RuntimeActionHistoryEntryCard
                  key={entry.id}
                  entry={entry}
                />
              )
            )}
          </div>

          <div className="runtime-action-history-panel__footer">
            <button
              type="button"
              className="runtime-action-history-panel__clear"
              onClick={onClear}
            >
              Clear past history
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}