// import Button from 'react-bootstrap/Button'
// import Col from 'react-bootstrap/Col'
// import Row from 'react-bootstrap/Row'
// import Stack from 'react-bootstrap/Stack'
// import { useNavigate } from 'react-router-dom';

// export default function Home() {
//   const navigate = useNavigate();

//   const handleNavigation = (event) => {
//     navigate('/' + event.currentTarget.getAttribute('route'));
//   };

//   return (
//     <>
//       <Stack direction="vertical" gap={2}>
//         <h1>Zach's Portfolio</h1>
//         <Button variant="link" onClick={handleNavigation} route='commuteDashboard' className="navbar-link">Commute Dashboard</Button>
//         {/*<Button variant="link" onClick={handleNavigation} route='smsPaymentLoop' className="navbar-link">SMS Payment Loop</Button>*/}
//         <Button variant="link" onClick={handleNavigation} route='OCRDataExtraction' className="navbar-link">PDF Bid Data Extraction with OCR</Button>
//       </Stack>
//     </>
//   )
// }





import React, { useState } from "react";
import { projects } from "./homePageUtils/projectsData";
import ProjectListItem from "./homePageUtils/ProjectListItem";
import "./Home.css";

/**
 * Classic single-open accordion: clicking a project name toggles it
 * open and closes whichever other one was open. If you'd rather let
 * multiple be open at once, swap `expandedId` (a single value) for a
 * Set of open ids and toggle membership in it instead.
 */
export default function Home() {
  const [expandedId, setExpandedId] = useState(null);

  const toggleProject = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <div className="home-page">
      <header className="home-page__header">
        <h1>Zach's Portfolio</h1>
      </header>

      <ul className="project-list">
        {projects.map((project) => (
          <ProjectListItem
            key={project.id}
            project={project}
            isExpanded={expandedId === project.id}
            onToggle={() => toggleProject(project.id)}
          />
        ))}
      </ul>
    </div>
  );
}