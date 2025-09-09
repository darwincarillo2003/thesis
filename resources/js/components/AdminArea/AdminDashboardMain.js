import React, { useState, useEffect } from 'react';
import { Users, Building, Shield, UserCheck, BarChart3, PieChart } from 'lucide-react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboardMain = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    totalRoles: 0,
    activeUsers: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    organizations: [],
    usersByRole: [],
    isLoading: true
  });

  // Fetch dashboard statistics and analytics data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const tokenType = localStorage.getItem('token_type');
        
        if (token && tokenType) {
          axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
        }

        // Fetch dashboard stats
        const statsResponse = await axios.get('/api/dashboard/stats');
        
        if (statsResponse.data.success) {
          setStats({
            totalUsers: statsResponse.data.data.total_users,
            totalOrganizations: statsResponse.data.data.total_organizations,
            totalRoles: statsResponse.data.data.total_roles,
            activeUsers: statsResponse.data.data.active_users
          });
        }

        // Fetch analytics data
        const [organizationsResponse, rolesResponse] = await Promise.all([
          axios.get('/api/organizations'),
          axios.get('/api/roles')
        ]);

        if (organizationsResponse.data.success && rolesResponse.data.success) {
          setAnalyticsData({
            organizations: organizationsResponse.data.data,
            usersByRole: rolesResponse.data.data,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Keep default values on error
        setAnalyticsData(prev => ({ ...prev, isLoading: false }));
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchData();
  }, []);

  // Prepare bar chart data for organizations by member count
  const getOrganizationsBarData = () => {
    if (analyticsData.isLoading || !analyticsData.organizations.length) {
      return null;
    }

    const topOrgs = analyticsData.organizations
      .sort((a, b) => (b.users_count || 0) - (a.users_count || 0))
      .slice(0, 10); // Top 10 organizations

    return {
      labels: topOrgs.map(org => org.organization_name),
      datasets: [
        {
          label: 'Members',
          data: topOrgs.map(org => org.users_count || 0),
          backgroundColor: 'rgba(0, 54, 175, 0.6)',
          borderColor: 'rgba(0, 54, 175, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare pie chart data for users by role
  const getUsersByRolePieData = () => {
    if (analyticsData.isLoading || !analyticsData.usersByRole.length) {
      return null;
    }

    const colors = [
      'rgba(0, 54, 175, 0.8)',
      'rgba(255, 152, 0, 0.8)',
      'rgba(76, 175, 80, 0.8)',
      'rgba(156, 39, 176, 0.8)',
      'rgba(244, 67, 54, 0.8)',
      'rgba(33, 150, 243, 0.8)',
    ];

    return {
      labels: analyticsData.usersByRole.map(role => role.role_name),
      datasets: [
        {
          label: 'Users',
          data: analyticsData.usersByRole.map(role => role.users_count || 0),
          backgroundColor: colors.slice(0, analyticsData.usersByRole.length),
          borderColor: colors.slice(0, analyticsData.usersByRole.length).map(color => color.replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="admin-main">
      <div className="admin-main__header">
        <h1 className="admin-main__title">Admin Dashboard</h1>
      </div>

      <div className="admin-main__stats">
        <div className="admin-main__stat-card total-users">
          <p className="admin-main__stat-label">Total Users</p>
          <div className="admin-main__stat-content">
            <h3 className="admin-main__stat-value">
              {isLoadingStats ? '...' : stats.totalUsers}
            </h3>
            <div className="admin-main__stat-icon total-users">
              <Users size={32} />
            </div>
          </div>
        </div>

        <div className="admin-main__stat-card total-orgs">
          <p className="admin-main__stat-label">Total Organizations</p>
          <div className="admin-main__stat-content">
            <h3 className="admin-main__stat-value">
              {isLoadingStats ? '...' : stats.totalOrganizations}
            </h3>
            <div className="admin-main__stat-icon total-orgs">
              <Building size={32} />
            </div>
          </div>
        </div>

        <div className="admin-main__stat-card total-roles">
          <p className="admin-main__stat-label">Total Roles</p>
          <div className="admin-main__stat-content">
            <h3 className="admin-main__stat-value">
              {isLoadingStats ? '...' : stats.totalRoles}
            </h3>
            <div className="admin-main__stat-icon total-roles">
              <Shield size={32} />
            </div>
          </div>
        </div>

        <div className="admin-main__stat-card active-users">
          <p className="admin-main__stat-label">Active Users</p>
          <div className="admin-main__stat-content">
            <h3 className="admin-main__stat-value">
              {isLoadingStats ? '...' : stats.activeUsers}
            </h3>
            <div className="admin-main__stat-icon active-users">
              <UserCheck size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="admin-main__analytics">
        <div className="admin-main__analytics-grid">
          {/* Organizations Bar Chart */}
          <div className="admin-main__chart-container">
            <div className="admin-main__chart-header">
              <BarChart3 size={20} />
              <h3 className="admin-main__chart-title">Organizations by Member Count</h3>
            </div>
            <div className="admin-main__chart-wrapper">
              {analyticsData.isLoading ? (
                <div className="admin-main__chart-loading">Loading chart data...</div>
              ) : getOrganizationsBarData() ? (
                <Bar data={getOrganizationsBarData()} options={barChartOptions} />
              ) : (
                <div className="admin-main__chart-no-data">No organization data available</div>
              )}
            </div>
          </div>

          {/* Users by Role Pie Chart */}
          <div className="admin-main__chart-container">
            <div className="admin-main__chart-header">
              <PieChart size={20} />
              <h3 className="admin-main__chart-title">Users by Role</h3>
            </div>
            <div className="admin-main__chart-wrapper">
              {analyticsData.isLoading ? (
                <div className="admin-main__chart-loading">Loading chart data...</div>
              ) : getUsersByRolePieData() ? (
                <Pie data={getUsersByRolePieData()} options={chartOptions} />
              ) : (
                <div className="admin-main__chart-no-data">No user role data available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardMain;


































