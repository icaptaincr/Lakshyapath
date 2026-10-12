import { Navigate, Outlet } from "react-router-dom";

function AdminProtectedRoute() {
  const token = localStorage.getItem("lakshyapath_token");
  const savedUser = localStorage.getItem("lakshyapath_user");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default AdminProtectedRoute;