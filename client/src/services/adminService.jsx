const getHeaders = (token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { message: text || "Server response could not be parsed" };
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
};

export const fetchAdminStats = async (token) => {
  const response = await fetch("/api/admin/stats", {
    headers: getHeaders(token)
  });
  return handleResponse(response);
};

export const fetchAllApplications = async (status = "All", search = "", token) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (search) params.append("search", search);

  const response = await fetch(`/api/admin/applications?${params.toString()}`, {
    headers: getHeaders(token)
  });
  return handleResponse(response);
};

export const updateApplicationStatus = async (id, statusData, token) => {
  const response = await fetch(`/api/admin/applications/${id}/status`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(statusData)
  });
  return handleResponse(response);
};

export const fetchAllUsers = async (token) => {
  const response = await fetch("/api/users", {
    headers: getHeaders(token)
  });
  return handleResponse(response);
};

export const deleteUserAccount = async (id, token) => {
  const response = await fetch(`/api/users/${id}`, {
    method: "DELETE",
    headers: getHeaders(token)
  });
  return handleResponse(response);
};

export const fetchAllPasses = async (token) => {
  const response = await fetch("/api/admin/passes", {
    headers: getHeaders(token)
  });
  return handleResponse(response);
};

export const revokeUserPass = async (id, token) => {
  const response = await fetch(`/api/admin/passes/${id}/revoke`, {
    method: "PUT",
    headers: getHeaders(token)
  });
  return handleResponse(response);
};
