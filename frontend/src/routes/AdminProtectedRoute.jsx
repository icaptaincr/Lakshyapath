import { Navigate, Outlet } from "react-router-dom";

function AdminProtectedRoute() {
  const token = localStorage.getItem("lakshyapath_admin_token");
  const admin = localStorage.getItem("lakshyapath_admin_user");

  if (!token || !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export default AdminProtectedRoute;
