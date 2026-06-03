const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Profile request failed.");
  }

  return data;
};

export const getProfile = async ({ mobile, role }) => {
  const params = new URLSearchParams({ role: role || "" });
  const response = await fetch(`/api/profiles/${mobile}?${params.toString()}`);
  return parseResponse(response);
};

export const saveProfile = async (profile) => {
  const response = await fetch("/api/profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });

  return parseResponse(response);
};

export const updateProfileByMobile = async (mobile, profile) => {
  const response = await fetch(`/api/profiles/${mobile}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });

  return parseResponse(response);
};
