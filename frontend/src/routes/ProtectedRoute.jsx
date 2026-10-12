
import { Center, Spinner } from "@chakra-ui/react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Center minH="100vh" bg="khaki.50">
        <Spinner
          size="lg"
          color="brand.600"
          borderWidth="3px"
        />
      </Center>
    );
  }

  // Send unauthenticated users to the common login page.
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Prevent admins from entering student-only pages.
  if (user?.role !== "student") {
    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;