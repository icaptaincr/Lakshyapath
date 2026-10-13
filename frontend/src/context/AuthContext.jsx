
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the logged-in user when the application loads.
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("lakshyapath_token");
      const savedUser = localStorage.getItem("lakshyapath_user");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Restore an admin session from the saved user.
        // The existing profile endpoint is student-only.
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);

          if (parsedUser.role === "admin") {
            setUser(parsedUser);
            return;
          }
        }

        // Restore and refresh student details from the API.
        const response = await api.get("/auth/profile");
        const currentUser = response.data.user;

        if (currentUser?.role !== "student") {
          throw new Error("Invalid student session");
        }

        setUser(currentUser);
        localStorage.setItem(
          "lakshyapath_user",
          JSON.stringify(currentUser)
        );
      } catch (error) {
        localStorage.removeItem("lakshyapath_token");
        localStorage.removeItem("lakshyapath_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Common login for both students and admins.
  const login = async (email, password) => {
    const response = await api.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });

    const { token, user: loggedInUser } = response.data;

    if (!token || !loggedInUser || !loggedInUser.role) {
      throw new Error("Invalid login response from server");
    }

    if (
      loggedInUser.role !== "student" &&
      loggedInUser.role !== "admin"
    ) {
      throw new Error("Unrecognized account role");
    }

    // Remove legacy admin-specific session keys.
    localStorage.removeItem("lakshyapath_admin_token");
    localStorage.removeItem("lakshyapath_admin_user");

    // Store one common session.
    localStorage.setItem("lakshyapath_token", token);
    localStorage.setItem(
      "lakshyapath_user",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);

    return response.data;
  };

  // Common logout for both roles.
  const logout = () => {
    localStorage.removeItem("lakshyapath_token");
    localStorage.removeItem("lakshyapath_user");

    // Clean up previous admin session keys, if present.
    localStorage.removeItem("lakshyapath_admin_token");
    localStorage.removeItem("lakshyapath_admin_user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}