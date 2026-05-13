// ── CONSTANTS ─────────────────────────────────────────────
export const RR_OPTS = ["—", ...Array.from({ length: 50 }, (_, i) => `1:${i + 1}`)];

export const SECTORS = [
  "Banking", "Dev Bank", "Finance", "Hotels", "Hydro",
  "Manufacturing", "Microfinance", "Life Insurance",
  "Non Life Insurance", "Mutual Fund", "Other",
];

// ── HELPERS ───────────────────────────────────────────────
export const uid      = () => Math.random().toString(36).slice(2, 9);
export const todayStr = () => new Date().toISOString().slice(0, 10);
export const diffDays = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
export const holdDays = (a, b) => (a && (b || true)) ? diffDays(a, b || todayStr()) : "—";
export const fmt      = n => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
export const pctRet   = (pl, amt) => amt ? ((pl / amt) * 100).toFixed(2) + "%" : "—";
export const annG     = (pl, amt, d) => (amt && d && d !== "—") ? ((pl / amt) / (d / 365) * 100).toFixed(2) : null;
export const monG     = (pl, amt, d) => (amt && d && d !== "—") ? ((pl / amt) / (d / 30)  * 100).toFixed(2) : null;

export const secBadge = s => {
  const m = {
    Finance: "finance", Banking: "banking", IT: "it", Hydro: "it",
    Manufacturing: "it", Microfinance: "finance", "Dev Bank": "banking",
    "Life Insurance": "gold", "Non Life Insurance": "gold", "Mutual Fund": "gold",
  };
  return "badge badge--" + (m[s] || "default");
};

export const nextTSN = trades => {
  const nums = trades.map(t => parseInt(t.tsn.replace("TSN", "")) || 0);
  return `TSN${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
};

// ── LOCAL STORAGE ─────────────────────────────────────────
export const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save ${key} to storage:`, e);
  }
};