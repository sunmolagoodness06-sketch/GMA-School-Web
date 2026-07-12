import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import SVGIcon from '../components/icons/SVGIcon';
import PageHeader from '../components/PageHeader';
import SEO from '../components/SEO';
import './Academics.css';

const Academics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  const divisions = [
    {
      id: 'nursery',
      icon: 'lightbulb',
      title: 'Nursery & Early Years',
      ageRange: 'Ages 2-5',
      description: 'Foundation learning through play-based activities, early literacy, numeracy, and social skills development.',
      highlights: [
        'Play-based learning approach',
        'Early literacy and numeracy',
        'Social and emotional development',
        'Creative arts and music'
      ]
    },
    {
      id: 'primary',
      icon: 'bookOpen',
      title: 'Primary School',
      ageRange: 'Ages 6-11',
      description: 'Building strong foundations in core subjects with emphasis on critical thinking and problem-solving skills.',
      highlights: [
        'English Language & Literature',
        'Mathematics & Science',
        'Social Studies & History',
        'Computer Studies & Technology',
        'Physical Education & Sports'
      ]
    },
    {
      id: 'secondary',
      icon: 'graduation',
      title: 'Secondary School',
      ageRange: 'Ages 12-16',
      description: 'Comprehensive curriculum preparing students for WAEC, NECO, and international examinations.',
      highlights: [
        'Core subjects: English, Mathematics, Sciences',
        'Elective subjects based on career interests',
        'Laboratory practicals and research projects',
        'Leadership and entrepreneurship programs'
      ]
    },
    {
      id: 'college',
      icon: 'award',
      title: 'College / Sixth Form',
      ageRange: 'Ages 17-18',
      description: 'Advanced studies and university preparation with focus on specialized subjects and career guidance.',
      highlights: [
        'A-Level and JAMB preparation',
        'University application guidance',
        'Career counseling and mentorship',
        'Research and independent study projects'
      ]
    }
  ];

  const coCurricular = [
    { icon: 'activity', title: 'Sports & Athletics', description: 'Football, Basketball, Athletics, Swimming, and more.' },
    { icon: 'music', title: 'Arts & Culture', description: 'Music, Drama, Visual Arts, and Cultural performances.' },
    { icon: 'cpu', title: 'STEM Clubs', description: 'Robotics, Coding, Science Fair, and Innovation labs.' },
    { icon: 'users', title: 'Leadership', description: 'Student Government, Debate Club, and Community Service.' }
  ];

  return (
    <div className="academics">
      <SEO
        title="Academic Programs"
        description="Explore GMA School's academic divisions from nursery through college preparation."
      />
      <PageHeader
        title="Academic Programs"
        description="A comprehensive education journey from nursery through college preparation, designed to unlock every student's potential at every stage."
      />

      <section className="section">
        <div className="container">
          <div className="academic-divisions">
            {divisions.map((division) => (
              <div key={division.id} id={division.id} className="academic-division-card scroll-anchor">
                <div className="academic-division-header">
                  <div className="academic-division-icon">
                    <SVGIcon name={division.icon} size={32} />
                  </div>
                  <div>
                    <h3>{division.title}</h3>
                    <span className="academic-division-age">{division.ageRange}</span>
                  </div>
                </div>
                <div className="academic-division-body">
                  <p>{division.description}</p>
                  <ul className="academic-division-list">
                    {division.highlights.map((item) => (
                      <li key={item}>
                        <SVGIcon name="check" size={16} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="co-curricular" className="section-lg bg-surface scroll-anchor">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Co-curricular Activities</h2>
            <p className="section-description">
              Well-rounded development beyond the classroom, building skills, confidence, and lifelong
              passions.
            </p>
          </div>
          <div className="co-curricular-grid grid grid-auto-fit">
            {coCurricular.map((activity) => (
              <div key={activity.title} className="co-curricular-card">
                <div className="co-curricular-icon">
                  <SVGIcon name={activity.icon} size={28} />
                </div>
                <h4>{activity.title}</h4>
                <p>{activity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-lg cta-section bg-gradient-gold">
        <div className="container">
          <div className="cta-content text-center">
            <div className="cta-icon">
              <SVGIcon name="graduation" size={48} />
            </div>
            <h2>Ready to Begin the Journey?</h2>
            <p className="lead">
              Explore admission requirements and start your child's application to GMA School today.
            </p>
            <div className="cta-actions">
              <Link to="/admissions" className="btn btn-primary btn-xl">
                <SVGIcon name="arrowRight" size={20} />
                View Admissions
              </Link>
              <Link to="/contact" className="btn btn-outline btn-xl">
                <SVGIcon name="phone" size={20} />
                Ask a Question
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Academics;