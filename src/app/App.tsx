import { useEffect, useState } from "react";
import { GitHubLoginEntry } from "../components/github/GitHubLoginEntry";
import { GitHubSnapshotPanel } from "../components/github/GitHubSnapshotPanel";
import { RepositorySelector } from "../components/github/RepositorySelector";
import { ProjectReflectionPanel } from "../components/project/ProjectReflectionPanel";
import { ProjectStartPanel } from "../components/project/ProjectStartPanel";
import { ProjectSummaryPanel } from "../components/project/ProjectSummaryPanel";
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
import { RuntimeBoundaryStatusBanner } from "../components/runtime/RuntimeBoundaryStatusBanner";
import { RuntimeFailureRecoveryNotice } from "../components/runtime/RuntimeFailureRecoveryNotice";
import { RuntimeFallbackModeNotice } from "../components/runtime/RuntimeFallbackModeNotice";
import { RuntimeMemoryTimeline } from "../components/runtime/RuntimeMemoryTimeline";
import { RuntimeStreamingMergeSurface } from "../components/runtime/RuntimeStreamingMergeSurface";
import { RuntimeV2ResultPanel } from "../components/runtime/RuntimeV2ResultPanel";
import { RuntimeErrorState } from "../components/RuntimeErrorState";
import { RuntimeLoadingState } from "../components/RuntimeLoadingState";
import { RuntimeReflectionResultView } from "../components/RuntimeReflectionResult";
import { useGitHubRepositories } from "../github/useGitHubRepositories";
import { useGitHubSnapshot } from "../github/useGitHubSnapshot";
import { resolveProjectActionGuidance } from "../project-actions/resolveProjectActionGuidance";
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
import { createIdentityDriftSurfaceData } from "../runtime/createIdentityDriftSurfaceData";
import { createLongGapRecoverySurfaceData } from "../runtime/createLongGapRecoverySurfaceData";
import { createProjectContinuityInsight } from "../runtime/createProjectContinuityInsight";
import { createProjectPatternInsight } from "../runtime/createProjectPatternInsight";
import { mapReturningThemeSurfaceData } from "../runtime/mapReturningThemeSurfaceData";
import { toReflectionContinuitySurfaceData } from "../runtime/toReflectionContinuitySurfaceData";
import type {
  GitHubConnectionState,
  GitHubRepositorySummary,
} from "../types/githubLearningEntry";
import {
  addPblReflection,
  createPblProject,
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
  const [content, setContent] = useState("");

  const [githubConnectionState, setGithubConnectionState] =
    useState<GitHubConnectionState>("disconnected");

  const {
    repositories,
    isLoading: isLoadingRepositories,
    error: repositoryError,
  } = useGitHubRepositories({
    enabled: githubConnectionState === "connected",
  });

  const [selectedRepository, setSelectedRepository] =
    useState<GitHubRepositorySummary | null>(null);

  const [currentStep, setCurrentStep] = useState("");

  const [activeProject, setActiveProject] =
    useState<PblProject | null>(null);

  const [runtimeV2Response, setRuntimeV2Response] =
    useState<RuntimeContractV2Response | null>(null);

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
        activeProject !== null,

      hasCurrentFocus:
        currentStep.trim().length > 0,

      hasReflectionDraft:
        content.trim().length > 0,

      hasProjectSnapshot:
        snapshotState.status === "ready",

      isActionRunning:
        isAnyProjectActionRunning,
    });

  const {
    isMerging,
    events: streamingMergeEvents,
    startMerge,
    resetMerge,
  } = useRuntimeStreamingMerge();

  const {
    isChecking: isCheckingBoundary,
    health: runtimeBoundaryHealth,
    checkHealth,
  } = useRuntimeBoundaryHealth();

  const runtimeUxMode = resolveRuntimeUxMode({
    health: runtimeBoundaryHealth,
    isChecking: isCheckingBoundary,
  });

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const githubSessionId = params.get("githubSessionId");

    if (githubSessionId === null) {
      return;
    }

    window.localStorage.setItem(
      "innermirror.githubSessionId",
      githubSessionId
    );

    setGithubConnectionState("connected");

    window.history.replaceState({}, "", "/");
  }, []);

  useEffect(() => {
    if (repositoryError === null) {
      return;
    }

    if (!repositoryError.includes("GitHub session expired")) {
      return;
    }

    setGithubConnectionState("disconnected");
    setSelectedRepository(null);
    setActiveProject(null);
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

  const handleConnectGitHub = () => {
    window.location.href =
      "http://localhost:4000/github/oauth/start";
  };

  const handleSelectRepository = (
    repository: GitHubRepositorySummary
  ) => {
    const isSameRepository =
      selectedRepository?.owner === repository.owner &&
      selectedRepository?.name === repository.name;

    if (isSameRepository) {
      return;
    }

    setSelectedRepository(repository);
    setActiveProject(null);
    setCurrentStep("");
    resetSnapshot();
    setRuntimeV2Response(null);
    resetMerge();
  };

  const resolvedCurrentStep =
    currentStep.trim().length > 0
      ? currentStep.trim()
      : "Explore this project";

  const handleApplyProjectFocus = () => {
    if (selectedRepository === null) {
      return;
    }

    const trimmedCurrentStep = currentStep.trim();

    if (trimmedCurrentStep.length === 0) {
      return;
    }

    if (activeProject === null) {
      const nextProject = createPblProject({
        name: selectedRepository.name,
        repository: {
          provider: "github",
          owner: selectedRepository.owner,
          name: selectedRepository.name,
          defaultBranch: selectedRepository.defaultBranch,
        },
        currentStep: trimmedCurrentStep,
      });

      setActiveProject(nextProject);
      resetSnapshot();

      return;
    }

    const updatedProject = updatePblProjectFocus({
      project: activeProject,
      currentStep: trimmedCurrentStep,
    });

    setActiveProject(updatedProject);
  };

  const handleReflect = async () => {
    const trimmedContent = content.trim();

    if (
      trimmedContent.length === 0 ||
      isAnyProjectActionRunning
    ) {
      return;
    }

    setProjectActionState("saving-thought");

    try {
      if (activeProject !== null) {
        setActiveProject(
          addPblReflection({
            project: activeProject,
            content: trimmedContent,
          })
        );
      }

      resetMerge();

      if (isLocalOnlyMode) {
        saveLocalReflection(trimmedContent);
        setContent("");

        return;
      }

      setRuntimeV2Response(null);

      try {
        if (activeProject !== null) {
          const payload = createRuntimeContractV2Payload({
            reflectionText: trimmedContent,

            project: {
              projectId: activeProject.id,
              name: activeProject.name,
              currentStep: resolvedCurrentStep,
            },

            repository: {
              owner: activeProject.repository.owner,
              name: activeProject.repository.name,
              defaultBranch:
                activeProject.repository.defaultBranch,
            },

            learningContext: {
              currentStep: resolvedCurrentStep,
              learnerLevel: "junior",
            },

            trigger: "reflection",
          });

          const runtimeResponse =
            await analyzeRuntimeV2(payload);

          setRuntimeV2Response(runtimeResponse);
        }
      } catch (error) {
        console.error(
          "Runtime V2 reflection request failed.",
          error
        );
      }

      await submitReflection(trimmedContent);

      setContent("");

      window.setTimeout(() => {
        void serverMemoryTimeline.refresh();
      }, 800);

      if (runtimeUxMode.canUseStreamingMerge) {
        void startMerge({
          content: trimmedContent,
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
      capturedSnapshot = await captureSnapshot({
        owner: activeProject.repository.owner,
        name: activeProject.repository.name,
        defaultBranch: activeProject.repository.defaultBranch,
      });

      if (capturedSnapshot === null) {
        return;
      }

      if (includeThought) {
        setActiveProject((currentProject) => {
          if (currentProject === null) {
            return currentProject;
          }

          return addPblReflection({
            project: currentProject,
            content: trimmedContent,
          });
        });
      }

      const payload = createRuntimeContractV2Payload({
        reflectionText:
          trimmedContent.length > 0 ? trimmedContent : undefined,

        project: {
          projectId: activeProject.id,
          name: activeProject.name,
          currentStep: resolvedCurrentStep,
        },

        repository: {
          owner: activeProject.repository.owner,
          name: activeProject.repository.name,
          defaultBranch: activeProject.repository.defaultBranch,
        },

        githubSnapshot: capturedSnapshot,

        learningContext: {
          currentStep: resolvedCurrentStep,
          learnerLevel: "junior",
        },

        projectHistory: {
          events: projectAnalysisMemory.events.slice(0, 5).map((event) => ({
            source: event.source,
            title: event.title,
            summary: event.summary,
            repositoryName: event.repositoryName,
            commitCount: event.commitCount,
            pullRequestCount: event.pullRequestCount,
            tags: event.tags,
            createdAt: event.createdAt,
          })),
        },

        trigger:
          trimmedContent.length > 0
            ? "combined"
            : "github-snapshot",
      });

      const runtimeResponse = await analyzeRuntimeV2(payload);

      setRuntimeV2Response(runtimeResponse);

      projectAnalysisMemory.saveEvent({
        id: crypto.randomUUID(),

        source:
          trimmedContent.length > 0
            ? "combined"
            : "project",

        title:
          trimmedContent.length > 0
            ? "Thought and project analyzed"
            : "Project analyzed",

        summary: runtimeResponse.data.summary.text,

        projectName: activeProject.name,

        repositoryName:
          `${activeProject.repository.owner}/${activeProject.repository.name}`,

        commitCount:
          capturedSnapshot.recentCommits.length,

        pullRequestCount:
          capturedSnapshot.recentPullRequests.length,

        createdAt: new Date().toISOString(),

        tags:
          trimmedContent.length > 0
            ? ["thought", "project", "github"]
            : ["project", "github"],
      });

      if (trimmedContent.length > 0) {
        setContent("");
      }
      
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "GitHub Analyze request failed.";

      if (message.includes("GitHub session expired")) {
        setGithubConnectionState("disconnected");
        setSelectedRepository(null);
        setActiveProject(null);
        resetSnapshot();
      }

      console.error(
        "GitHub Analyze request failed.",
        error
      );
    } finally {
      setProjectActionState("idle");
    }
  };

  const handleAnalyzeGitHubProject = () => {
    void handleGitHubAnalyze(false);
  };

  const handleThoughtAndProjectAnalyze = () => {
    void handleGitHubAnalyze(true);
  };

  return (
    <main>
      <GitHubLoginEntry
        connectionState={githubConnectionState}
        onConnect={handleConnectGitHub}
      />

      <RepositorySelector
        repositories={
          githubConnectionState === "connected"
            ? repositories
            : []
        }
        selectedRepository={selectedRepository}
        onSelectRepository={handleSelectRepository}
      />

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

      <ProjectStartPanel
        selectedRepository={selectedRepository}
        project={activeProject}
        currentStep={currentStep}
        onChangeCurrentStep={setCurrentStep}
        onApplyProjectFocus={handleApplyProjectFocus}
        onAnalyzeGitHubProject={handleAnalyzeGitHubProject}
        isGitHubAnalyzing={isGitHubAnalyzing}
        isActionLocked={
          isSavingThought || isCombinedAnalyzing
        }
        startAction={
          activeProject === null
            ? projectActionGuidance.startProject
            : projectActionGuidance.updateProjectFocus
        }
        analyzeAction={
          projectActionGuidance.analyzeGitHubProject
        }
      />

      <ProjectReflectionPanel
        project={activeProject}
        selectedRepository={selectedRepository}
        content={content}
        onChangeContent={setContent}
        onSaveThought={handleReflect}
        onThoughtAndProjectAnalyze={
          handleThoughtAndProjectAnalyze
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

      {runtimeV2Response !== null ? (
        <RuntimeV2ResultPanel
          response={runtimeV2Response}
        />
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
        <ProjectAnalysisMemoryTimeline
          events={projectAnalysisMemory.events}
          onClear={projectAnalysisMemory.clearEvents}
        />
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

export default App;