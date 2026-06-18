
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const normalizeRole = (value) => String(value || "").toLowerCase();

const normalizeStoredUser = (storedUser) => {
  if (!storedUser) {
    return null;
  }

  return {
    ...storedUser,
    role: normalizeRole(storedUser.role),
    profile: storedUser.profile
      ? {
          ...storedUser.profile,
          role: normalizeRole(storedUser.profile.role || storedUser.role),
        }
      : storedUser.profile,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    normalizeStoredUser(JSON.parse(localStorage.getItem("user")))
  );

  const login = (data) => {
    const normalizedUser = normalizeStoredUser(data);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const setUserProfile = (profileData) => {
    if (!user?.mobile) {
      return;
    }

    const updatedUser = {
      ...user,
      profile: {
        ...profileData,
        role: normalizeRole(profileData.role || user.role),
      },
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
