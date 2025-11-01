import React, { useEffect, useState } from "react";
import {
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  MapPin,
  Home,
  Eye,
  MessageSquare,
  Filter,
  Download,
} from "lucide-react";
import TopNavigationBar from "../Dashboard/TopNavigationBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminEnquiryProperties = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchEnquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_Base_API}/api/enquiry`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`Error fetching enquiries: ${response.statusText}`);
      }
      const data = await response.json();
      setEnquiries(data.enquiries || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch(process.env.REACT_APP_LOGOUT_API, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_USER_ME_API}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) setUser(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  const navItems = ["For Buyers", "For Tenants", "For Owners", "For Dealers / Builders", "Insights"];

  const deleteEnquiry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?"))
      return;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_Base_API}/api/enquiry/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`Error deleting enquiry: ${response.statusText}`);
      }
      setEnquiries(enquiries.filter((enquiry) => enquiry._id !== id));
    } catch (err) {
      alert(`Failed to delete enquiry: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const styles = {
    pageWrapper: {
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      paddingTop: "80px",
    },
    container: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "32px 24px",
    },
    header: {
      marginBottom: "32px",
    },
    headerTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
    },
    titleSection: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    title: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0,
      letterSpacing: "-0.5px",
    },
    subtitle: {
      fontSize: "15px",
      color: "#64748b",
      margin: 0,
    },
    headerActions: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
    },
    refreshButton: {
      backgroundColor: "#ffffff",
      color: "#475569",
      border: "1px solid #e2e8f0",
      padding: "10px 18px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.2s ease",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    },
    statsBar: {
      display: "flex",
      gap: "16px",
      padding: "20px 24px",
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      border: "1px solid #e2e8f0",
    },
    statCard: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    statLabel: {
      fontSize: "13px",
      color: "#64748b",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    statValue: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#0f172a",
    },
    mainCard: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
    },
    tableWrapper: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
    },
    thead: {
      backgroundColor: "#f8fafc",
      borderBottom: "2px solid #e2e8f0",
    },
    th: {
      color: "#475569",
      padding: "16px 20px",
      textAlign: "left",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.8px",
      whiteSpace: "nowrap",
    },
    tr: {
      borderBottom: "1px solid #f1f5f9",
      transition: "background-color 0.15s ease",
    },
    td: {
      padding: "20px",
      color: "#334155",
      fontSize: "14px",
      verticalAlign: "top",
    },
    propertyCard: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      minWidth: "280px",
    },
    propertyHeader: {
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
      paddingBottom: "8px",
      borderBottom: "1px solid #f1f5f9",
    },
    propertyAddress: {
      fontWeight: "600",
      color: "#0f172a",
      fontSize: "14px",
      lineHeight: "1.4",
      flex: 1,
    },
    propertyDetails: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    propertyDetail: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "13px",
      color: "#64748b",
    },
    propertyIcon: {
      color: "#94a3b8",
      flexShrink: 0,
    },
    price: {
      fontWeight: "700",
      color: "#10b981",
      fontSize: "16px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    userCard: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      minWidth: "220px",
    },
    contactRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "13px",
      color: "#475569",
      padding: "6px 0",
    },
    contactIcon: {
      color: "#94a3b8",
      flexShrink: 0,
    },
    messageBox: {
      maxWidth: "300px",
      minWidth: "200px",
    },
    messageContent: {
      backgroundColor: "#f8fafc",
      padding: "12px 14px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      fontSize: "13px",
      lineHeight: "1.6",
      color: "#475569",
    },
    dateBox: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      fontSize: "13px",
      color: "#64748b",
      minWidth: "140px",
    },
    dateRow: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    actionButtons: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      minWidth: "120px",
    },
    viewButton: {
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      border: "none",
      padding: "8px 14px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      transition: "all 0.2s ease",
      whiteSpace: "nowrap",
    },
    deleteButton: {
      backgroundColor: "#ffffff",
      color: "#ef4444",
      border: "1px solid #fee2e2",
      padding: "8px 14px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      transition: "all 0.2s ease",
      whiteSpace: "nowrap",
    },
    loadingContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "80px 20px",
      gap: "20px",
    },
    spinner: {
      width: "48px",
      height: "48px",
      border: "4px solid #f1f5f9",
      borderTop: "4px solid #3b82f6",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    },
    loadingText: {
      color: "#64748b",
      fontSize: "14px",
      fontWeight: "500",
    },
    emptyState: {
      textAlign: "center",
      padding: "80px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "16px",
    },
    emptyIcon: {
      width: "64px",
      height: "64px",
      backgroundColor: "#f1f5f9",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "8px",
    },
    emptyTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#0f172a",
      margin: 0,
    },
    emptyDescription: {
      fontSize: "14px",
      color: "#64748b",
      margin: 0,
    },
    errorState: {
      backgroundColor: "#fef2f2",
      color: "#991b1b",
      padding: "16px 20px",
      margin: "20px",
      borderRadius: "10px",
      border: "1px solid #fee2e2",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
  };

  const keyframesStyle = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    .fade-out {
      animation: fadeOut 0.4s ease-in forwards;
    }
  `;

  return (
    <div style={styles.pageWrapper}>
      <style>{keyframesStyle}</style>
      {/* <TopNavigationBar user={user} onLogout={handleLogout} navItems={navItems} /> */}

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div style={styles.titleSection}>
              <h1 style={styles.title}>Property Enquiries</h1>
              <p style={styles.subtitle}>Manage and track all customer enquiries</p>
            </div>
            <div style={styles.headerActions}>
              <button
                style={styles.refreshButton}
                onClick={fetchEnquiries}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
          
          <div style={styles.statsBar}>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Total Enquiries</span>
              <span style={styles.statValue}>{enquiries.length}</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>This Month</span>
              <span style={styles.statValue}>
                {enquiries.filter(e => {
                  const date = new Date(e.createdAt);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length}
              </span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Today</span>
              <span style={styles.statValue}>
                {enquiries.filter(e => {
                  const date = new Date(e.createdAt);
                  const now = new Date();
                  return date.toDateString() === now.toDateString();
                }).length}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.mainCard}>
          {loadingProperty && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255,255,255,0.8)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999
            }}>
              <div style={styles.spinner}></div>
              <span style={styles.loadingText}>Loading property details...</span>
            </div>
          )}
          {loading && (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <span style={styles.loadingText}>Loading enquiries...</span>
            </div>
          )}

          {error && (
            <div style={styles.errorState}>
              <strong>⚠</strong> {error}
            </div>
          )}

          {!loading && !error && enquiries.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <MessageSquare size={32} color="#94a3b8" />
              </div>
              <h3 style={styles.emptyTitle}>No enquiries yet</h3>
              <p style={styles.emptyDescription}>
                When customers submit enquiries, they will appear here.
              </p>
            </div>
          )}

          {!loading && !error && enquiries.length > 0 && (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.thead}>
                  <tr>
                    <th style={styles.th}>Property</th>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Message</th>
                    <th style={styles.th}>Date & Time</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((enquiry, index) => (
                    <tr
                      key={enquiry._id}
                      style={styles.tr}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#ffffff";
                      }}
                    >
                      <td style={styles.td}>
                        <div style={styles.propertyCard}>
                          <div style={styles.propertyHeader}>
                            <MapPin size={16} style={styles.propertyIcon} />
                            <span style={styles.propertyAddress}>
                              {enquiry.propertyAddress || "N/A"}
                            </span>
                          </div>
                          <div style={styles.propertyDetails}>
                            <div style={styles.propertyDetail}>
                              <Home size={14} style={styles.propertyIcon} />
                              <span>{enquiry.propertyType || "N/A"}</span>
                            </div>
                            <div style={styles.price}>
                              <DollarSign size={16} />
                              {enquiry.propertyPrice ? enquiry.propertyPrice.toLocaleString() : "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.userCard}>
                          <div style={styles.contactRow}>
                            <Mail size={14} style={styles.contactIcon} />
                            <span>{enquiry.userEmail || "N/A"}</span>
                          </div>
                          <div style={styles.contactRow}>
                            <Phone size={14} style={styles.contactIcon} />
                            <span>{enquiry.userMobile || "N/A"}</span>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.messageBox}>
                          <div style={styles.messageContent}>
                            {enquiry.message || "No message provided"}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.dateBox}>
                          <div style={styles.dateRow}>
                            <Calendar size={14} style={styles.contactIcon} />
                            {new Date(enquiry.createdAt).toLocaleDateString()}
                          </div>
                          <div style={{paddingLeft: "22px", fontSize: "12px", color: "#94a3b8"}}>
                            {new Date(enquiry.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          {enquiry.propertyId && (
                            <button
                              style={styles.viewButton}
                              onClick={() => {
                                const propertyId = enquiry.propertyId;
                                const type = enquiry.propertyType;

                                if (type === "rental") {
                                  navigate(`/Rentaldetails/${propertyId}`);
                                } else if (type === "sale") {
                                  navigate(`/Saledetails/${propertyId}`);
                                } else {
                                  alert("⚠️ Could not determine property type.");
                                }
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#2563eb";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#3b82f6";
                              }}
                            >
                              <Eye size={14} />
                              View
                            </button>
                          )}
                          <button
                            style={styles.deleteButton}
                            onClick={() => deleteEnquiry(enquiry._id)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#fef2f2";
                              e.currentTarget.style.borderColor = "#fecaca";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#ffffff";
                              e.currentTarget.style.borderColor = "#fee2e2";
                            }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEnquiryProperties;