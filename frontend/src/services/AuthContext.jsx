import { createContext, useContext, useState, useEffect } from "react";
import api from "./api"; // axios wrapper

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Initialize user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    
    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // ✅ Set the authorization header for future requests
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        // ✅ Optionally verify token is still valid
        const verifyToken = async () => {
          try {
            await api.get("/auth/verify");
            console.log("Token is valid");
          } catch (err) {
            console.error("Token validation failed:", err);
            // Don't logout here, let the interceptor handle it
          }
        };
        
        verifyToken();
        
      } catch (err) {
        console.error("Error parsing saved user:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
  }, []);

  const login = async (credentials) => {
    try {
      const res = await api.post("/auth/login", credentials);
      const { user, token, refreshToken } = res.data.data || {};
      if (!user || !token) return { success: false, error: "Malformed login response" };
      
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      
      setUser(user);
      return { success: true, user };
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid credentials";
      return { success: false, error: msg };
    }
  };

  const register = async (data) => {
    try {
      const res = await api.post("/auth/register", data);
      const { user, token, refreshToken } = res.data.data || {};
      if (!user || !token) return { success: false, error: "Malformed registration response" };
      
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      
      setUser(user);
      return { success: true, user };
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed";
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      // ✅ Call backend logout endpoint to invalidate tokens
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // ✅ Always clear local storage and user state
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
    }
  };

  const isAuthenticated = !!user;
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ custom hook for cleaner usage
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
