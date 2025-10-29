import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Phone,
  Home,
  TrendingUp,
  Activity,
  ArrowRight,
  BarChart3,
  Settings,
} from 'lucide-react';

const AdminLandingPage = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleNavigation = (route) => {
    window.location.href = route;
  };

  const adminCards = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Overview of all system metrics and analytics',
      icon: LayoutDashboard,
      route: '/admin/Dashboard',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      route: '/admin/UserManagement',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    },
    {
      id: 'enquiries',
      title: 'Enquiries',
      description: 'View and manage property enquiries',
      icon: MessageSquare,
      route: '/admin/enquiries',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    {
      id: 'callbacks',
      title: 'Callback Requests',
      description: 'Handle customer callback requests',
      icon: Phone,
      route: '/admin/callback',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
    {
      id: 'properties',
      title: 'Properties',
      description: 'Manage all property listings',
      icon: Home,
      route: '/admin/properties',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '40px 24px',
    },
    content: {
      maxWidth: '1400px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '48px',
    },
    titleSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '12px',
    },
    title: {
      fontSize: '42px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0,
      letterSpacing: '-0.5px',
    },
    subtitle: {
      fontSize: '16px',
      color: '#64748b',
      margin: 0,
      lineHeight: '1.6',
    },
    divider: {
      width: '80px',
      height: '4px',
      background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
      borderRadius: '2px',
      marginTop: '24px',
    },
    cardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      gap: '24px',
    },
    card: (isHovered, color) => ({
      backgroundColor: '#ffffff',
      border: `2px solid ${isHovered ? color : '#e2e8f0'}`,
      borderRadius: '16px',
      padding: '32px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      boxShadow: isHovered 
        ? `0 20px 40px ${color}25, 0 0 0 1px ${color}10` 
        : '0 2px 8px rgba(0, 0, 0, 0.04)',
    }),
    cardTopBar: (gradient, isHovered) => ({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '5px',
      background: gradient,
      opacity: isHovered ? 1 : 0.6,
      transition: 'opacity 0.3s ease',
    }),
    cardContent: {
      paddingTop: '8px',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: '20px',
    },
    iconWrapper: (color, isHovered) => ({
      width: '64px',
      height: '64px',
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `${color}10`,
      color: color,
      transition: 'all 0.3s ease',
      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    }),
    arrowWrapper: (isHovered) => ({
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      transition: 'all 0.3s ease',
      transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
    }),
    cardTitle: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#0f172a',
      margin: '0 0 12px 0',
      letterSpacing: '-0.3px',
    },
    cardDescription: {
      fontSize: '15px',
      color: '#64748b',
      lineHeight: '1.6',
      margin: 0,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>Admin Portal</h1>
            <p style={styles.subtitle}>
              Centralized management system for your platform
            </p>
          </div>
          <div style={styles.divider} />
        </div>

        {/* Main Cards */}
        <div style={styles.cardsGrid}>
          {adminCards.map((card) => {
            const Icon = card.icon;
            const isHovered = hoveredCard === card.id;

            return (
              <div
                key={card.id}
                style={styles.card(isHovered, card.color)}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleNavigation(card.route)}
              >
                <div style={styles.cardTopBar(card.gradient, isHovered)} />
                
                <div style={styles.cardContent}>
                  <div style={styles.cardHeader}>
                    <div style={styles.iconWrapper(card.color, isHovered)}>
                      <Icon size={32} strokeWidth={1.5} />
                    </div>
                    <div style={styles.arrowWrapper(isHovered)}>
                      <ArrowRight size={20} color="#475569" />
                    </div>
                  </div>

                  <h3 style={styles.cardTitle}>{card.title}</h3>
                  <p style={styles.cardDescription}>{card.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminLandingPage;