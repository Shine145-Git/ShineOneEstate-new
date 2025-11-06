import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ element }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_USER_ME_API, {
          credentials: "include",
        });

        if (!response.ok) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        if (data?.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error verifying admin:", err);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdmin();
  }, []);

  if (isLoading) {
    return <div style={{ textAlign: "center", marginTop: "100px" }}>Checking access...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default AdminProtectedRoute;
