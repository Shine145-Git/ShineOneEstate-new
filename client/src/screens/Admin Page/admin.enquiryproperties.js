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
} from "lucide-react";
import TopNavigationBar from "../Dashboard/TopNavigationBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminEnquiryProperties = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
    container: {
      minHeight: "100vh",
      backgroundColor: "#F4F7F9",
      padding: "24px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      padding: "24px 32px",
      marginBottom: "24px",
      boxShadow: "0 2px 8px rgba(0, 51, 102, 0.08)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#003366",
      margin: 0,
    },
    statsContainer: {
      display: "flex",
      gap: "16px",
      alignItems: "center",
    },
    statBadge: {
      backgroundColor: "#22D3EE",
      color: "#003366",
      padding: "8px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
    },
    refreshButton: {
      backgroundColor: "#00A79D",
      color: "#FFFFFF",
      border: "none",
      padding: "10px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.3s ease",
    },
    mainCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0, 51, 102, 0.08)",
        overflow: "hidden",
      marginTop: "100px",
    },
    tableContainer: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    thead: {
      backgroundColor: "#003366",
    },
    th: {
      color: "#FFFFFF",
      padding: "16px",
      textAlign: "left",
      fontSize: "13px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    tr: {
      borderBottom: "1px solid #F4F7F9",
      transition: "background-color 0.2s ease",
    },
    td: {
      padding: "16px",
      color: "#333333",
      fontSize: "14px",
    },
    propertyInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    propertyAddress: {
      fontWeight: "600",
      color: "#003366",
      marginBottom: "4px",
    },
    propertyDetail: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px",
      color: "#4A6A8A",
    },
    userInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    userName: {
      fontWeight: "600",
      color: "#003366",
    },
    contactInfo: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px",
      color: "#4A6A8A",
    },
    message: {
      maxWidth: "250px",
      lineHeight: "1.5",
      color: "#333333",
    },
    deleteButton: {
      backgroundColor: "#dc2626",
      color: "#FFFFFF",
      border: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      transition: "all 0.3s ease",
    },
    viewDetailsButton: {
      backgroundColor: "#2563EB",
      color: "#FFFFFF",
      border: "none",
      padding: "8px 14px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
      transition: "all 0.3s ease",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "60px",
    },
    spinner: {
      width: "48px",
      height: "48px",
      border: "4px solid #F4F7F9",
      borderTop: "4px solid #00A79D",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#4A6A8A",
    },
    errorState: {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
      padding: "16px 24px",
      borderRadius: "8px",
      margin: "16px",
      fontSize: "14px",
    },
    price: {
      fontWeight: "700",
      color: "#00A79D",
      fontSize: "15px",
    },
    date: {
      fontSize: "13px",
      color: "#4A6A8A",
    },
  };

  return (
      <div>
        <TopNavigationBar user={user} onLogout={handleLogout} navItems={navItems} />
      

      

      <div style={styles.mainCard}>
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
          </div>
        )}

        {error && (
          <div style={styles.errorState}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && enquiries.length === 0 && (
          <div style={styles.emptyState}>
            <h3>No enquiries found</h3>
            <p>When customers submit enquiries, they will appear here.</p>
          </div>
        )}

        {!loading && !error && enquiries.length > 0 && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>Property Details</th>
                  <th style={styles.th}>Customer Information</th>
                  <th style={styles.th}>Message</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>View Details</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry, index) => (
                  <tr
                    key={enquiry._id}
                    style={{
                      ...styles.tr,
                      backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F4F7F9",
                    }}
                  >
                    <td style={styles.td}>
  <div style={styles.propertyInfo}>
    <div style={styles.propertyAddress}>
      <MapPin size={14} style={{ display: "inline", marginRight: "4px" }} />
      {enquiry.propertyAddress || "N/A"}
    </div>
    <div style={styles.propertyDetail}>
      <Home size={14} />
      {enquiry.propertyType || "N/A"}
    </div>
    <div style={styles.price}>
      <DollarSign size={14} style={{ display: "inline" }} />
      {enquiry.propertyPrice ? enquiry.propertyPrice.toLocaleString() : "N/A"}
    </div>
  </div>
</td>
                    <td style={styles.td}>
                      <div style={styles.userInfo}>
                        <div style={styles.contactInfo}>
                          <Mail size={14} />
                          {enquiry.userEmail || "N/A"}{" "}
                          {/* directly use userEmail */}
                        </div>
                        <div style={styles.contactInfo}>
                          <Phone size={14} />
                          {enquiry.userMobile || "N/A"}{" "}
                          {/* directly use userMobile */}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.message}>
                        {enquiry.message || "No message provided"}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.date}>
                        <Calendar
                          size={14}
                          style={{ display: "inline", marginRight: "4px" }}
                        />
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                        <br />
                        {new Date(enquiry.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {enquiry.propertyId ? (
                        <button
                          style={styles.viewDetailsButton}
                          onClick={async () => {
                            try {
                              // Try fetching from RentalProperty API
                              let res = await fetch(`${process.env.REACT_APP_RENTAL_PROPERTY_DETAIL_API}/${enquiry.propertyId}`, { credentials: 'include' });
                              let property = null;
                              if (res.ok) {
                                property = await res.json();
                                if (property && property.monthlyRent != null) {
                                  navigate(`/Rentaldetails/${enquiry.propertyId}`);
                                  return;
                                }
                              }
                              // If not rental, try SaleProperty API
                              res = await fetch(`${process.env.REACT_APP_SALE_PROPERTY_API}/${enquiry.propertyId}`, { credentials: 'include' });
                              if (res.ok) {
                                property = await res.json();
                                if (property && property.price != null) {
                                  navigate(`/Saledetails/${enquiry.propertyId}`);
                                  return;
                                }
                              }
                              alert("Property type could not be determined.");
                            } catch (err) {
                              console.error("Error fetching property details:", err);
                              alert("Failed to fetch property details");
                            }
                          }}
                        >
                          View Details
                        </button>
                      ) : null}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.deleteButton}
                        onClick={() => deleteEnquiry(enquiry._id)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEnquiryProperties;
