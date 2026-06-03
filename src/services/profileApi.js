const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Profile request failed.");
  }

  return data.data;
};

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
  const response = await fetch("/api/profile/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return toProfile(await parseResponse(response));
};

export const updateProfile = async (token, profile) => {
  const response = await fetch("/api/profile/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: profile.name,
      email: profile.email,
      location: profile.location,
      business_name: profile.businessName,
      business_type: profile.businessType,
      specialty: profile.specialty,
      availability: profile.availability,
      about: profile.about,
      profile_image: profile.image,
    }),
  });

  return toProfile(await parseResponse(response));
};
