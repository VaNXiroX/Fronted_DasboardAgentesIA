import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

// ─────────────────────────────────────────────────────────────────────────────
//  DATOS DE DEMOSTRACIÓN — se muestran cuando el backend no tiene el endpoint
// ─────────────────────────────────────────────────────────────────────────────

/** Genera una serie temporal de los últimos N días con valores realistas */
function mockTimeseries(days = 30) {
  const series = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const tokens = Math.floor(18000 + Math.random() * 42000);
    series.push({
      date: d.toISOString().slice(0, 10),
      tokens,
      cost: parseFloat((tokens * 0.000002).toFixed(4)),
      runs: Math.floor(40 + Math.random() * 120),
      avg_latency_ms: parseFloat((320 + Math.random() * 480).toFixed(1)),
    });
  }
  return series;
}

/** Genera logs de actividad reciente para un agente */
function mockLogs(limit = 15) {
  const logs = [];
  const now = new Date();
  for (let i = 0; i < limit; i++) {
    const ts = new Date(now - i * 1000 * 60 * Math.floor(8 + Math.random() * 40));
    const tokIn  = Math.floor(200 + Math.random() * 1800);
    const tokOut = Math.floor(100 + Math.random() * 800);
    logs.push({
      id: i + 1,
      timestamp: ts.toISOString(),
      tokens_in: tokIn,
      tokens_out: tokOut,
      latency_ms: Math.floor(180 + Math.random() * 900),
      success: Math.random() > 0.07,
    });
  }
  return logs;
}

const MOCK_AGENTS = [
  {
    id: 1, name: "SupportBot Pro", client_id: 1,
    type: "chatbot", agent_type: "chatbot",
    description: "Chatbot de soporte al cliente 24/7 integrado con Chatwoot.",
    model: "gpt-4o-mini", status: "running",
    system_prompt: "Eres un asistente de soporte amable y profesional. Responde siempre en español.",
    temperature: 0.6, max_tokens: 1024,
    tags: ["soporte", "produccion", "chatwoot"],
    tokens_used: 1_842_300, cost_usd: 3.68, avg_latency_ms: 412, error_rate_pct: 1.2,
    created_at: "2025-02-14T09:00:00.000Z", updated_at: "2026-05-20T18:30:00.000Z",
  },
  {
    id: 2, name: "LeadQualifier", client_id: 1,
    type: "agent", agent_type: "agent",
    description: "Agente autónomo que califica leads y agenda demos automáticamente.",
    model: "gpt-4o", status: "running",
    system_prompt: "Analiza el perfil del lead y determina si cumple los criterios de calificación.",
    temperature: 0.3, max_tokens: 2048,
    tags: ["ventas", "automatizacion"],
    tokens_used: 3_120_800, cost_usd: 9.36, avg_latency_ms: 680, error_rate_pct: 2.1,
    created_at: "2025-03-01T10:00:00.000Z", updated_at: "2026-05-21T00:10:00.000Z",
  },
  {
    id: 3, name: "ContentWriter AI", client_id: 2,
    type: "agent", agent_type: "agent",
    description: "Genera artículos de blog, posts de redes sociales y copy publicitario.",
    model: "claude-3-5-sonnet-20241022", status: "running",
    system_prompt: "Eres un experto en marketing de contenidos. Escribe textos persuasivos y optimizados para SEO.",
    temperature: 0.85, max_tokens: 4096,
    tags: ["contenido", "marketing", "seo"],
    tokens_used: 2_560_100, cost_usd: 7.68, avg_latency_ms: 920, error_rate_pct: 0.8,
    created_at: "2025-04-10T14:00:00.000Z", updated_at: "2026-05-20T22:45:00.000Z",
  },
  {
    id: 4, name: "DataAnalyst Bot", client_id: 2,
    type: "agent", agent_type: "agent",
    description: "Analiza datasets, genera insights y produce reportes ejecutivos.",
    model: "gpt-4o", status: "paused",
    system_prompt: "Analiza los datos proporcionados y extrae conclusiones accionables.",
    temperature: 0.2, max_tokens: 8192,
    tags: ["datos", "reportes", "bi"],
    tokens_used: 892_400, cost_usd: 2.68, avg_latency_ms: 1340, error_rate_pct: 3.4,
    created_at: "2025-05-05T08:00:00.000Z", updated_at: "2026-05-19T14:20:00.000Z",
  },
  {
    id: 5, name: "OnboardingBot", client_id: 1,
    type: "chatbot", agent_type: "chatbot",
    description: "Guía a nuevos usuarios durante el proceso de onboarding paso a paso.",
    model: "gpt-4o-mini", status: "running",
    system_prompt: "Guía al usuario de forma amable y estructurada durante su onboarding.",
    temperature: 0.5, max_tokens: 1024,
    tags: ["onboarding", "usuarios", "produccion"],
    tokens_used: 621_900, cost_usd: 1.24, avg_latency_ms: 380, error_rate_pct: 0.5,
    created_at: "2025-06-15T11:00:00.000Z", updated_at: "2026-05-21T00:00:00.000Z",
  },
  {
    id: 6, name: "InvoiceProcessor", client_id: 2,
    type: "agent", agent_type: "agent",
    description: "Extrae datos de facturas en PDF y los sincroniza con el ERP.",
    model: "gemini-1.5-pro", status: "error",
    system_prompt: "Extrae información estructurada de documentos financieros.",
    temperature: 0.1, max_tokens: 2048,
    tags: ["finanzas", "ocr", "erp"],
    tokens_used: 415_200, cost_usd: 1.24, avg_latency_ms: 2100, error_rate_pct: 18.7,
    created_at: "2025-08-20T09:00:00.000Z", updated_at: "2026-05-21T00:05:00.000Z",
  },
];

const MOCK_OVERVIEW = {
  total_tokens: 9_452_700,
  total_cost_usd: 25.88,
  total_runs: 47_320,
  active_agents: 4,
  paused_agents: 1,
  error_agents: 1,
  total_agents: 6,
  error_rate_pct: 2.8,
  avg_latency_ms: 806,
};

const MOCK_BY_MODEL = [
  { model: "gpt-4o-mini", tokens: 2_464_200, cost: 4.92,  runs: 24_100 },
  { model: "gpt-4o",      tokens: 4_013_200, cost: 12.04, runs: 14_820 },
  { model: "claude-3-5-sonnet-20241022", tokens: 2_560_100, cost: 7.68, runs: 5_800 },
  { model: "gemini-1.5-pro", tokens: 415_200, cost: 1.24, runs: 2_600 },
];

const MOCK_BY_AGENT = [
  { agent_id: 2, name: "LeadQualifier",    model: "gpt-4o",       status: "running", tokens: 3_120_800, cost: 9.36,  avg_latency_ms: 680,  error_rate_pct: 2.1 },
  { agent_id: 3, name: "ContentWriter AI", model: "claude-3-5-sonnet-20241022", status: "running", tokens: 2_560_100, cost: 7.68,  avg_latency_ms: 920,  error_rate_pct: 0.8 },
  { agent_id: 1, name: "SupportBot Pro",   model: "gpt-4o-mini",  status: "running", tokens: 1_842_300, cost: 3.68,  avg_latency_ms: 412,  error_rate_pct: 1.2 },
  { agent_id: 5, name: "OnboardingBot",    model: "gpt-4o-mini",  status: "running", tokens: 621_900,   cost: 1.24,  avg_latency_ms: 380,  error_rate_pct: 0.5 },
  { agent_id: 4, name: "DataAnalyst Bot",  model: "gpt-4o",       status: "paused",  tokens: 892_400,   cost: 2.68,  avg_latency_ms: 1340, error_rate_pct: 3.4 },
  { agent_id: 6, name: "InvoiceProcessor", model: "gemini-1.5-pro",status: "error",  tokens: 415_200,   cost: 1.24,  avg_latency_ms: 2100, error_rate_pct: 18.7 },
];

const MOCK_MODELS = [
  { id: "gpt-4o",                        name: "GPT-4o",              provider: "OpenAI"    },
  { id: "gpt-4o-mini",                   name: "GPT-4o Mini",         provider: "OpenAI"    },
  { id: "gpt-4-turbo",                   name: "GPT-4 Turbo",         provider: "OpenAI"    },
  { id: "gpt-3.5-turbo",                 name: "GPT-3.5 Turbo",       provider: "OpenAI"    },
  { id: "claude-3-5-sonnet-20241022",    name: "Claude 3.5 Sonnet",   provider: "Anthropic" },
  { id: "claude-3-haiku-20240307",       name: "Claude 3 Haiku",      provider: "Anthropic" },
  { id: "gemini-1.5-pro",               name: "Gemini 1.5 Pro",      provider: "Google"    },
  { id: "gemini-1.5-flash",             name: "Gemini 1.5 Flash",    provider: "Google"    },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: captura errores y devuelve el fallback de demo
// ─────────────────────────────────────────────────────────────────────────────
const safe = (promise, fallback) => promise.catch(() => fallback);

// ─────────────────────────────────────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const Agents = {
  list: (params = {}) =>
    safe(api.get("/agents", { params }).then((r) => r.data), MOCK_AGENTS),

  get: (id) =>
    safe(
      api.get(`/agents/${id}`).then((r) => r.data),
      MOCK_AGENTS.find((a) => a.id === Number(id)) || MOCK_AGENTS[0]
    ),

  create: (body) =>
    api.post("/agents", body).then((r) => r.data),

  update: (id, body) =>
    safe(
      api.patch(`/agents/${id}`, body).then((r) => r.data),
      { ...MOCK_AGENTS.find((a) => a.id === Number(id)), ...body, id: Number(id) }
    ),

  remove: (id) =>
    safe(api.delete(`/agents/${id}`).then((r) => r.data), { ok: true }),

  action: (id, action) => {
    const statusMap = { start: "running", pause: "paused", stop: "stopped", restart: "running" };
    const agent = MOCK_AGENTS.find((a) => a.id === Number(id)) || {};
    return safe(
      api.post(`/agents/${id}/action`, { action }).then((r) => r.data),
      { ...agent, status: statusMap[action] || agent.status }
    );
  },

  timeseries: (id, days = 30) =>
    safe(
      api.get(`/agents/${id}/timeseries`, { params: { days } }).then((r) => r.data),
      mockTimeseries(days)
    ),

  logs: (id, limit = 20) =>
    safe(
      api.get(`/agents/${id}/logs`, { params: { limit } }).then((r) => r.data),
      mockLogs(limit)
    ),
};

export const Metrics = {
  overview: () =>
    safe(api.get("/metrics/overview").then((r) => r.data), MOCK_OVERVIEW),

  timeseries: (days = 30) =>
    safe(
      api.get("/metrics/timeseries", { params: { days } }).then((r) => r.data),
      mockTimeseries(days)
    ),

  byModel: () =>
    safe(api.get("/metrics/by-model").then((r) => r.data), MOCK_BY_MODEL),

  byAgent: () =>
    safe(api.get("/metrics/by-agent").then((r) => r.data), MOCK_BY_AGENT),
};

export const Models = {
  list: () =>
    safe(api.get("/models").then((r) => r.data), MOCK_MODELS),
};

export const Clients = {
  list: () =>
    safe(api.get("/clients").then((r) => r.data), []),

  get: (id) =>
    safe(api.get(`/clients/${id}`).then((r) => r.data), null),

  dashboard: (id, days = 30) =>
    safe(api.get(`/clients/${id}/dashboard`, { params: { days } }).then((r) => r.data), null),
};

export const Admin = {
  resetSeed: () =>
    safe(api.post("/seed/reset").then((r) => r.data), { ok: true }),
};
