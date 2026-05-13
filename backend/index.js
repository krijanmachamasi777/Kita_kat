const axios = require("axios");

const AUTH_URL = "https://webbackend.cdsc.com.np/api/meroShare";
const VIEW_URL = "https://webbackend.cdsc.com.np/api/meroShareView";

const CREDENTIALS = {
  clientId: 156,            // Replace with your DP's numeric ID
  username: "01586774",  // Your MeroShare username
  password: "Krijan@97**",  // Your MeroShare password
};


let TOKEN = null;
let BOID  = null;
let client_code = null;

function headers() {
  return {
    "Content-Type": "application/json",
    Accept:         "application/json",
    Authorization:  TOKEN,
  };
}

// ── LOGIN ─────────────────────────────────────────────────────────────
async function login() {
  const res = await axios.post(`${AUTH_URL}/auth/`, {
    clientId: CREDENTIALS.clientId,
    username: CREDENTIALS.username,
    password: CREDENTIALS.password,
  }, { headers: { "Content-Type": "application/json" } });

  TOKEN = res.headers["authorization"];
  if (!TOKEN) throw new Error("No token found.");
  console.log("✅ Login successful.");
}

// ── OWN DETAIL ────────────────────────────────────────────────────────
async function getOwnDetails() {
  const res = await axios.get(`${AUTH_URL}/ownDetail/`, { headers: headers() });
  const d   = res.data;
 BOID = d.demat;
 client_code = d.clientCode;
  console.log("\n📋 Own Details:");
  console.log("  Name         :", d.name);
  console.log("  BOID         :", d.demat);
  console.log("  Email        :", d.email);
  console.log("  Client Code   :", d.clientCode);
  console.log("  Demat Expiry :", d.dematExpiryDate);
  return d;
}
let script=[];

// ── MY SHARES ─────────────────────────────────────────────────────────
async function getMyShares() {
  try {
    const res    = await axios.post(`${VIEW_URL}/myShare/`, {
      sortBy:     "CCY_SHORT_NAME",
      demat:      [BOID],
      clientCode: String(client_code),
      page:       1,
      size:       200,
      sortAsc:    true,
    }, { headers: headers() });

// API returns [] when empty, or { meroShareDematShare: [...] } when it has data
const shares = Array.isArray(res.data)
  ? res.data                              // empty response []
  : (res.data?.meroShareDematShare || []); // full response with data   
    console.log(`\n📊 My Shares (${res.data.totalItems} total):`);
    if (!shares || shares.length === 0) { console.log("  None."); return []; }
    shares.forEach((s, i) => {
      console.log(`  [${i+1}] ${s.script?.padEnd(5)} | ${s.scriptDesc}`);
      script.push(s.script);
      console.log(`        Balance: ${s.currentBalance} | Free: ${s.freeBalance} | Freeze: ${s.freezeBalance} | Pledge: ${s.pledgeBalance}`);
    });
    return shares;
  } catch (err) {
    console.error("❌ My shares failed:", err.response?.data || err.message);
  }
}

// ── PORTFOLIO ─────────────────────────────────────────────────────────
async function getPortfolio() {
  try {
    const res = await axios.post(`${VIEW_URL}/myPortfolio/`, {
      sortBy:     "script",
      demat:      [BOID],
      clientCode: String(client_code),
      page:       1,
      size:       200,
      sortAsc:    true,
    }, { headers: headers() });

    const p       = res.data;
    const holding = p.meroShareMyPortfolio || p.myPortfolio || p.object || p;
    console.log("\n💼 Portfolio:");
    if (p.totalCostPrice)              console.log("  Total Cost Value   : NPR", p.totalCostPrice?.toLocaleString());
    if (p.totalValueOfLastTransPrice)  console.log("  Total Market Value : NPR", p.totalValueOfLastTransPrice?.toLocaleString());

    if (Array.isArray(holding)) {
      holding.forEach(item => {
        const scrip = item.script || item.scrip;
        console.log(`  ${scrip?.padEnd(16)} | Qty: ${item.currentBalance} | LTP: ${item.lastTransactionPrice} | Value: NPR ${item.valueOfLastTransPrice?.toLocaleString()}`);
      });
    } else {
      console.log(JSON.stringify(p, null, 2));
    }
    return p;
  } catch (err) {
    console.error("❌ Portfolio failed:", err.response?.data?.message || err.message);
  }
}

// // ── TRANSACTIONS ──────────────────────────────────────────────────────
// async function getTransactionHistory(page = 1, size = 10) {
//   try {
//     const res  = await axios.post(`${VIEW_URL}/myTransaction/`, {
//       boid:      [BOID],
//       clientCode: String(client_code),
//       fromDate:  "", // format "YYYY-MM-DD"
//       page:1,
//       requestTypeScript:true,
//       scrip:      "",
//       sortAsc:    false,
//     }, { headers: headers() });

//     const data  = res.data;
//     const txns  = data.object || data.myTransaction || data.data || data;
//     const total = data.totalCount || data.totalItems || "?";

//     console.log(`\n🔁 Transactions (${Array.isArray(txns) ? txns.length : 0} of ${total}):`);
//     if (!Array.isArray(txns) || txns.length === 0) { console.log("  None."); return []; }
//     txns.forEach((tx, i) => {
//       const scrip = tx.script || tx.scrip;
//       const sign  = tx.transactionType === "purchase" ? "+" : "-";
//       console.log(`  [${i+1}] ${tx.transactionDate}  ${scrip?.padEnd(14)} ${sign}${tx.quantity} @ NPR ${tx.rate}`);
//     });
//     return txns;
//   } catch (err) {
//     console.error("❌ Transactions failed:", err.response?.data || err.message);
//   }
// }

// ── IPO APPLICATIONS ──────────────────────────────────────────────────

// ── APPLICABLE ISSUES (IPO/FPO currently open) ────────────────────────
async function getApplicableIssues(page = 1, size = 10) {
  try {
    const res = await axios.post(`${AUTH_URL}/companyShare/applicableIssue/`, {
      filterDateParams: [
        { key: "minIssueOpenDate",  condition: "", alias: "", value: "" },
        { key: "maxIssueCloseDate", condition: "", alias: "", value: "" },
      ],
      filterFieldParams: [
        { key: "companyIssue.companyISIN.script",           alias: "Scrip" },
        { key: "companyIssue.companyISIN.company.name",     alias: "Company Name" },
        { key: "companyIssue.assignedToClient.name", value: "", alias: "Issue Manager" },
      ],
      page,
      size,
      searchRoleViewConstants: "VIEW_APPLICABLE_SHARE",
    }, { headers: headers() });
 
    const data   = res.data;
    const issues = data.object || data.applicableIssue || (Array.isArray(data) ? data : []);
    const total  = data.totalCount || data.totalItems || issues.length;
 
    console.log(`
🏢 Applicable Issues / Open IPOs (${issues.length} of ${total}):`);
    if (issues.length === 0) { console.log("  None currently open."); return []; }
    issues.forEach((iss, i) => {
      console.log(`  [${i+1}] ${iss.scrip?.padEnd(10) || iss.script?.padEnd(10)} | ${iss.companyName || iss.name}`);
      console.log(`        Open: ${iss.issueOpenDate} → Close: ${iss.issueCloseDate} | Type: ${iss.shareTypeName || iss.issueType} | shareGroupName: ${iss.shareGroupName},
`);
    });
    return issues;
  } catch (err) {
    console.error("❌ Applicable issues failed:", err.response?.data || err.message);
  }
}
async function getWACC() {
  try {
    let allRecords = [];

    for (const s of script) {
      const res = await axios.post(
        "https://webbackend.cdsc.com.np/api/myPurchase/search/wacc/",
        {
          demat: BOID,
          scrip: s,
        },
        {
          headers: headers(),
        }
      );

      const data = res.data;
      const records = data.waccUpdateResponse || [];

      console.log(`💰 WACC Data for ${s} (${records.length} records)`);

      records.forEach((r, i) => {
        const date = r.transactionDate
          ? r.transactionDate.split("T")[0]
          : "N/A";

        console.log(
          `  [${i + 1}] ${r.scrip?.padEnd(10)} | Qty: ${r.transactionQuantity} | Rate: NPR ${r.rate} | Date: ${date}`
        );
        console.log(
          `        Source: ${r.purchaseSource} | ISIN: ${r.isin}`
        );
      });

      allRecords.push(...records);
    }

    return allRecords;
  } catch (err) {
    console.error("❌ WACC failed:", err.response?.data || err.message);
    return [];
  }
}
 
 
// ── MAIN ──────────────────────────────────────────────────────────────
async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("        MeroShare Data Fetcher             ");
  console.log("═══════════════════════════════════════════\n");
  try {
    await login();
    await getOwnDetails();
    await getMyShares();
    await getPortfolio();
    // await getTransactionHistory(1, 10);
    await getApplicableIssues();
    await getWACC();
  } catch (err) {
    console.error("Fatal:", err.message);
  }
  console.log("\n═══════════════════════════════════════════");
  console.log("                Done ✅");
  console.log("═══════════════════════════════════════════\n");
}
 
main();