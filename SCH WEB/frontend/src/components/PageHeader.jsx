import React from 'react';
import './PageHeader.css';

const PageHeader = ({ title, description }) => {
  return (
    <section className="page-header">
      <div className="page-header-pattern"></div>
      <div className="container">
        <h1 className="page-header-title">{title}</h1>
        {description && <p className="page-header-description">{description}</p>}
      </div>
    </section>
  );
};

export default PageHeader;
