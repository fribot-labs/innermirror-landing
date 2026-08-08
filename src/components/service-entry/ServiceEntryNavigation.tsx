import {
    ServiceEntryCard,
} from "./ServiceEntryCard";

import "./ServiceEntryNavigation.css";

type ServiceEntryNavigationProps = {
  fribotLearningUrl: string;

  onExistingProjectSelect: () => void;
};

export function ServiceEntryNavigation({
  fribotLearningUrl,
  onExistingProjectSelect,
}: ServiceEntryNavigationProps) {
  const handleOpenFribotLearning =
    () => {
      window.open(
        fribotLearningUrl,
        "_blank",
        "noopener,noreferrer"
      );
    };

  return (
    <section
      className="service-entry-navigation"
      aria-labelledby="service-entry-title"
    >
      <div className="service-entry-navigation__header">
        <p className="service-entry-navigation__eyebrow">
          CHOOSE YOUR STARTING POINT
        </p>

        <h2 id="service-entry-title">
          Choose Your Project Journey
        </h2>

        <p className="service-entry-navigation__intro">
          Choose how you want to begin.
        </p>

        <p className="service-entry-navigation__intro">
          Start with a guided project,
          or continue with an existing GitHub repository.
        </p>
      </div>

      <div className="service-entry-navigation__cards">
        <ServiceEntryCard
          eyebrow="NEW PROJECT"
          title="Start a New Learning Project"
          description={
            "Begin with a structured Fribot Learning project and create your own GitHub project repository."
          }
          flow={[
            "Fribot Learning",
            "Choose a Project",
            "Export Repository",
            "InnerMirror",
          ]}
          actionLabel="Browse Learning Projects"
          onAction={
            handleOpenFribotLearning
          }
          secondaryText={
            "Start with guidance. Continue without limits."
          }
        />

        <ServiceEntryCard
          eyebrow="EXISTING PROJECT"
          title="Analyze an Existing Project"
          description={
            "Already have a GitHub project? Connect it directly and continue with Project Analyze, Reflect, or Reflect + GitHub."
          }
          flow={[
            "Existing Repository",
            "Connect Repository",
            "InnerMirror",
            "Analyze / Reflect",
          ]}
          actionLabel="Continue with GitHub"
          onAction={
            onExistingProjectSelect
          }
          secondaryText={
            "Fribot Learning is optional when you already have a project."
          }
        />
      </div>

      <div className="service-entry-navigation__principle">
        <p>
          Fribot Learning defines where a project begins.
        </p>

        <p>
          InnerMirror understands where that project chooses to go.
        </p>
      </div>

      <p className="service-entry-navigation__project-principle">
        One project. One repository. One learning journey.
      </p>

      <p className="service-entry-navigation__continuity">
        GitHub records your project. InnerMirror understands your growth.
      </p>
    </section>
  );
}