import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);

const Dashboard = () => {
  const { apiCall } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      const { data } = await apiCall('/admin/dashboard/stats');
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message || 'Failed to load dashboard');
      }
      setIsLoading(false);
    };
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <div className="empty-state"><Icon name="loader" size={24} className="spinning" /></div>;
  }

  if (error) {
    return <div className="empty-state">{error}</div>;
  }

  const cards = [
    { label: 'Total Students', value: stats.students.total },
    { label: 'Pending Applications', value: stats.applications.pending },
    { label: 'New Applications (7 days)', value: stats.applications.thisWeek },
    { label: 'New Messages', value: stats.messages.new },
    { label: 'Pending Career Applications', value: stats.careerApplications.pending },
    { label: 'Overdue Invoices', value: stats.financial.overdueInvoices },
    { label: 'Total Revenue Collected', value: formatCurrency(stats.financial.totalRevenue) },
    { label: 'Active Notices', value: stats.notices.active }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-secondary">Overview of school activity</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.label}>
            <div className="stat-card-label">{card.label}</div>
            <div className="stat-card-value">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
