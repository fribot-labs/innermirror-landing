import type { User } from "@supabase/supabase-js";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { deriveRuntimePredictivePresentation } from "../components/deriveRuntimePredictivePresentation";
import { deriveRuntimeRecommendationPresentation } from "../components/deriveRuntimeRecommendationPresentation";
import { GitHubLoginEntry } from "../components/github/GitHubLoginEntry";
import { GitHubSnapshotPanel } from "../components/github/GitHubSnapshotPanel";
import { RepositorySelector } from "../components/github/RepositorySelector";

import { ProjectReflectionPanel } from "../components/project/ProjectReflectionPanel";
import { ProjectStartPanel } from "../components/project/ProjectStartPanel";
import { ProjectSummaryPanel } from "../components/project/ProjectSummaryPanel";
import { ReflectionHistoryPanel } from "../components/project/ReflectionHistoryPanel";

import { RuntimeNextActionPanel } from "../components/runtime-next-action/RuntimeNextActionPanel";
import { IdentityDriftSurface } from "../components/runtime/IdentityDriftSurface";
import { ImmediateReflectionFeedback } from "../components/runtime/ImmediateReflectionFeedback";
import { LocalReflectionList } from "../components/runtime/LocalReflectionList";
import { LocalReflectionPersistenceNotice } from "../components/runtime/LocalReflectionPersistenceNotice";
import { LongGapRecoverySurface } from "../components/runtime/LongGapRecoverySurface";
import { OfflineSyncRecoveryPanel } from "../components/runtime/OfflineSyncRecoveryPanel";
import { ProjectAnalysisMemoryTimeline } from "../components/runtime/ProjectAnalysisMemoryTimeline";
import { ProjectFlowSummaryPanel } from "../components/runtime/ProjectFlowSummaryPanel";
import { ReflectionContinuitySurface } from "../components/runtime/ReflectionContinuitySurface";
import { ReturningThemeSurface } from "../components/runtime/ReturningThemeSurface";
import { RuntimeActionHistoryPanel } from "../components/runtime/RuntimeActionHistoryPanel";
import { RuntimeBoundaryStatusBanner } from "../components/runtime/RuntimeBoundaryStatusBanner";
import { RuntimeFailureRecoveryNotice } from "../components/runtime/RuntimeFailureRecoveryNotice";
import { RuntimeFallbackModeNotice } from "../components/runtime/RuntimeFallbackModeNotice";
import { RuntimeMemoryTimeline } from "../components/runtime/RuntimeMemoryTimeline";
import { RuntimeStreamingMergeSurface } from "../components/runtime/RuntimeStreamingMergeSurface";
import { RuntimeV2ResultPanel } from "../components/runtime/RuntimeV2ResultPanel";
import { RuntimeErrorState } from "../components/RuntimeErrorState";
import { RuntimeLoadingState } from "../components/RuntimeLoadingState";
import { RuntimePredictionPanel } from "../components/RuntimePredictionPanel";
import { RuntimeReflectionResultView } from "../components/RuntimeReflectionResult";
import {
  createRuntimeGitHubSession,
} from "../github/createRuntimeGitHubSession";
import type {
  RuntimeGitHubSessionState,
} from "../github/runtimeGitHubSessionTypes";
import { useGitHubRepositories } from "../github/useGitHubRepositories";
import { useGitHubSnapshot } from "../github/useGitHubSnapshot";

import {
  createRuntimeProjectIdentity,
} from "../project-identity/createRuntimeProjectIdentity";
import {
  createCanonicalProjectState,
} from "../project-state/createCanonicalProjectState";

import {
  clearRuntimeProjectIdentity,
  loadRuntimeProjectIdentity,
  saveRuntimeProjectIdentity,
} from "../project-identity/runtimeProjectIdentityStore";

import { supabaseClient } from "../lib/supabaseClient";
import { resolveProjectActionGuidance } from "../project-actions/resolveProjectActionGuidance";
import {
  createRuntimeProjectContext,
} from "../project-context/createRuntimeProjectContext";
import {
  clearRuntimeProjectContext,
  loadRuntimeProjectContext,
  saveRuntimeProjectContext,
} from "../project-context/runtimeProjectContextStore";
import type {
  RuntimeProjectContext,
} from "../project-context/runtimeProjectContextTypes";
import type {
  RuntimeProjectIdentity,
} from "../project-identity/runtimeProjectIdentityTypes";

import {
  loadRepositoryMetadata,
  RepositoryMetadataLoadError,
} from "../project-metadata-loader/loadRepositoryMetadata";
import {
  createRepositoryDerivedMetadata,
} from "../project-metadata/createRepositoryDerivedMetadata";

import {
  recordProjectFocusUpdatedEvent,
  recordProjectStartedEvent,
} from "../project-actions/projectLifecycleEvents";
import {
  createProjectLifecycleHistory,
  type ProjectLifecycleHistoryEntry,
} from "../project-actions/projectLifecycleHistory";

import {
  createCanonicalProjectHistorySnapshot,
} from "../project-history/createCanonicalProjectHistorySnapshot";

import {
  createProjectHistoryRuntimeInput,
} from "../project-history-runtime/createProjectHistoryRuntimeInput";
import {
  createRuntimeProjectIntelligence,
} from "../project-intelligence/createRuntimeProjectIntelligence";
import {
  clearRuntimeProjectMetadata,
  loadRuntimeProjectMetadata,
  saveRuntimeProjectMetadata,
} from "../project-metadata/runtimeProjectMetadataStore";
import {
  createRuntimeProjectIntelligenceAdapter,
} from "../runtime-project-intelligence/createRuntimeProjectIntelligenceAdapter";

import {
  ProjectIntelligencePanel,
} from "../components/project/ProjectIntelligencePanel";
import {
  RepositoryMetadataPanel,
} from "../components/project/RepositoryMetadataPanel";
import type {
  RuntimeProjectMetadata,
} from "../project-metadata/runtimeProjectMetadataTypes";

import {
  InnerMirrorBrand,
} from "../components/branding/InnerMirrorBrand";
import {
  ServiceEntryNavigation,
} from "../components/service-entry/ServiceEntryNavigation";
import {
  TrustLayer,
} from "../components/trust/TrustLayer";
import {
  listProjectEvents,
} from "../lib/projectEventPersistence";
import {
  ensureProjectForRepository,
  markProjectStarted,
  updateProjectCurrentFocus,
  type ProjectRecord,
} from "../lib/projectPersistence";

import {
  createReflection,
  listReflectionsByProject,
  listReflectionsForCurrentUser,
  type ReflectionRecord,
} from "../lib/reflectionPersistence";

import { useRuntimeActionHistory } from "../runtime-action-history/useRuntimeActionHistory";
import { analyzeRuntimeV2 } from "../runtime-adapter/analyzeRuntimeV2";
import { createRuntimeContractV2Payload } from "../runtime-adapter/createRuntimeContractV2Payload";
import { createServerRuntimeMemoryTimelineData } from "../runtime-adapter/createServerRuntimeMemoryTimelineData";
import { resolveRuntimeFailureRecovery } from "../runtime-adapter/resolveRuntimeFailureRecovery";
import { resolveRuntimeUxMode } from "../runtime-adapter/resolveRuntimeUxMode";
import { useRuntimeBoundaryHealth } from "../runtime-adapter/useRuntimeBoundaryHealth";
import { useRuntimeFailureRecoveryDismiss } from "../runtime-adapter/useRuntimeFailureRecoveryDismiss";
import { useRuntimeReflection } from "../runtime-adapter/useRuntimeReflection";
import { useRuntimeStreamingMerge } from "../runtime-adapter/useRuntimeStreamingMerge";
import { useServerRuntimeMemoryTimeline } from "../runtime-adapter/useServerRuntimeMemoryTimeline";
import { useLocalReflectionPersistence } from "../runtime-local/useLocalReflectionPersistence";
import { useOfflineSyncRecovery } from "../runtime-local/useOfflineSyncRecovery";
import { useProjectAnalysisMemory } from "../runtime-local/useProjectAnalysisMemory";
import { createRuntimeNextAction } from "../runtime-next-action/createRuntimeNextAction";
import { createRuntimeNextActionRuntimeSignals } from "../runtime-next-action/createRuntimeNextActionRuntimeSignals";
import type { RuntimeNextActionTarget } from "../runtime-next-action/runtimeNextActionTypes";
import { createIdentityDriftSurfaceData } from "../runtime/createIdentityDriftSurfaceData";
import { createLongGapRecoverySurfaceData } from "../runtime/createLongGapRecoverySurfaceData";
import { createProjectContinuityInsight } from "../runtime/createProjectContinuityInsight";
import { createProjectPatternInsight } from "../runtime/createProjectPatternInsight";
import { mapReturningThemeSurfaceData } from "../runtime/mapReturningThemeSurfaceData";
import { toReflectionContinuitySurfaceData } from "../runtime/toReflectionContinuitySurfaceData";
import "../styles/runtime-history.css";
import "../styles/runtime-prediction.css";
import type {
  GitHubConnectionState,
  GitHubRepositorySummary,
} from "../types/githubLearningEntry";
import type {
  GitHubSnapshot,
} from "../types/githubSnapshot";
import {
  addPblReflection,
  countPblReflections,
  createPblProject,
  getCurrentPblMilestone,
  updatePblProjectFocus,
  type PblProject,
} from "../types/pblProject";
import type { RuntimeContractV2Response } from "../types/runtimeContractV2";

type ProjectActionState =
  | "idle"
  | "saving-thought"
  | "analyzing-github"
  | "analyzing-combined";

export function App() {
  const projectFocusSectionRef =
    useRef<HTMLDivElement | null>(null);

  const githubEntrySectionRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const reflectionSectionRef =
    useRef<HTMLDivElement | null>(null);

  const runtimeDetailsSectionRef =
    useRef<HTMLDivElement | null>(null);

  const projectTimelineSectionRef =
    useRef<HTMLDivElement | null>(null);

  const runtimeGitHubBridgeStateRef =
    useRef<"idle" | "creating" | "ready">("idle");

  const [content, setContent] = useState("");

  const [
    reflectionPersistenceError,
    setReflectionPersistenceError,
  ] = useState<string | null>(null);

  const [
    persistedReflections,
    setPersistedReflections,
  ] = useState<ReflectionRecord[]>([]);

  const [
    reflectionHistoryError,
    setReflectionHistoryError,
  ] = useState<string | null>(null);

  const [
    isLoadingReflectionHistory,
    setIsLoadingReflectionHistory,
  ] = useState(false);

  const [githubConnectionState, setGithubConnectionState] =
    useState<GitHubConnectionState>("disconnected");

  const [authenticatedUser, setAuthenticatedUser] =
    useState<User | null>(null);

  const [authMessage, setAuthMessage] =
    useState<string | null>(null);

  const [
    githubSessionId,
    setGithubSessionId,
  ] = useState<string | null>(() =>
    window.localStorage.getItem(
      "innermirror.githubSessionId"
    )
  );

  const [
    runtimeGitHubSessionState,
    setRuntimeGitHubSessionState,
  ] = useState<RuntimeGitHubSessionState>(
    githubSessionId ? "ready" : "idle"
  );

  const {
    repositories,
    isLoading: isLoadingRepositories,
    error: repositoryError,
  } = useGitHubRepositories({
    enabled:
      githubConnectionState ===
        "connected" &&
      runtimeGitHubSessionState ===
        "ready" &&
      githubSessionId !== null,

    githubSessionId,
  });

  const availableRepositories = useMemo(
    () =>
      mergeGitHubRepositories(
        repositories
      ),
    [repositories]
  );

  const repositoryAvailabilityMessage =
    githubConnectionState !==
      "connected"
      ? "Connect GitHub first. Repository selection will be available after GitHub is connected."
      : runtimeGitHubSessionState ===
          "unavailable"
        ? "Start the private Runtime, then reconnect Runtime to load repositories."
        : runtimeGitHubSessionState ===
            "expired"
          ? "Reconnect Runtime to load repositories."
          : runtimeGitHubSessionState ===
              "error"
            ? "Restore Runtime authorization to load repositories."
            : runtimeGitHubSessionState ===
                "creating"
              ? "Runtime repository access is being restored."
              : "No eligible public repositories were found.";

  const [selectedRepository, setSelectedRepository] =
    useState<GitHubRepositorySummary | null>(null);

  const [
    projectPersistenceError,
    setProjectPersistenceError,
  ] = useState<string | null>(
    null
  );

  const [
    runtimeProjectIdentity,
    setRuntimeProjectIdentity,
  ] = useState<
    RuntimeProjectIdentity | null
  >(() =>
    loadRuntimeProjectIdentity()
  );

  const [
    runtimeProjectMetadata,
    setRuntimeProjectMetadata,
  ] = useState<
    RuntimeProjectMetadata | null
  >(() =>
    loadRuntimeProjectMetadata()
  );

  const [
    runtimeProjectContext,
    setRuntimeProjectContext,
  ] = useState<
    RuntimeProjectContext | null
  >(() =>
    loadRuntimeProjectContext()
  );

  const [currentStep, setCurrentStep] = useState("");

  const [
    projectFocusSaveStatus,
    setProjectFocusSaveStatus,
  ] = useState<
    "idle" |
    "saved"
  >("idle");

  const [
    projectLifecycleHistory,
    setProjectLifecycleHistory,
  ] = useState<
    ProjectLifecycleHistoryEntry[]
  >([]);

  const [
    canonicalProjectRecord,
    setCanonicalProjectRecord,
  ] = useState<ProjectRecord | null>(
    null
  );

  const runtimeProjectIntelligence =
    useMemo(
      () => {
        if (
          runtimeProjectMetadata ===
            null ||
          runtimeProjectContext ===
            null
        ) {
          return null;
        }

        if (
          runtimeProjectMetadata.projectId !==
          runtimeProjectContext.projectId
        ) {
          return null;
        }

        return createRuntimeProjectIntelligence({
          metadata:
            runtimeProjectMetadata,

          context:
            runtimeProjectContext,

          currentFocus:
            currentStep,
        });
      },
      [
        runtimeProjectMetadata,
        runtimeProjectContext,
        currentStep,
      ]
    );

  const runtimeProjectRecommendationInput =
    useMemo(
      () => {
        if (
          runtimeProjectIntelligence ===
          null
        ) {
          return null;
        }

        return createRuntimeProjectIntelligenceAdapter({
          intelligence:
            runtimeProjectIntelligence,
        });
      },
      [
        runtimeProjectIntelligence,
      ]
    );

  const runtimeCanonicalProjectHistory =
    useMemo(
      () => {
        if (
          canonicalProjectRecord ===
          null
        ) {
          return null;
        }

        const canonicalProjectId =
          canonicalProjectRecord.id.trim();

        const canonicalReflections =
          persistedReflections.filter(
            (reflection) =>
              reflection.projectId ===
              canonicalProjectId
          );

        const canonicalLifecycleHistory =
          projectLifecycleHistory.filter(
            (entry) =>
              entry.projectId ===
              canonicalProjectId
          );

        const snapshot =
          createCanonicalProjectHistorySnapshot({
            project:
              canonicalProjectRecord,

            reflections:
              canonicalReflections,

            lifecycleHistory:
              canonicalLifecycleHistory,
          });

        return createProjectHistoryRuntimeInput({
          snapshot,
        });
      },
      [
        canonicalProjectRecord,
        persistedReflections,
        projectLifecycleHistory,
      ]
    );

  const [activeProject, setActiveProject] =
    useState<PblProject | null>(null);

  const [
    isCanonicalProjectStarted,
    setIsCanonicalProjectStarted,
  ] = useState(
    false
  );

  const [runtimeV2Response, setRuntimeV2Response] =
    useState<RuntimeContractV2Response | null>(null);

  const [latestCapturedSnapshot, setLatestCapturedSnapshot] =
    useState<GitHubSnapshot | null>(null);

  const [projectActionState, setProjectActionState] =
    useState<ProjectActionState>("idle");

  const {
    snapshotState,
    captureSnapshot,
    resetSnapshot,
  } = useGitHubSnapshot();

  const {
    isLoading,
    result,
    error,
    isOptimistic,
    immediateFeedback,
    submitReflection,
  } = useRuntimeReflection();

  const isSavingThought =
    projectActionState === "saving-thought";

  const isGitHubAnalyzing =
    projectActionState === "analyzing-github";

  const isCombinedAnalyzing =
    projectActionState === "analyzing-combined";

  const isAnyProjectActionRunning =
    projectActionState !== "idle" || isLoading;

  const projectActionGuidance =
    resolveProjectActionGuidance({
      hasRepository:
        selectedRepository !== null,

      hasProject:
        isCanonicalProjectStarted,

      hasCurrentFocus:
        currentStep.trim().length > 0,

      hasReflectionDraft:
        content.trim().length > 0,

      hasProjectSnapshot:
        snapshotState.status === "ready",

      isActionRunning:
        isAnyProjectActionRunning,
    });

  const applyCanonicalProjectState =
    (
      project:
        ProjectRecord
    ): void => {
      const canonicalState =
        createCanonicalProjectState(
          project
        );

      setCanonicalProjectRecord(
        project
      );

      setIsCanonicalProjectStarted(
        canonicalState.isStarted
      );

      setCurrentStep(
        canonicalState.currentFocus
      );
    };

  const loadCanonicalProjectLifecycleHistory =
    async (
      projectId: string
    ): Promise<void> => {
      try {
        const events =
          await listProjectEvents(
            projectId
          );

        const history =
          createProjectLifecycleHistory(
            events
          );

        setProjectLifecycleHistory(
          history
        );
      } catch (error) {
        console.error(
          "Unable to load canonical Project lifecycle history.",
          error
        );

        setProjectLifecycleHistory(
          []
        );
      }
    };

  const handleExistingProjectSelect =
    () => {
      githubEntrySectionRef.current
        ?.scrollIntoView({
          behavior:
            "smooth",

          block:
            "start",
        });
    };

  const {
    isMerging,
    events: streamingMergeEvents,
    startMerge,
    resetMerge,
  } = useRuntimeStreamingMerge();

  const {
    isChecking: isCheckingBoundary,
    health: runtimeBoundaryHealth,
    error: runtimeBoundaryHealthError,
    checkHealth,
  } = useRuntimeBoundaryHealth();

  const runtimeUxMode =
    resolveRuntimeUxMode({
      health: runtimeBoundaryHealth,
      isChecking: isCheckingBoundary,
    });

  useEffect(() => {
    if (
      runtimeProjectIdentity === null ||
      selectedRepository !== null ||
      availableRepositories.length === 0
    ) {
      return;
    }

    const restoredRepository =
      availableRepositories.find(
        (repository) =>
          repository.repositoryId ===
          runtimeProjectIdentity
            .repository
            .repositoryId
      );

    if (restoredRepository === undefined) {
      return;
    }

    let isCancelled =
      false;

    const restoreRepository =
      async () => {
        try {
          const canonicalProject =
            await ensureProjectForRepository(
              restoredRepository
            );

          if (isCancelled) {
            return;
          }

          applyCanonicalProjectState(
            canonicalProject
          );

          await loadCanonicalProjectLifecycleHistory(
            canonicalProject.id
          );

          if (isCancelled) {
            return;
          }

          setSelectedRepository(
            restoredRepository
          );
        } catch (error) {
          if (isCancelled) {
            return;
          }

          console.error(
            "Unable to restore canonical Project lifecycle state.",
            error
          );

          setProjectPersistenceError(
            "Unable to restore the InnerMirror project record."
          );
        }
      };

    void restoreRepository();

    return () => {
      isCancelled =
        true;
    };
  }, [
    runtimeProjectIdentity,
    selectedRepository,
    availableRepositories,
  ]);

  useEffect(() => {
    const runtimeIsUnavailable =
      runtimeBoundaryHealth?.status ===
        "unavailable" ||
      runtimeBoundaryHealthError !== null;

    if (!runtimeIsUnavailable) {
      return;
    }

    if (
      githubConnectionState !==
        "connected" ||
      authenticatedUser === null
    ) {
      return;
    }

    setRuntimeGitHubSessionState(
      "unavailable"
    );

    setAuthMessage(null);
  }, [
    runtimeBoundaryHealth,
    runtimeBoundaryHealthError,
    githubConnectionState,
    authenticatedUser,
  ]);

  const serverMemoryTimeline = useServerRuntimeMemoryTimeline({
    enabled: runtimeUxMode.canUseMemoryTimeline,
    limit: 5,
  });

  const runtimeMemoryTimelineData = createServerRuntimeMemoryTimelineData(
    serverMemoryTimeline.timeline
  );

  const isLocalOnlyMode = runtimeUxMode.mode === "local-only";

  const {
    snapshot: localReflectionSnapshot,
    saveLocalReflection,
    clearLocalReflectionMemory,
    refreshLocalReflectionMemory,
  } = useLocalReflectionPersistence();

  const projectAnalysisMemory = useProjectAnalysisMemory();

  const projectContinuityInsight =
    createProjectContinuityInsight(projectAnalysisMemory.events);

  const projectPatternInsight =
    createProjectPatternInsight(projectAnalysisMemory.events);

  const offlineSyncRecovery = useOfflineSyncRecovery({
    runtimeUxMode,
    onLocalSnapshotChanged: refreshLocalReflectionMemory,
  });

  const clearRuntimeGitHubSession = (
    nextState: RuntimeGitHubSessionState =
      "idle"
  ) => {
    window.localStorage.removeItem(
      "innermirror.githubSessionId"
    );

    runtimeGitHubBridgeStateRef.current =
      "idle";

    setGithubSessionId(null);

    setRuntimeGitHubSessionState(
      nextState
    );
  };

  const createOrRecoverRuntimeGitHubSession =
    async (
      providerToken: string
    ): Promise<boolean> => {
      const normalizedProviderToken =
        providerToken.trim();

      if (
        normalizedProviderToken.length === 0
      ) {
        clearRuntimeGitHubSession(
          "error"
        );

        return false;
      }

      if (
        runtimeGitHubBridgeStateRef.current ===
        "creating"
      ) {
        return false;
      }

      runtimeGitHubBridgeStateRef.current =
        "creating";

      setRuntimeGitHubSessionState(
        "creating"
      );

      try {
        const createdSessionId =
          await createRuntimeGitHubSession(
            normalizedProviderToken
          );

        window.localStorage.setItem(
          "innermirror.githubSessionId",
          createdSessionId
        );

        setGithubSessionId(
          createdSessionId
        );

        runtimeGitHubBridgeStateRef.current =
          "ready";

        setRuntimeGitHubSessionState(
          "ready"
        );

        return true;
      } catch (error) {
        clearRuntimeGitHubSession(
          "error"
        );

        console.error(
          "Unable to establish Runtime GitHub session.",
          error
        );

        return false;
      }
    };

  useEffect(() => {
    let isMounted = true;

    const establishGitHubConnection = async (
      session: Awaited<
        ReturnType<
          typeof supabaseClient.auth.getSession
        >
      >["data"]["session"]
    ) => {

      if (!isMounted) {
        return;
      }

      if (session === null) {

        clearRuntimeGitHubSession();
        setAuthenticatedUser(null);
        setGithubConnectionState("disconnected");
        setAuthMessage(null);

        return;
      }

      setAuthenticatedUser(session.user);

      const existingRuntimeSessionId =
        window.localStorage.getItem(
          "innermirror.githubSessionId"
        );

      if (
        existingRuntimeSessionId !== null &&
        existingRuntimeSessionId.trim().length > 0
      ) {
        const normalizedRuntimeSessionId =
          existingRuntimeSessionId.trim();

        runtimeGitHubBridgeStateRef.current =
          "ready";

        setGithubSessionId(
          normalizedRuntimeSessionId
        );

        setRuntimeGitHubSessionState(
          "ready"
        );

        setGithubConnectionState(
          "connected"
        );

        setAuthMessage(null);

        return;
      }

      const providerToken =
        session.provider_token;

      if (
        typeof providerToken !== "string" ||
        providerToken.trim().length === 0
      ) {
        clearRuntimeGitHubSession(
          "error"
        );

        setGithubConnectionState(
          "connected"
        );

        setAuthMessage(
          "GitHub is connected, but Runtime authorization must be renewed."
        );

        return;
      }

      const runtimeSessionReady =
        await createOrRecoverRuntimeGitHubSession(
          providerToken
        );

      if (!isMounted) {
        return;
      }

      setGithubConnectionState(
        "connected"
      );

      if (!runtimeSessionReady) {
        setAuthMessage(
          "Unable to establish the Runtime GitHub session."
        );

        return;
      }

      setAuthMessage(null);
    };

    const restoreSession = async () => {
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.getSession();

      if (error) {
        console.error(
          "Unable to restore Supabase session.",
          error
        );

        if (isMounted) {
          clearRuntimeGitHubSession();
          setGithubConnectionState("error");
          setAuthenticatedUser(null);
          setAuthMessage(
            "Unable to restore the GitHub session."
          );
        }

        return;
      }

      await establishGitHubConnection(session);
    };

    void restoreSession();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        void establishGitHubConnection(
          session
        );
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    void refreshPersistedReflections();
  }, [
    authenticatedUser,
    selectedRepository,
  ]);

  useEffect(() => {
    if (repositoryError === null) {
      return;
    }

    if (!repositoryError.includes("GitHub session expired")) {
      return;
    }

    clearRuntimeGitHubSession(
      "expired"
    );

    setGithubConnectionState(
      "connected"
    );

    setAuthMessage(
      "The Runtime GitHub session expired. Reconnect Runtime to continue."
    );

    setSelectedRepository(null);
    setProjectPersistenceError(null);
    setActiveProject(null);
    setCanonicalProjectRecord(null);
    setIsCanonicalProjectStarted(false);

    setProjectLifecycleHistory([]);

    setLatestCapturedSnapshot(null);
    resetSnapshot();
  }, [repositoryError, resetSnapshot]);

  useEffect(() => {
    if (
      runtimeUxMode.canUseMemoryTimeline &&
      offlineSyncRecovery.lastSyncedAt !== null
    ) {
      void serverMemoryTimeline.refresh();
    }
  }, [
    runtimeUxMode.canUseMemoryTimeline,
    offlineSyncRecovery.lastSyncedAt,
    serverMemoryTimeline.refresh,
  ]);

  const runtimeFailureRecovery = resolveRuntimeFailureRecovery({
    runtimeUxMode,
    runtimeBoundaryHealth,
    runtimeError: error,
    timelineError: serverMemoryTimeline.error,
    isStreamingMergeActive: isMerging,
    localPendingCount: localReflectionSnapshot.pendingCount,
  });

  const runtimeFailureRecoveryDismiss = useRuntimeFailureRecoveryDismiss({
    recovery: runtimeFailureRecovery,
    isRuntimeHealthy: runtimeUxMode.mode === "full-runtime",
  });

  const continuitySurfaceData = toReflectionContinuitySurfaceData(result);

  const returningThemeSurfaceData = mapReturningThemeSurfaceData(result);

  const longGapRecoverySurfaceData = createLongGapRecoverySurfaceData(result);

  const identityDriftSurfaceData = createIdentityDriftSurfaceData(result);

  const recommendationPresentation =
    useMemo(
      () =>
        deriveRuntimeRecommendationPresentation(
          result
        ),
      [result]
    );

  const reflectionPredictiveResult =
    result
      ?.recommendationIntegration
      ?.predictiveIntelligenceResult ??
    null;

  const runtimePredictivePresentation =
    useMemo(
      () =>
        deriveRuntimePredictivePresentation(
          result
            ?.recommendationIntegration
            ?.predictiveIntelligenceResult ??
          null
        ),
      [
        result
          ?.recommendationIntegration
          ?.predictiveIntelligenceResult,
      ]
    );

  const handleConnectGitHub = async () => {
    clearRuntimeGitHubSession(
      "idle"
    );

    setGithubConnectionState(
      "connecting"
    );

    setAuthMessage(null);

    try {
      const { error } =
        await supabaseClient.auth.signInWithOAuth({
          provider: "github",
          options: {
            redirectTo: `${window.location.origin}/`,
            scopes: "read:org",
          },
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(
        "Unable to start GitHub authentication.",
        error
      );

      setGithubConnectionState("error");

      setAuthMessage(
        error instanceof Error
          ? error.message
          : "Unable to connect GitHub. Please try again."
      );
    }
  };

  const handleReconnectRuntime =
    async () => {
      setAuthMessage(null);

      const {
        data: { session },
        error,
      } =
        await supabaseClient.auth.getSession();

      if (error || session === null) {
        setRuntimeGitHubSessionState(
          "error"
        );

        setAuthMessage(
          "The GitHub login session is unavailable. Connect GitHub again."
        );

        return;
      }

      const providerToken =
        session.provider_token;

      if (
        typeof providerToken !== "string" ||
        providerToken.trim().length === 0
      ) {
        setRuntimeGitHubSessionState(
          "error"
        );

        setAuthMessage(
          "GitHub authorization must be renewed before Runtime can reconnect."
        );

        return;
      }

      const restored =
        await createOrRecoverRuntimeGitHubSession(
          providerToken
        );

      if (!restored) {
        setAuthMessage(
          "Unable to reconnect the Runtime GitHub session."
        );

        return;
      }

      setAuthMessage(
        "Runtime GitHub session reconnected."
      );
    };

  const handleRenewGitHubAuthorization =
    async () => {
      clearRuntimeGitHubSession(
        "creating"
      );

      setAuthMessage(null);

      const { error } =
        await supabaseClient.auth.signInWithOAuth({
          provider: "github",
          options: {
            redirectTo:
              `${window.location.origin}/`,

            scopes:
              "read:user user:email read:org",

            queryParams: {
              prompt:
                "select_account",
            },
          },
        });

      if (error) {
        setRuntimeGitHubSessionState(
          "error"
        );

        setAuthMessage(
          error.message
        );
      }
    };

  const handleSignOut = async () => {
    setGithubConnectionState("connecting");
    setAuthMessage(null);

    try {
      const { error } =
        await supabaseClient.auth.signOut();

      if (error) {
        throw error;
      }

      clearRuntimeGitHubSession(
        "idle"
      );

      setAuthenticatedUser(null);
      setGithubConnectionState("disconnected");
      setSelectedRepository(null);

      setProjectPersistenceError(null);

      setPersistedReflections([]);
      setReflectionHistoryError(null);
      setIsLoadingReflectionHistory(false);

      clearRuntimeProjectIdentity();

      setRuntimeProjectIdentity(
        null
      );

      clearRuntimeProjectMetadata();

      setRuntimeProjectMetadata(
        null
      );

      clearRuntimeProjectContext();

      setRuntimeProjectContext(
        null
      );

      setActiveProject(null);
      setCanonicalProjectRecord(null);
      setIsCanonicalProjectStarted(false);

      setProjectLifecycleHistory([]);

      setCurrentStep("");
      setLatestCapturedSnapshot(null);
      setRuntimeV2Response(null);
      resetSnapshot();
      resetMerge();
    } catch (error) {
      console.error(
        "Unable to sign out from GitHub.",
        error
      );

      setGithubConnectionState("error");

      setAuthMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign out. Please try again."
      );
    }
  };

  const handleSelectRepository = async (
    repository: GitHubRepositorySummary
  ) => {
    const isSameRepository =
      selectedRepository?.repositoryId ===
      repository.repositoryId;

    if (isSameRepository) {
      return;
    }

    setPersistedReflections([]);

    setProjectLifecycleHistory([]);

    setCanonicalProjectRecord(
      null
    );

    setIsCanonicalProjectStarted(
      false
    );

    setProjectPersistenceError(
      null
    );

    try {
      const canonicalProject =
        await ensureProjectForRepository(
          repository
        );

      applyCanonicalProjectState(
        canonicalProject
      );

      await loadCanonicalProjectLifecycleHistory(
        canonicalProject.id
      );
    } catch (error) {
      console.error(
        "Unable to persist canonical project.",
        error
      );

      setProjectPersistenceError(
        "Unable to establish the InnerMirror project record."
      );

      return;
    }

    const nextRuntimeProjectIdentity =
      createRuntimeProjectIdentity({
        repository,
      });

    const nextRuntimeProjectContext =
      createRuntimeProjectContext({
        projectIdentity:
          nextRuntimeProjectIdentity,
      });

    setSelectedRepository(
      repository
    );

    setRuntimeProjectIdentity(
      nextRuntimeProjectIdentity
    );

    saveRuntimeProjectIdentity(
      nextRuntimeProjectIdentity
    );

    clearRuntimeProjectMetadata();

    let nextRuntimeProjectMetadata =
      createRepositoryDerivedMetadata({
        projectIdentity:
          nextRuntimeProjectIdentity,
      });

    if (
      githubSessionId !==
      null
    ) {
      try {
        const discoveredMetadata =
          await loadRepositoryMetadata({
            githubSessionId,

            projectIdentity:
              nextRuntimeProjectIdentity,
          });

        if (
          discoveredMetadata !==
          null
        ) {
          nextRuntimeProjectMetadata =
            discoveredMetadata;
        }
      } catch (
        error
      ) {
        if (
          error instanceof
          RepositoryMetadataLoadError
        ) {
          console.warn(
            `[Repository Metadata] ${error.message} Repository-derived metadata will be used.`
          );
        } else {
          console.warn(
            "[Repository Metadata] Unexpected manifest discovery failure. Repository-derived metadata will be used."
          );
        }
      }
    }

    setRuntimeProjectMetadata(
      nextRuntimeProjectMetadata
    );

    saveRuntimeProjectMetadata(
      nextRuntimeProjectMetadata
    );

    setRuntimeProjectContext(
      nextRuntimeProjectContext
    );

    saveRuntimeProjectContext(
      nextRuntimeProjectContext
    );

    setActiveProject(null);
    resetSnapshot();
    setLatestCapturedSnapshot(null);
    setRuntimeV2Response(null);
    resetMerge();
  };

  const handleChangeCurrentStep = (
    value: string
  ) => {
    setCurrentStep(
      value
    );

    setProjectFocusSaveStatus(
      "idle"
    );
  };

  const resolvedCurrentStep =
    currentStep.trim().length > 0
      ? currentStep.trim()
      : "Explore this project";

  const handleApplyProjectFocus = async () => {
    if (selectedRepository === null) {
      return;
    }

    const trimmedCurrentStep =
      currentStep.trim();

    if (trimmedCurrentStep.length === 0) {
      return;
    }

    setProjectPersistenceError(null);

    setProjectFocusSaveStatus(
      "idle"
    );

    let canonicalProject;

    try {
      canonicalProject =
        await ensureProjectForRepository(
          selectedRepository
        );
    } catch (error) {
      console.error(
        "Unable to resolve canonical Project for lifecycle event.",
        error
      );

      setProjectPersistenceError(
        "Unable to establish the InnerMirror project record."
      );

      return;
    }

    const previousFocus =
      canonicalProject.currentFocus;

    const wasLocalProjectMissing =
      activeProject === null;

    const workingProject =
      activeProject ??
      createPblProject({
        name:
          selectedRepository.name,

        repository: {
          provider:
            "github",

          owner:
            selectedRepository.owner,

          name:
            selectedRepository.name,

          defaultBranch:
            selectedRepository.defaultBranch,
        },

        currentStep:
          trimmedCurrentStep,
      });

    let startResult;

    try {
      startResult =
        await markProjectStarted(
          canonicalProject.id
        );
    } catch (error) {
      console.error(
        "Unable to persist canonical Project start state.",
        error
      );

      setProjectPersistenceError(
        "Unable to persist the InnerMirror project start state."
      );

      return;
    }

    if (startResult.didStart) {
      let focusedProject;

      try {
        focusedProject =
          await updateProjectCurrentFocus({
            projectId:
              startResult.project.id,

            currentFocus:
              trimmedCurrentStep,
          });
      } catch (error) {
        console.error(
          "Unable to persist the initial canonical Project focus.",
          error
        );

        setProjectPersistenceError(
          "Unable to persist the InnerMirror project focus."
        );

        return;
      }

      applyCanonicalProjectState(
        focusedProject
      );

      if (wasLocalProjectMissing) {
        setActiveProject(
          workingProject
        );

        resetSnapshot();

        setLatestCapturedSnapshot(
          null
        );

        setRuntimeV2Response(
          null
        );
      } else {
        const updatedProject =
          updatePblProjectFocus({
            project:
              workingProject,

            currentStep:
              trimmedCurrentStep,
          });

        setActiveProject(
          updatedProject
        );
      }

      try {
        await recordProjectStartedEvent({
          projectId:
            focusedProject.id,

          wasAlreadyStarted:
            false,

          focus:
            focusedProject.currentFocus,
        });

        await loadCanonicalProjectLifecycleHistory(
          focusedProject.id
        );
      } catch (error) {
        console.error(
          "Unable to persist project_started lifecycle event.",
          error
        );
      }

      return;
    }

    const normalizedPreviousFocus =
      previousFocus?.trim() ??
      null;

    if (
      normalizedPreviousFocus ===
      trimmedCurrentStep
    ) {
      if (wasLocalProjectMissing) {
        setActiveProject(
          workingProject
        );

        resetSnapshot();

        setLatestCapturedSnapshot(
          null
        );

        setRuntimeV2Response(
          null
        );
      }

      return;
    }

    let focusedProject;

    try {
      focusedProject =
        await updateProjectCurrentFocus({
          projectId:
            canonicalProject.id,

          currentFocus:
            trimmedCurrentStep,
        });
    } catch (error) {
      console.error(
        "Unable to persist canonical Project focus update.",
        error
      );

      setProjectPersistenceError(
        "Unable to persist the InnerMirror project focus."
      );

      return;
    }

    applyCanonicalProjectState(
      focusedProject
    );

    const updatedProject =
      updatePblProjectFocus({
        project:
          workingProject,

        currentStep:
          trimmedCurrentStep,
      });

    setActiveProject(
      updatedProject
    );

    try {
      await recordProjectFocusUpdatedEvent({
        projectId:
          focusedProject.id,

        previousFocus,

        nextFocus:
          focusedProject.currentFocus ??
          trimmedCurrentStep,
      });

      await loadCanonicalProjectLifecycleHistory(
        focusedProject.id
      );
    } catch (error) {
      console.error(
        "Unable to persist focus_updated lifecycle event.",
        error
      );

      return;
    }

    setProjectFocusSaveStatus(
      "saved"
    );

    window.setTimeout(() => {
      setProjectFocusSaveStatus(
        "idle"
      );
    }, 2500);
  };

  const persistReflectionBeforeRuntime =
    async (
      reflectionContent: string
    ): Promise<boolean> => {
      setReflectionPersistenceError(null);

      try {
        let projectId:
          string | null =
          null;

        if (
          selectedRepository !==
          null
        ) {
          const canonicalProject =
            await ensureProjectForRepository(
              selectedRepository
            );

          projectId =
            canonicalProject.id;
        }

        await createReflection({
          projectId,
          content: reflectionContent,
          source: "landing",
        });

        return true;
      } catch (error) {
        console.error(
          "Unable to persist Reflection before Runtime analysis.",
          error
        );

        setReflectionPersistenceError(
          "Unable to save the Reflection. Analysis was not started."
        );

        return false;
      }
    };

  const refreshPersistedReflections =
    async (): Promise<void> => {
      if (
        authenticatedUser ===
        null
      ) {
        setPersistedReflections(
          []
        );

        setReflectionHistoryError(
          null
        );

        setIsLoadingReflectionHistory(
          false
        );

        return;
      }

      setReflectionHistoryError(
        null
      );

      setIsLoadingReflectionHistory(
        true
      );

      try {
        if (
          selectedRepository !==
          null
        ) {
          const canonicalProject =
            await ensureProjectForRepository(
              selectedRepository
            );

          const reflections =
            await listReflectionsByProject(
              canonicalProject.id
            );

          setPersistedReflections(
            reflections
          );

          return;
        }

        const reflections =
          await listReflectionsForCurrentUser(
            10
          );

        setPersistedReflections(
          reflections
        );
      } catch (error) {
        console.error(
          "Unable to load persisted Reflections.",
          error
        );

        setPersistedReflections([]);

        setReflectionHistoryError(
          "Unable to load saved Reflections."
        );
      } finally {
        setIsLoadingReflectionHistory(
          false
        );
      }
    };

  const handleReflect = async () => {
    const trimmedContent = content.trim();

    if (
      trimmedContent.length === 0 ||
      isAnyProjectActionRunning
    ) {
      return;
    }

    setReflectionPersistenceError(null);
    setProjectActionState("saving-thought");

    try {
      resetMerge();

      if (isLocalOnlyMode) {
        saveLocalReflection(trimmedContent);

        if (activeProject !== null) {
          setActiveProject(
            addPblReflection({
              project: activeProject,
              content: trimmedContent,
            })
          );
        }

        setContent("");

        return;
      }

      const persisted =
        await persistReflectionBeforeRuntime(
          trimmedContent
        );

      if (!persisted) {
        return;
      }

      void refreshPersistedReflections();

      if (activeProject !== null) {
        setActiveProject(
          addPblReflection({
            project: activeProject,
            content: trimmedContent,
          })
        );
      }

      setRuntimeV2Response(null);

      try {
        if (activeProject !== null) {
          const payload =
            createRuntimeContractV2Payload({
              reflectionText:
                trimmedContent,

              project: {
                projectId:
                  runtimeProjectIdentity?.projectId ??
                  activeProject.id,

                name:
                  activeProject.name,

                currentStep:
                  resolvedCurrentStep,
              },

              repository: {
                owner:
                  activeProject.repository.owner,

                name:
                  activeProject.repository.name,

                defaultBranch:
                  activeProject.repository.defaultBranch,
              },

              projectRecommendationInput:
                runtimeProjectRecommendationInput ??
                undefined,

              learningContext: {
                currentStep:
                  resolvedCurrentStep,

                learnerLevel:
                  "junior",
              },

              trigger:
                "reflection",
            });

          const runtimeResponse =
            await analyzeRuntimeV2(
              payload
            );

          setRuntimeV2Response(
            runtimeResponse
          );
        }
      } catch (error) {
        console.error(
          "Runtime V2 reflection request failed.",
          error
        );
      }

      await submitReflection(
        trimmedContent
      );

      setContent("");

      window.setTimeout(() => {
        void serverMemoryTimeline.refresh();
      }, 800);

      if (
        runtimeUxMode.canUseStreamingMerge
      ) {
        void startMerge({
          content:
            trimmedContent,
        });
      }
    } finally {
      setProjectActionState("idle");
    }
  };

  const handleGitHubAnalyze = async (
    includeThought: boolean
  ) => {
    const trimmedContent =
      includeThought ? content.trim() : "";

    if (
      activeProject === null ||
      isAnyProjectActionRunning ||
      (includeThought && trimmedContent.length === 0)
    ) {
      return;
    }

    setProjectActionState(
      includeThought
        ? "analyzing-combined"
        : "analyzing-github"
    );

    resetMerge();
    setRuntimeV2Response(null);

    let capturedSnapshot = null;

    try {
      if (includeThought) {
        setReflectionPersistenceError(null);

        const persisted =
          await persistReflectionBeforeRuntime(
            trimmedContent
          );

        if (!persisted) {
          return;
        }

        void refreshPersistedReflections();
      }

      capturedSnapshot =
        await captureSnapshot({
          owner:
            activeProject.repository.owner,

          name:
            activeProject.repository.name,

          defaultBranch:
            activeProject.repository.defaultBranch,
        });

      if (capturedSnapshot === null) {
        return;
      }

      setLatestCapturedSnapshot(
        capturedSnapshot
      );

      if (includeThought) {
        setActiveProject(
          (currentProject) => {
            if (
              currentProject === null
            ) {
              return currentProject;
            }

            return addPblReflection({
              project:
                currentProject,

              content:
                trimmedContent,
            });
          }
        );
      }

      const payload =
        createRuntimeContractV2Payload({
          reflectionText:
            trimmedContent.length > 0
              ? trimmedContent
              : undefined,

          project: {
            projectId:
              runtimeProjectIdentity
                ?.projectId ??
              activeProject.id,

            name:
              activeProject.name,

            currentStep:
              resolvedCurrentStep,
          },

          repository: {
            owner:
              activeProject.repository.owner,

            name:
              activeProject.repository.name,

            defaultBranch:
              activeProject.repository
                .defaultBranch,
          },

          githubSnapshot:
            capturedSnapshot,

          projectRecommendationInput:
            runtimeProjectRecommendationInput ??
            undefined,

          learningContext: {
            currentStep:
              resolvedCurrentStep,

            learnerLevel:
              "junior",
          },

          projectHistory: {
            events:
              projectAnalysisMemory.events
                .slice(0, 5)
                .map((event) => ({
                  source:
                    event.source,

                  title:
                    event.title,

                  summary:
                    event.summary,

                  repositoryName:
                    event.repositoryName,

                  commitCount:
                    event.commitCount,

                  pullRequestCount:
                    event.pullRequestCount,

                  tags:
                    event.tags,

                  createdAt:
                    event.createdAt,
                })),
          },

          trigger:
            trimmedContent.length > 0
              ? "combined"
              : "github-snapshot",
        });

      const runtimeResponse =
        await analyzeRuntimeV2(
          payload
        );

      setRuntimeV2Response(
        runtimeResponse
      );

      projectAnalysisMemory.saveEvent({
        id:
          crypto.randomUUID(),

        source:
          trimmedContent.length > 0
            ? "combined"
            : "project",

        title:
          trimmedContent.length > 0
            ? "Thought and project analyzed"
            : "Project analyzed",

        summary:
          runtimeResponse.data.summary.text,

        projectName:
          activeProject.name,

        repositoryName:
          `${activeProject.repository.owner}/${activeProject.repository.name}`,

        commitCount:
          capturedSnapshot.recentCommits
            .length,

        pullRequestCount:
          capturedSnapshot.recentPullRequests
            .length,

        createdAt:
          new Date().toISOString(),

        tags:
          trimmedContent.length > 0
            ? [
                "thought",
                "project",
                "github",
              ]
            : [
                "project",
                "github",
              ],
      });

      if (
        trimmedContent.length > 0
      ) {
        setContent("");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "GitHub Analyze request failed.";

      if (
        message.includes(
          "GitHub session expired"
        )
      ) {
        clearRuntimeGitHubSession(
          "expired"
        );

        setGithubConnectionState(
          "connected"
        );

        setAuthMessage(
          "The Runtime GitHub session expired. Reconnect Runtime to continue."
        );

        setSelectedRepository(null);
        setProjectPersistenceError(null);
        setActiveProject(null);
        setCanonicalProjectRecord(null);
        setIsCanonicalProjectStarted(false);

        setProjectLifecycleHistory([]);

        resetSnapshot();
        setLatestCapturedSnapshot(
          null
        );
      }

      console.error(
        "GitHub Analyze request failed.",
        error
      );
    } finally {
      setProjectActionState(
        "idle"
      );
    }
  };

  const handleAnalyzeGitHubProject = () => {
    void handleGitHubAnalyze(false);
  };

  const handleThoughtAndProjectAnalyze = () => {
    void handleGitHubAnalyze(true);
  };

  const runtimeNextActionSignals =
    createRuntimeNextActionRuntimeSignals(
      runtimeV2Response
    );

  const recentCommitCount =
    latestCapturedSnapshot
      ?.recentCommits.length ?? 0;

  const recentPullRequestCount =
    latestCapturedSnapshot
      ?.recentPullRequests.length ?? 0;

  const reflectionCount =
    activeProject !== null
      ? countPblReflections(activeProject)
      : 0;

  const connectedEventCount =
    projectAnalysisMemory.events.filter(
      (event) => event.source === "combined"
    ).length;

  const currentMilestone =
    activeProject !== null
      ? getCurrentPblMilestone(activeProject)
      : null;

  const runtimeCurrentFocus =
    currentMilestone?.title.trim() ||
    currentStep.trim() ||
    null;

  const runtimeNextAction =
    createRuntimeNextAction({
      hasProject:
        activeProject !== null,

      hasRepository:
        selectedRepository !== null,

      hasReflectionDraft:
        content.trim().length > 0,

      hasGitHubSnapshot:
        latestCapturedSnapshot !== null,

      currentFocus:
        runtimeCurrentFocus,

      recommendedFocus:
        runtimeNextActionSignals.recommendedFocus,

      nextInterpretation:
        runtimeNextActionSignals.nextInterpretation,

      adaptiveCoaching:
        runtimeNextActionSignals.adaptiveCoaching,

      decisionReviewQuestion:
        runtimeNextActionSignals
          .decisionReviewQuestion,

      nextQuestion:
        runtimeNextActionSignals.nextQuestion,

      recentCommitCount,

      recentPullRequestCount,

      reflectionCount,

      connectedEventCount,
    });

  const {
    projectEntries:
      runtimeActionHistoryEntries,

    projectTransitions:
      runtimeActionHistoryTransitions,

    activeEntry:
      activeRuntimeActionHistoryEntry,

    recordNavigation:
      recordRuntimeActionNavigation,

    clearProjectHistory:
      clearRuntimeActionProjectHistory,
  } = useRuntimeActionHistory({
    projectId:
      activeProject?.id ?? null,

    action:
      runtimeNextAction,

    observation: {
      reflectionCount,

      githubSnapshotRevision:
        latestCapturedSnapshot?.capturedAt ??
        null,

      currentFocus:
        runtimeCurrentFocus,

      connectedEventCount,

      runtimeAnalysisRevision:
        runtimeV2Response !== null
          ? JSON.stringify(
              runtimeV2Response
            )
          : null,
    },
  });

  /**
   * 현재 프로젝트의 Runtime Action History를
   * 사용자 확인 후 삭제합니다.
   */
  const handleClearProjectHistory = () => {
    const confirmed =
      window.confirm(
        "Clear past Runtime Action History for this project? The current recommendation will remain."
      );

    if (!confirmed) {
      return;
    }

    clearRuntimeActionProjectHistory();
  };

  const scrollToSection = (
    element: HTMLElement | null
  ) => {
    if (element === null) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleNextActionNavigation = (
    target: RuntimeNextActionTarget
  ) => {
    recordRuntimeActionNavigation(
      target
    );

    switch (target) {
      case "reflection":
      case "combined-analysis": {
        scrollToSection(
          reflectionSectionRef.current
        );

        window.setTimeout(() => {
          const reflectionInput =
            reflectionSectionRef.current
              ?.querySelector<HTMLTextAreaElement>(
                "textarea"
              );

          reflectionInput?.focus();
        }, 350);

        return;
      }

      case "github-analysis":
      case "current-focus": {
        scrollToSection(
          projectFocusSectionRef.current
        );

        return;
      }

      case "project-timeline": {
        scrollToSection(
          projectTimelineSectionRef.current
        );

        return;
      }

      case "runtime-details": {
        scrollToSection(
          runtimeDetailsSectionRef.current
        );

        return;
      }

      default:
        return;
    }
  };

  return (
    <main>
      <InnerMirrorBrand />

      <TrustLayer />

      <ServiceEntryNavigation
        fribotLearningUrl={
          "https://github.com/fribot-labs/fribot-learning"
        }
        onExistingProjectSelect={
          handleExistingProjectSelect
        }
      />

      {/* --------------------------------------------------
          Project Entry Experience

            Service Entry

            ↓

            GitHub Connection

            ↓

            Repository Selection

            ↓

            Project Context

            ↓

            Project Start

      --------------------------------------------------- */}
      <div ref={githubEntrySectionRef}>
        <GitHubLoginEntry
          connectionState={
            githubConnectionState 
          }
          runtimeSessionState={
            runtimeGitHubSessionState
          }
          user={
            authenticatedUser
          }
          authMessage={
            authMessage
          }
          onConnect={
            handleConnectGitHub
          }
          onReconnectRuntime={
            handleReconnectRuntime
          }
          onSignOut={
            handleSignOut
          }
          onResetGitHubAccess={
            handleRenewGitHubAuthorization
          }
          isRuntimeReconnectAvailable={
            authenticatedUser !== null &&
            (
              runtimeGitHubSessionState ===
                "unavailable" ||
              runtimeGitHubSessionState ===
                "expired" ||
              runtimeGitHubSessionState ===
                "error"
            )
          }
        />

        <RepositorySelector
          repositories={
            githubConnectionState ===
              "connected" &&
            runtimeGitHubSessionState ===
              "ready" &&
            githubSessionId !== null
              ? availableRepositories
              : []
          }
          selectedRepository={
            selectedRepository
          }
          onSelectRepository={
            handleSelectRepository
          }
          availabilityMessage={
            repositoryAvailabilityMessage
          }
        />

        {runtimeGitHubSessionState ===
        "expired" ? (
          <div className="github-repository-status github-repository-status-warning">
            Runtime session expired. Reconnect
            Runtime to load repositories.
          </div>
        ) : null}

        {isLoadingRepositories ? (
          <div className="github-repository-status">
            Loading GitHub repositories...
          </div>
        ) : null}

        {repositoryError !== null ? (
          <div className="github-repository-status github-repository-status-error">
            {repositoryError}
          </div>
        ) : null}

        {projectPersistenceError !== null ? (
          <div className="github-repository-status github-repository-status-error">
            {projectPersistenceError}
          </div>
        ) : null}

        <RepositoryMetadataPanel
          metadata={
            runtimeProjectMetadata
          }
        />

        <ProjectIntelligencePanel
          intelligence={
            runtimeProjectIntelligence
          }
        />

        <div ref={projectFocusSectionRef}>
          <ProjectStartPanel
            selectedRepository={selectedRepository}
            currentStep={currentStep}
            onChangeCurrentStep={handleChangeCurrentStep}
            onApplyProjectFocus={handleApplyProjectFocus}
            onAnalyzeGitHubProject={handleAnalyzeGitHubProject}
            isGitHubAnalyzing={isGitHubAnalyzing}
            isActionLocked={
              isSavingThought || isCombinedAnalyzing
            }
            projectFocusSaveStatus={
              projectFocusSaveStatus
            }
            startAction={
              isCanonicalProjectStarted
                ? projectActionGuidance.updateProjectFocus
                : projectActionGuidance.startProject
            }
            analyzeAction={
              projectActionGuidance.analyzeGitHubProject
            }
          />
        </div>
      </div>

      {/* --------------------------------------------------
          Reflection & Runtime Experience
      --------------------------------------------------- */}

        <div ref={reflectionSectionRef}>
          <ProjectReflectionPanel
            project={activeProject}
            selectedRepository={selectedRepository}
            content={content}
            onChangeContent={setContent}
            onSaveThought={handleReflect}
            onThoughtAndProjectAnalyze={
              handleThoughtAndProjectAnalyze
            }
            reflectionPersistenceError={
              reflectionPersistenceError
            }
            isSavingThought={isSavingThought || isLoading}
            isCombinedAnalyzing={isCombinedAnalyzing}
            isActionLocked={isGitHubAnalyzing}
            saveAction={
              projectActionGuidance.saveThought
            }
            combinedAction={
              projectActionGuidance.thoughtProjectAnalyze
            }
          />
        </div>

        {authenticatedUser !== null ? (
          <ReflectionHistoryPanel
            reflections={persistedReflections}
            isLoading={isLoadingReflectionHistory}
            error={reflectionHistoryError}
          />
        ) : null}

        <ProjectSummaryPanel project={activeProject} />

        {activeProject !== null ? (
          <GitHubSnapshotPanel snapshotState={snapshotState} />
        ) : null}

        <RuntimeBoundaryStatusBanner
          health={runtimeBoundaryHealth}
          isChecking={isCheckingBoundary}
          onRefresh={checkHealth}
        />

        <RuntimeFallbackModeNotice uxMode={runtimeUxMode} />

        <LocalReflectionPersistenceNotice
          snapshot={localReflectionSnapshot}
          isLocalOnlyMode={isLocalOnlyMode}
        />

        <OfflineSyncRecoveryPanel
          snapshot={localReflectionSnapshot}
          syncState={offlineSyncRecovery}
          canSync={runtimeUxMode.mode === "full-runtime"}
          onSync={offlineSyncRecovery.syncPendingReflections}
        />

        <RuntimeFailureRecoveryNotice
          recovery={runtimeFailureRecovery}
          visible={runtimeFailureRecoveryDismiss.visible}
          isRecoveryComplete={runtimeFailureRecoveryDismiss.isRecoveryComplete}
          displayTitle={runtimeFailureRecoveryDismiss.title}
          displayMessage={runtimeFailureRecoveryDismiss.message}
          onRetryRuntime={checkHealth}
          onRetryTimeline={serverMemoryTimeline.refresh}
          onSyncLocal={offlineSyncRecovery.syncPendingReflections}
          onDismiss={runtimeFailureRecoveryDismiss.dismiss}
        />

        <ImmediateReflectionFeedback data={immediateFeedback} />

        {runtimeUxMode.canUseStreamingMerge ? (
          <RuntimeStreamingMergeSurface
            events={streamingMergeEvents}
            isMerging={isMerging}
          />
        ) : null}

        {isLoading ? <RuntimeLoadingState /> : null}

        {error !== null && runtimeUxMode.mode !== "local-only" ? (
          <RuntimeErrorState error={error} onRetry={handleReflect} />
        ) : null}

        {runtimeNextAction ? (
          <RuntimeNextActionPanel
            action={runtimeNextAction}
            recommendationPresentation={
              recommendationPresentation
            }
            onNavigate={
              handleNextActionNavigation
            }
          />
        ) : null}

        {activeProject !== null ? (
          <RuntimeActionHistoryPanel
            entries={
              runtimeActionHistoryEntries
            }
            transitions={
              runtimeActionHistoryTransitions
            }
            activeEntryId={
              activeRuntimeActionHistoryEntry
                ?.id ??
              null
            }
            currentRecommendationPresentation={
              recommendationPresentation
            }
            onClear={
              handleClearProjectHistory
            }
          />
        ) : null}

        {runtimePredictivePresentation !== null ? (
          <div className="runtime-prediction-region">
            <RuntimePredictionPanel
              presentation={
                runtimePredictivePresentation
              }
            />
          </div>
        ) : null}

        {runtimeV2Response !== null ? (
          <div ref={runtimeDetailsSectionRef}>
            <RuntimeV2ResultPanel
              response={runtimeV2Response}
            />
          </div>
        ) : null}

        {result !== null ? (
          <>
            {isOptimistic ? (
              <div className="optimistic-result-note">
                임시 분석 결과입니다. 깊은 runtime 결과가 도착하면 자동으로
                갱신됩니다.
              </div>
            ) : null}

            <RuntimeReflectionResultView result={result} />

            {runtimeUxMode.canUseContinuitySurfaces ? (
              <>
                <ReflectionContinuitySurface data={continuitySurfaceData} />

                <ReturningThemeSurface data={returningThemeSurfaceData} />

                <LongGapRecoverySurface data={longGapRecoverySurfaceData} />

                <IdentityDriftSurface data={identityDriftSurfaceData} />
              </>
            ) : null}
          </>
        ) : null}

        {activeProject !== null &&
        (projectContinuityInsight ||
          projectPatternInsight) ? (
          <ProjectFlowSummaryPanel
            continuity={projectContinuityInsight ?? undefined}
            pattern={projectPatternInsight ?? undefined}
          />
        ) : null}

        {activeProject !== null &&
        projectAnalysisMemory.events.length > 0 ? (
          <div ref={projectTimelineSectionRef}>
            <ProjectAnalysisMemoryTimeline
              events={projectAnalysisMemory.events}
              onClear={projectAnalysisMemory.clearEvents}
            />
          </div>
        ) : null}

        {activeProject !== null &&
        runtimeUxMode.canUseMemoryTimeline ? (
          <>
            {serverMemoryTimeline.isLoading ? (
              <div className="runtime-memory-source-note">
                Loading Runtime memory timeline...
              </div>
            ) : null}

            {serverMemoryTimeline.error !== null ? (
              <div className="runtime-memory-source-note runtime-memory-source-note-error">
                Unable to load Runtime memory timeline.
              </div>
            ) : null}

            <RuntimeMemoryTimeline
              data={runtimeMemoryTimelineData}
            />
          </>
        ) : null}

        {localReflectionSnapshot.totalCount > 0 ? (
          <LocalReflectionList
            snapshot={localReflectionSnapshot}
            onClear={clearLocalReflectionMemory}
          />
        ) : null}

    </main>
  );
}

function mergeGitHubRepositories(
  repositories: GitHubRepositorySummary[]
): GitHubRepositorySummary[] {
  const repositoryMap =
    new Map<
      string,
      GitHubRepositorySummary
    >();

  for (const repository of repositories) {
    if (repository.private) {
      continue;
    }

    const repositoryKey =
      repository.repositoryId.trim();

    if (
      repositoryKey.length === 0
    ) {
      continue;
    }

    repositoryMap.set(
      repositoryKey,
      repository
    );
  }

  return Array.from(
    repositoryMap.values()
  ).sort(
    (a, b) =>
      getRepositoryUpdatedTimestamp(b) -
      getRepositoryUpdatedTimestamp(a)
  );
}

function getRepositoryUpdatedTimestamp(
  repository: GitHubRepositorySummary
): number {
  if (
    typeof repository.updatedAt !== "string" ||
    repository.updatedAt.trim().length === 0
  ) {
    return 0;
  }

  const timestamp =
    Date.parse(repository.updatedAt);

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}

export default App;