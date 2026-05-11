// ============================================================
//  MeroShare API Client  —  index.js
//  Confirmed endpoints from browser Network tab:
//    capital/  auth/  ownDetail/  pageSize/
//    showDashboard/  message/  navigation/
// ============================================================

const axios = require("axios");

// ── CONFIG ────────────────────────────────────────────────────────────
const BASE_URL = "https://webbackend.cdsc.com.np/api/meroShare";

// Find your clientId: Network tab → capital/ → Response tab
// Look for your bank in the list and copy its "id" number.
const CREDENTIALS = {
  clientId: 156,            // Replace with your DP's numeric ID
  username: "01586774",  // Your MeroShare username
  password: "Krijan@97**",  // Your MeroShare password
};

// ── AXIOS INSTANCE ────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept:          "application/json",
  },
});

// ── STEP 1: GET DP LIST — GET /capital/ ───────────────────────────────
// First call MeroShare makes on the login page.
// Run this once to find your clientId if you're unsure.
async function getCapitalList() {
  try {
    const response = await api.get("/capital/");
    const list = response.data;
    console.log("\n🏦 Depository Participants:");
    list.forEach(dp => {
      console.log(`  ID: ${String(dp.id).padStart(5)}  →  ${dp.name}`);
    });
    return list;
  } catch (err) {
    console.error("Failed to fetch DP list:", err.response?.data || err.message);
  }
}

// ── STEP 2: LOGIN — POST /auth/ ───────────────────────────────────────
// Confirmed from Network tab: the login endpoint is /auth/ not /login.
// JWT token comes back in the Authorization response header.
async function login() {
  try {
    const response = await api.post("/auth/", {
      clientId: CREDENTIALS.clientId,
      username: CREDENTIALS.username,
      password: CREDENTIALS.password,
    });

    // Primary location: Authorization response header
    let token = response.headers["authorization"];

    // Fallback: some builds put it in the response body
    if (!token) {
      token = response.data?.token || response.data?.accessToken;
    }

    if (!token) {
      console.log("\nNo token found. Full response for debugging:");
      console.log("  Headers:", JSON.stringify(response.headers, null, 2));
      console.log("  Body:   ", JSON.stringify(response.data, null, 2));
      throw new Error("Could not extract auth token.");
    }

    api.defaults.headers.common["Authorization"] = token;
    console.log("Login successful.");
    console.log("Token:", token.substring(0, 40) + "...");
    return token;
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
    throw err;
  }
}

// ── STEP 3: OWN DETAIL — GET /ownDetail/ ─────────────────────────────
async function getOwnDetails() {
  try {
    const response = await api.get("/ownDetail/");
    const d = response.data;
    console.log("\nOwn Details:");
    console.log("  Name         :", d.name);
    console.log("  BOID         :", d.demat);
    console.log("  Username     :", d.username);
    console.log("  Email        :", d.email);
    console.log("  Mobile       :", d.contact);
    console.log("  Demat Expiry :", d.dematExpiryDate);
    return d;
  } catch (err) {
    console.error("Failed to fetch own details:", err.response?.data || err.message);
  }
} 



// ── STEP 4: DASHBOARD — GET /showDashboard/ ──────────────────────────
async function getDashboard() {
  try {
    const response = await api.get("/showDashboard/");
    console.log("\nDashboard:");
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (err) {
    console.error("Failed to fetch dashboard:", err.response?.data || err.message);
  }
}

//// This is add by me and myself  ...
const BASE_URL1 = "https://webbackend.cdsc.com.np/api/meroShareView";
const api1 = axios.create({
  baseURL: BASE_URL1,
  headers: {
    "Content-Type": "application/json",
    Accept:          "application/json",
  },
});

// ── STEP 5: MY SHARES ─────────────────────────────────────────────────
async function getMyShares() {
  try {
    const response = await api1.post("/myShare/");
    const shares = response.data;
    console.log("\nMy Shares:");
    if (!shares || shares.length === 0) { console.log("  None."); return []; }
    shares.forEach((s, i) => {
      console.log(`  [${i+1}] ${s.scrip.padEnd(16)} | Total: ${s.totalBalance} | Free: ${s.freeBalance} | Freeze: ${s.freezeBalance}`);
    });
    return shares;
  } catch (err) {
    console.error("Failed to fetch shares:", err.response?.data || err.message);

  }
}

// ── STEP 6: PORTFOLIO ─────────────────────────────────────────────────
async function getPortfolio() {
  try {
    const response = await api.get("/portfolio/");
    const p = response.data;
    console.log("\nPortfolio:");
    console.log("  Total Cost Value   : NPR", p.totalCostPrice?.toLocaleString() ?? "N/A");
    console.log("  Total Market Value : NPR", p.totalValueOfLastTransPrice?.toLocaleString() ?? "N/A");
    p.meroShareMyPortfolio?.forEach(item => {
      console.log(`  ${item.scrip.padEnd(16)} | Qty: ${String(item.currentBalance).padStart(6)} | LTP: ${item.lastTransactionPrice} | Value: NPR ${item.valueOfLastTransPrice?.toLocaleString()}`);
    });
    return p;
  } catch (err) {
    console.error("Failed to fetch portfolio:", err.response?.data || err.message);
  }
}

// ── STEP 7: TRANSACTION HISTORY ───────────────────────────────────────
async function getTransactionHistory(page = 0, size = 10) {
  try {
    const response = await api.post("/myTransaction/", { page, size, scrip: "" });
    const { object: txns, totalCount } = response.data;
    console.log(`\nTransactions (${txns?.length || 0} of ${totalCount}):`);
    if (!txns || txns.length === 0) { console.log("  None."); return []; }
    txns.forEach((tx, i) => {
      const sign = tx.transactionType === "purchase" ? "+" : "-";
      console.log(`  [${i+1}] ${tx.transactionDate}  ${tx.scrip.padEnd(14)} ${sign}${tx.quantity} units @ NPR ${tx.rate}`);
    });
    return txns;
  } catch (err) {
    console.error("Failed to fetch transactions:", err.response?.data || err.message);
  }
}

// ── STEP 8: IPO APPLICATIONS ──────────────────────────────────────────
async function getIPOApplications() {
  try {
    const response = await api.get("/applicantForm/submitted/");
    const apps = response.data;
    console.log("\nIPO Applications:");
    if (!apps || apps.length === 0) { console.log("  None."); return []; }
    apps.forEach((a, i) => {
      console.log(`  [${i+1}] ${a.companyName.padEnd(32)} | ${a.appliedDate} | Qty: ${a.appliedKitta} | ${a.statusName}`);
    });
    return apps;
  } catch (err) {
    console.error("Failed to fetch IPO applications:", err.response?.data || err.message);
  }
}

// ── STEP 9: MESSAGES — GET /message/ ─────────────────────────────────
async function getMessages() {
  try {
    const response = await api.get("/message/");
    const msgs = response.data;
    console.log("\nMessages:");
    if (!msgs || msgs.length === 0) { console.log("  None."); return []; }
    msgs.forEach((m, i) => {
      console.log(`  [${i+1}] ${m.subject || m.message || JSON.stringify(m)}`);
    });
    return msgs;
  } catch (err) {
    console.error("Failed to fetch messages:", err.response?.data || err.message);
  }
}

// ── MAIN ──────────────────────────────────────────────────────────────
async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("        MeroShare Data Fetcher             ");
  console.log("═══════════════════════════════════════════\n");

  // FIRST RUN: Uncomment the two lines below to find your DP clientId,
  // then re-comment them and fill in CREDENTIALS.clientId above.
  // await getCapitalList();
  // return;

  await login();

  await getOwnDetails();
  await getDashboard();
  await getMyShares();
  await getPortfolio();
  await getTransactionHistory(0, 10);
  await getIPOApplications();
  await getMessages();

  console.log("\n═══════════════════════════════════════════");
  console.log("                Done ✅");
  console.log("═══════════════════════════════════════════\n");
}

main();