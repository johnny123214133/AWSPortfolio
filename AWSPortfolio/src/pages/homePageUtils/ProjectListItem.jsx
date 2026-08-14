import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * One accordion row: the project name (the clickable toggle, styled so
 * hovering the whole line lightens the text) plus its collapsible
 * panel with a short description and a "View project" button.
 *
 * "View project" is a real <button> rather than a <Link>/<a> so it can
 * share the exact same .btn styling used elsewhere in the app (see
 * Home.css) regardless of whether the destination is internal or
 * external -- internal projects navigate via react-router's
 * useNavigate(), external ones open in a new tab via window.open().
 */
export default function ProjectListItem({ project, isExpanded, onToggle }) {
  const navigate = useNavigate();
  const panelId = `project-panel-${project.id}`;
  const buttonId = `project-toggle-${project.id}`;

  const handleViewProject = () => {
    if (project.buttonDisabled) return;
    if (project.linkType === "external") {
      window.open(project.link, "_blank", "noopener,noreferrer");
    } else {
      navigate(project.link);
    }
  };

  return (
    <li className="project-list__item">
      <button
        id={buttonId}
        type="button"
        className="project-list__toggle"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
      >
        {project.name}
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`project-list__panel${isExpanded ? " project-list__panel--open" : ""}`}
      >
        <div className="project-list__panel-content">
          <p>{project.description}</p>
          <button
            type="button"
            className="btn"
            onClick={handleViewProject}
            disabled={Boolean(project.buttonDisabled)}
          >
            {project.buttonText}
          </button>
        </div>
      </div>
    </li>
  );
}