const API_BASE = "/api";

export async function fileComplaint(payload) {
  const res = await fetch(`${API_BASE}/agent/file-complaint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Network error" }));
    throw new Error(err.detail || "Failed to file complaint");
  }
  return res.json();
}

export async function sendChatMessage(message, attachedImage = null) {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, attached_image: attachedImage }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Chat error" }));
    throw new Error(err.detail || "Failed to send chat message");
  }
  return res.json();
}

export async function getComplaintStatus(trackingId) {
  const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(trackingId)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Ticket not found" }));
    throw new Error(err.detail || "Failed to fetch ticket status");
  }
  return res.json();
}

export async function listComplaints(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const res = await fetch(`${API_BASE}/complaints?${query}`);
  if (!res.ok) throw new Error("Failed to list complaints");
  return res.json();
}

export async function escalateComplaint(trackingId) {
  const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(trackingId)}/escalate`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Escalation failed" }));
    throw new Error(err.detail || "Failed to escalate complaint");
  }
  return res.json();
}

export async function getSocialAdvocacy(trackingId) {
  const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(trackingId)}/social`);
  if (!res.ok) throw new Error("Failed to fetch social advocacy draft");
  return res.json();
}

export async function getMunicipalStats() {
  const res = await fetch(`${API_BASE}/admin/stats`);
  if (!res.ok) throw new Error("Failed to fetch municipal stats");
  return res.json();
}

export async function updateComplaintStatus(payload) {
  const res = await fetch(`${API_BASE}/admin/update-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export async function getSampleDataset() {
  const res = await fetch(`${API_BASE}/admin/sample-dataset`);
  if (!res.ok) throw new Error("Failed to fetch sample dataset");
  return res.json();
}

export async function getAgentTools() {
  const res = await fetch(`${API_BASE}/agent/tools`);
  if (!res.ok) throw new Error("Failed to fetch agent tools");
  return res.json();
}
