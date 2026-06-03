const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Authentication request failed.");
  }

  return data.data;
};

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
      businessName: authData.user.business_name || "",
      businessType: authData.user.business_type || role,
      createdAt: authData.user.created_at,
    },
  };
};

export const loginWithMobile = async (mobileNumber) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mobile_number: mobileNumber }),
  });

  return toFrontendUser(await parseResponse(response));
};

export const registerUser = async (formData) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: formData.name,
      mobile_number: formData.mobile,
      role: formData.role,
      location: formData.location,
      business_name: formData.businessName,
      business_type: formData.businessType,
    }),
  });

  return toFrontendUser(await parseResponse(response));
};

export const getLoggedInUser = async (token) => {
  const response = await fetch("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
};
