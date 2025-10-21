import { useState, useEffect } from "react";
import axios from "axios";
import { Check, X, Home, Gift, Bell } from "lucide-react";
import TopNavigationBar from "../Dashboard/TopNavigationBar";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("approvals");
  const [approvals, setApprovals] = useState([]);
  const [properties, setProperties] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [bulkFile, setBulkFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch all properties when Properties tab is active
  useEffect(() => {
    if (activeTab === "properties") {
      fetchAllProperties();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // Fetch approved payments for rewards tab
  useEffect(() => {
    if (activeTab === "rewards") {
      fetchApprovedPayments();
    }
  }, [activeTab]);
  useEffect(() => {
    if (activeTab === "approvals") {
      fetchPendingPayments();
    }
  }, [activeTab]);

  const fetchAllProperties = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_ADMIN_GET_PROPERTIES_API}`,
        {
          withCredentials: true,
        }
      );
      setProperties(response.data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const fetchApprovedPayments = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_ADMIN_APPROVED_PAYMENTS_API}`,
        { withCredentials: true }
      );
      const rewardsData = response.data.map((p, index) => ({
        id: index + 1,
        email: p.resident?.email || "N/A",
        points: 0,
        tier: "New",
        eligible: true,
      }));
      setRewards(rewardsData);
      console.log("Approved payments fetched for rewards:", rewardsData);
    } catch (error) {
      console.error("Error fetching approved payments:", error);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_ADMIN_PENDING_PAYMENTS_API}`,
        { withCredentials: true }
      );
      setApprovals(response.data);
    } catch (error) {
      console.error("Error fetching pending payments:", error);
    }
  };

  const handleApproval = async (id, action) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_ADMIN_UPDATE_PAYMENT_STATUS_API}`,
        { paymentId: id, status: action },
        { withCredentials: true }
      );
      fetchPendingPayments();
      // No rewards update here; rewards are fetched dynamically when rewards tab is opened
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const distributeReward = async (id) => {
    try {
      const selectedReward = rewards.find((item) => item.id === id);
      if (!selectedReward) return;

      await axios.post(
        `${process.env.REACT_APP_ADMIN_DISTRIBUTE_REWARD_API}`,
        { email: selectedReward.email },
        { withCredentials: true }
      );

      setRewards(
        rewards.map((item) =>
          item.id === id ? { ...item, eligible: false } : item
        )
      );

      alert(`Reward distributed successfully to ${selectedReward.email}`);
    } catch (error) {
      console.error("Error distributing reward:", error);
      alert("Failed to distribute reward.");
    }
  };
  const handleBulkUpload = async () => {
    if (!bulkFile) {
      alert("Please select a file first");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", bulkFile);

      const response = await axios.post(
        `${process.env.REACT_APP_ADMIN_BULK_UPLOAD_PROPERTIES_API}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert(response.data.message);
      // Optionally, refresh the properties tab
      if (activeTab === "properties") fetchAllProperties();
    } catch (error) {
      console.error("Bulk upload error:", error);
      alert(error.response?.data?.message || "Error uploading file");
    } finally {
      setUploading(false);
      setBulkFile(null);
    }
  };


  const handleLogout = async () => {
    await fetch("http://localhost:2000/auth/logout", {
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
        if (res.ok) {
          // Check user role
          if (data.role !== "admin") {
            alert("You are not authorized to access this page");
            navigate("/login"); // redirect non-admin users
            return;
          }
          setUser(data);
        } else {
          navigate("/login"); // redirect if not logged in
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/login"); // redirect on error
      }
    };
    fetchUser();
  }, []);

  const navItems = ["For Buyers", "For Tenants", "For Owners", "For Dealers / Builders", "Insights"];
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #003366 0%, #4A6A8A 100%)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      
      <TopNavigationBar navItems={navItems} user={user} handleLogout={handleLogout} />
      {/* Navigation Tabs */}
      <div
        style={{
          background: "#F4F7F9",
          padding: "0 40px",
          display: "flex",
          gap: "10px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        {[
          { id: "approvals", label: "Approvals", icon: Bell },
          { id: "properties", label: "Properties", icon: Home },
          { id: "rewards", label: "Rewards", icon: Gift },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? "#003366" : "transparent",
              color: activeTab === tab.id ? "#FFFFFF" : "#333333",
              border: "none",
              padding: "15px 25px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              borderBottom:
                activeTab === tab.id
                  ? "3px solid #22D3EE"
                  : "3px solid transparent",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: "40px" }}>
        {/* Approvals Tab */}
        {activeTab === "approvals" && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "12px",
              padding: "30px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                color: "#003366",
                fontSize: "24px",
                marginBottom: "25px",
                fontWeight: "700",
              }}
            >
              Pending Approvals
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {approvals.map((approval) => (
                <div
                  key={approval._id}
                  style={{
                    background: "#F4F7F9",
                    padding: "20px",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "2px solid #E5E7EB",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        color: "#333333",
                        fontSize: "18px",
                        margin: "5px 0",
                        fontWeight: "600",
                      }}
                    >
                      {approval.propertyName}
                    </h3>
                    <p
                      style={{
                        color: "#4A6A8A",
                        fontSize: "14px",
                        margin: "5px 0",
                      }}
                    >
                      Resident: {approval.residentName}
                    </p>
                    <p
                      style={{
                        color: "#4A6A8A",
                        fontSize: "14px",
                        margin: "5px 0",
                      }}
                    >
                      Amount: {approval.amount}
                    </p>
                    <p
                      style={{
                        color: "#4A6A8A",
                        fontSize: "14px",
                        margin: "5px 0",
                      }}
                    >
                      Payment Method: {approval.paymentMethod}
                    </p>
                    {approval.status !== "pending" && (
                      <span
                        style={{
                          color:
                            approval.status === "approved"
                              ? "#00A79D"
                              : "#DC2626",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        {approval.status === "approved"
                          ? "✓ Approved"
                          : "✗ Rejected"}
                      </span>
                    )}
                  </div>
                  {approval.status === "pending" && (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleApproval(approval._id, "approved")}
                        style={{
                          background: "#00A79D",
                          color: "#FFFFFF",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.background = "#008C84")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.background = "#00A79D")
                        }
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        onClick={() => handleApproval(approval._id, "rejected")}
                        style={{
                          background: "#DC2626",
                          color: "#FFFFFF",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.background = "#B91C1C")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.background = "#DC2626")
                        }
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "12px",
              padding: "30px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            {activeTab === "properties" && (
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ color: "#003366", fontWeight: 600 }}>
                  Bulk Upload Properties
                </h3>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setBulkFile(e.target.files[0])}
                  style={{ marginRight: "10px" }}
                />
                <button
                  onClick={handleBulkUpload}
                  disabled={uploading}
                  style={{
                    background: "#00A79D",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: uploading ? "not-allowed" : "pointer",
                    fontWeight: 600,
                  }}
                >
                  {uploading ? "Uploading..." : "Upload Excel"}
                </button>
              </div>
            )}
            <h2
              style={{
                color: "#003366",
                fontSize: "24px",
                marginBottom: "25px",
                fontWeight: "700",
              }}
            >
              All Properties
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {properties.map((property) => (
                <div
                  key={property._id || property.id}
                  style={{
                    background: "#F4F7F9",
                    padding: "20px",
                    borderRadius: "8px",
                    border: "2px solid #E5E7EB",
                    transition: "all 0.3s ease",
                  }}
                >
                  {property.images?.[0] && (
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        marginBottom: "12px",
                      }}
                    />
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "12px",
                    }}
                  >
                    <Home size={24} color="#00A79D" />
                    <span
                      style={{
                        background:
                          property.status === "Active" ? "#00A79D" : "#4A6A8A",
                        color: "#FFFFFF",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {property.status}
                    </span>
                  </div>
                  <h3
                    style={{
                      color: "#333333",
                      fontSize: "18px",
                      margin: "10px 0",
                      fontWeight: "600",
                    }}
                  >
                    {property.name}
                  </h3>
                  <p
                    style={{
                      color: "#4A6A8A",
                      fontSize: "14px",
                      margin: "8px 0",
                    }}
                  >
                    Owner: {property.owner?.name || "N/A"} <br />
                    Email: {property.owner?.email || "N/A"}
                  </p>
                  <p
                    style={{
                      color: "#4A6A8A",
                      fontSize: "14px",
                      margin: "8px 0",
                    }}
                  >
                    Location: {property.location}
                  </p>
                  <p
                    style={{
                      color: "#003366",
                      fontSize: "20px",
                      fontWeight: "700",
                      margin: "12px 0 0 0",
                    }}
                  >
                    {typeof property.monthlyRent === "number"
                      ? `$${property.monthlyRent.toLocaleString()}`
                      : `$${property.monthlyRent || "N/A"}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === "rewards" && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "12px",
              padding: "30px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                color: "#003366",
                fontSize: "24px",
                marginBottom: "25px",
                fontWeight: "700",
              }}
            >
              Rewards Distribution
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  style={{
                    background: "#F4F7F9",
                    padding: "20px",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "2px solid #E5E7EB",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        background: "#22D3EE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#003366",
                        fontWeight: "700",
                        fontSize: "18px",
                      }}
                    >
                      {reward.email
                        ? reward.email.split("@")[0].slice(0, 2).toUpperCase()
                        : "NA"}
                    </div>
                    <div>
                      <h3
                        style={{
                          color: "#333333",
                          fontSize: "18px",
                          margin: "0 0 5px 0",
                          fontWeight: "600",
                        }}
                      >
                        {reward.email}
                      </h3>
                      <p
                        style={{
                          color: "#4A6A8A",
                          fontSize: "14px",
                          margin: 0,
                        }}
                      >
                        Points: {reward.points} | Tier:{" "}
                        <span style={{ fontWeight: "600" }}>{reward.tier}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => distributeReward(reward.id)}
                    disabled={!reward.eligible}
                    style={{
                      background: reward.eligible ? "#00A79D" : "#E5E7EB",
                      color: reward.eligible ? "#FFFFFF" : "#9CA3AF",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "6px",
                      cursor: reward.eligible ? "pointer" : "not-allowed",
                      fontSize: "14px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Gift size={16} />{" "}
                    {reward.eligible ? "Distribute" : "Distributed"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
