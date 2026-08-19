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

export const fetchMyPasses = async (token) => {
  const response = await fetch("/api/passes/my", {
    headers: getHeaders(token)
  });
  return handleResponse(response);
};

export const fetchPassById = async (id, token) => {
  const response = await fetch(`/api/passes/${id}`, {
    headers: getHeaders(token)
  });
  return handleResponse(response);
};

export const submitPassApplication = async (applicationData, token) => {
  const response = await fetch("/api/applications/apply", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(applicationData)
  });
  return handleResponse(response);
};

export const submitPassRenewal = async (renewalData, token) => {
  const response = await fetch("/api/applications/renew", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(renewalData)
  });
  return handleResponse(response);
};

export const fetchMyApplications = async (token) => {
  const response = await fetch("/api/applications/my", {
    headers: getHeaders(token)
  });
  return handleResponse(response);
};
