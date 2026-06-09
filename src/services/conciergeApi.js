const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export async function askConcierge(message, history) {
  const response = await fetch(`${API_BASE}/concierge/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Concierge service unavailable");
  }

  return response.json();
}

export async function getAiInsights() {
  const response = await fetch(`${API_BASE}/admin/ai-insights`);
  if (!response.ok) throw new Error("AI insights unavailable");
  return response.json();
}

