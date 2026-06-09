import api from "./api/apiClient";

const normalizeRole = (role = "") => role.toLowerCase();

export const toFrontendUser = (authData) => {
  const role = normalizeRole(authData.role);

  return {
    token: authData.access_token,
    tokenType: authData.token_type,
    role,
    redirectTo: authData.redirect_to,
    mobile: authData.user.mobile_number,
    uniqueUserId: authData.user.unique_user_id,
    profile: {
      id: authData.user.id,
      uniqueUserId: authData.user.unique_user_id,
      name: authData.user.name,
      mobile: authData.user.mobile_number,
      role,
      location: authData.user.location || "",
      email: authData.user.email || "",
      businessName: authData.user.business_name || "",
      businessType: authData.user.business_type || role,
      specialty: authData.user.specialty || "",
      availability: authData.user.availability || "Available",
      about: authData.user.about || "",
      image: authData.user.profile_image || "",
      createdAt: authData.user.created_at,
      updatedAt: authData.user.updated_at,
    },
  };
};

export const loginWithMobile = async (mobileNumber) => {
  const response = await api.post("/api/auth/login", {
    mobile_number: mobileNumber,
  });

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Authentication request failed.");
  }

  return toFrontendUser(response.data.data);
};

export const registerUser = async (formData) => {
  const response = await api.post("/api/auth/register", {
    name: formData.name,
    mobile_number: formData.mobile,
    email: formData.email,
    role: formData.role,
    location: formData.location,
    business_name: formData.businessName,
    business_type: formData.businessType,
  });

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Registration request failed.");
  }

  return toFrontendUser(response.data.data);
};

export const getLoggedInUser = async (token) => {
  const response = await api.get("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to fetch logged in user.");
  }

  return response.data.data;
};
