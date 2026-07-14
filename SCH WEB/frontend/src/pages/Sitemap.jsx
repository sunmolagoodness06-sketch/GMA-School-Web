import React from 'react';
import { Link } from 'react-router-dom';
import SVGIcon from '../components/icons/SVGIcon';
import SEO from '../components/SEO';

const Sitemap = () => {
  const sections = [
    {
      title: 'Main Pages',
      links: [
        { path: '/', label: 'Home', icon: 'building' },
        { path: '/about', label: 'About Us', icon: 'heart' },
        { path: '/academics', label: 'Academic Programs', icon: 'graduation' },
        { path: '/admissions', label: 'Admissions', icon: 'user' },
        { path: '/careers', label: 'Careers', icon: 'briefcase' },
        { path: '/contact', label: 'Contact', icon: 'phone' }
      ]
    },
    {
      title: 'Academic Divisions',
      links: [
        { path: '/academics#nursery', label: 'Nursery & Early Years', icon: 'lightbulb' },
        { path: '/academics#primary', label: 'Primary School', icon: 'bookOpen' },
        { path: '/academics#secondary', label: 'Secondary School', icon: 'graduation' },
        { path: '/academics#college', label: 'College / Sixth Form', icon: 'award' }
      ]
    },
    {
      title: 'Account',
      links: [
        { path: '/login', label: 'Portal Login', icon: 'log-in' },
        { path: '/register', label: 'Register', icon: 'user' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { path: '/privacy', label: 'Privacy Policy', icon: 'shield' },
        { path: '/terms', label: 'Terms of Service', icon: 'book' }
      ]
    }
  ];

  return (
    <div className="sitemap" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <SEO title="Sitemap" description="A full overview of every page on the Goodness and Mercy Academy website." />
      <div className="container">
        <div className="section">
          <h1>Sitemap</h1>
          <p>A full overview of every page on the Goodness and Mercy Academy (GMA) website.</p>
          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: '2rem' }}>
            {sections.map((section) => (
              <div key={section.title} className="card">
                <div className="card-header">
                  <h3>{section.title}</h3>
                </div>
                <div className="card-body">
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {section.links.map((link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <SVGIcon name={link.icon} size={16} />
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
