import api from "./api/apiClient";

const toProfile = (user) => ({
  id: user.id,
  uniqueUserId: user.unique_user_id,
  name: user.name || "",
  mobile: user.mobile_number || "",
  email: user.email || "",
  role: (user.role || "").toLowerCase(),
  location: user.location || "",
  businessName: user.business_name || "",
  businessType: user.business_type || "",
  specialty: user.specialty || "",
  availability: user.availability || "Available",
  about: user.about || "",
  image: user.profile_image || "",
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

export const getProfile = async (token) => {
  const response = await api.get("/api/profile/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Profile request failed.");
  }

  return toProfile(response.data.data);
};

export const updateProfile = async (token, profile) => {
  const response = await api.put(
    "/api/profile/me",
    {
      name: profile.name,
      email: profile.email,
      location: profile.location,
      business_name: profile.businessName,
      business_type: profile.businessType,
      specialty: profile.specialty,
      availability: profile.availability,
      about: profile.about,
      profile_image: profile.image,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Profile update failed.");
  }

  return toProfile(response.data.data);
};
