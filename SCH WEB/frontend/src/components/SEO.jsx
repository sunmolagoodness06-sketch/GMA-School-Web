import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'GMA School';
const DEFAULT_TITLE = `${SITE_NAME} | Goodness and Mercy Academy`;

const SEO = ({ title, description }) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
    </Helmet>
  );
};

export default SEO;