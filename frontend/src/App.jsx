import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";
import "./app.css";



// ── DATA ──────────────────────────────────────────────────────────────
const TRADES = [
  { tsn:"TSN001", scrip:"AAPL",  qty:10, buyRate:150, sellRate:175, buyAmt:1500,  soldAmt:1750,  boughtDate:"2024-01-15", soldDate:"2024-02-20", rr:"2:1",   remarks:"Good breakout trade",     pl: 250 },
  { tsn:"TSN002", scrip:"TSLA",  qty:5,  buyRate:200, sellRate:180, buyAmt:1000,  soldAmt:900,   boughtDate:"2024-02-01", soldDate:"2024-03-10", rr:"1:2",   remarks:"Stop loss triggered",      pl:-100 },
  { tsn:"TSN003", scrip:"NVDA",  qty:8,  buyRate:400, sellRate:480, buyAmt:3200,  soldAmt:3840,  boughtDate:"2024-01-20", soldDate:"2024-03-05", rr:"3:1",   remarks:"AI sector rally",          pl: 640 },
  { tsn:"TSN004", scrip:"META",  qty:12, buyRate:300, sellRate:270, buyAmt:3600,  soldAmt:3240,  boughtDate:"2024-02-10", soldDate:"2024-04-01", rr:"1:1.5", remarks:"Earnings miss, cut loss",  pl:-360 },
  { tsn:"TSN005", scrip:"AMZN",  qty:6,  buyRate:180, sellRate:210, buyAmt:1080,  soldAmt:1260,  boughtDate:"2024-03-01", soldDate:"2024-04-15", rr:"2.5:1", remarks:"Strong uptrend",           pl: 180 },
  { tsn:"TSN006", scrip:"GOOGL", qty:4,  buyRate:140, sellRate:155, buyAmt:560,   soldAmt:620,   boughtDate:"2024-03-15", soldDate:"2024-05-01", rr:"2:1",   remarks:"Held at support level",    pl:  60 },
  { tsn:"TSN007", scrip:"MSFT",  qty:7,  buyRate:380, sellRate:350, buyAmt:2660,  soldAmt:2450,  boughtDate:"2024-04-01", soldDate:"2024-05-10", rr:"1:2",   remarks:"Failed breakout attempt",  pl:-210 },
];

const INVESTMENTS = [
  { sn:1, scrip:"RELIANCE", qty:20, buyRate:2500, sellRate:2750, buyAmt:50000, soldAmt:55000 },
  { sn:2, scrip:"TCS",      qty:15, buyRate:3800, sellRate:4100, buyAmt:57000, soldAmt:61500 },
  { sn:3, scrip:"INFY",     qty:30, buyRate:1400, sellRate:1350, buyAmt:42000, soldAmt:40500 },
  { sn:4, scrip:"HDFC",     qty:25, buyRate:1600, sellRate:1720, buyAmt:40000, soldAmt:43000 },
];

const WATCHLIST = [
  { sn:1, scrip:"BAJFINANCE", sector:"Finance",      watchLevel:"6,500", notes:"Breakout from consolidation pending" },
  { sn:2, scrip:"WIPRO",      sector:"IT",           watchLevel:"450",   notes:"Strong support at 50 EMA" },
  { sn:3, scrip:"SBIN",       sector:"Banking",      watchLevel:"620",   notes:"Watch for PSU rally setup" },
  { sn:4, scrip:"ADANIENT",   sector:"Conglomerate", watchLevel:"2,400", notes:"Potential reversal setup" },
];

const LINE_DATA = [
  { month:"Jan", Profit:250, Loss:0   },
  { month:"Feb", Profit:0,   Loss:100 },
  { month:"Mar", Profit:640, Loss:360 },
  { month:"Apr", Profit:180, Loss:210 },
  { month:"May", Profit:60,  Loss:0   },
];

const BAR_DATA = [
  { name:"Jan", Invested:4700, NetProfit: 250 },
  { name:"Feb", Invested:4600, NetProfit:-100 },
  { name:"Mar", Invested:6880, NetProfit: 280 },
  { name:"Apr", Invested:3740, NetProfit: -30 },
  { name:"May", Invested:560,  NetProfit:  60 },
];

// ── COMPUTED ──────────────────────────────────────────────────────────
const totalInvested = TRADES.reduce((s,t) => s + t.buyAmt, 0);
const netPL         = TRADES.reduce((s,t) => s + t.pl, 0);
const totalQty      = TRADES.reduce((s,t) => s + t.qty, 0);
const wins          = TRADES.filter(t => t.pl > 0).length;
const winRate       = ((wins / TRADES.length) * 100).toFixed(1);

const plScene =
  netPL > 500  ? { e:"🚀", label:"Crushing It!", cls:"stat-card__value--profit" }
: netPL > 0    ? { e:"😊", label:"In Profit",    cls:"stat-card__value--profit" }
: netPL === 0  ? { e:"😐", label:"Break Even",   cls:""                         }
: netPL > -400 ? { e:"😟", label:"Minor Loss",   cls:"stat-card__value--loss"   }
:                { e:"😰", label:"Heavy Loss",   cls:"stat-card__value--loss"   };

const sectorBadgeClass = s => ({
  Finance:      "badge badge--finance",
  IT:           "badge badge--it",
  Banking:      "badge badge--banking",
  Conglomerate: "badge badge--conglomerate",
}[s] || "badge badge--default");

// ── MODAL ─────────────────────────────────────────────────────────────
function Modal({ trade, onClose }) {
  if (!trade) return null;
  const isProfit = trade.pl >= 0;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <div className="modal__scrip">{trade.scrip}</div>
            <div className="modal__tid">Trade ID · {trade.tsn}</div>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__divider" />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {["Quantity","Bought Date","Sold Date","R-R Ratio","Remarks","P&L"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{trade.qty}</td>
                <td>{trade.boughtDate}</td>
                <td>{trade.soldDate}</td>
                <td><span className="rr-badge">{trade.rr}</span></td>
                <td className="td--subtle">{trade.remarks}</td>
                <td className={isProfit ? "td--profit" : "td--loss"}>
                  {isProfit ? `+${trade.pl}` : trade.pl}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={`pl-footer ${isProfit ? "pl-footer--profit" : "pl-footer--loss"}`}>
          <span className="pl-footer__emoji">{isProfit ? "📈" : "📉"}</span>
          <div>
            <div className={`pl-footer__label ${isProfit ? "pl-footer__label--profit" : "pl-footer__label--loss"}`}>
              {isProfit ? "Profitable Trade" : "Loss Trade"}
            </div>
            <div className="pl-footer__sub">
              Return: {((trade.pl / trade.buyAmt) * 100).toFixed(2)}% on ₹{trade.buyAmt.toLocaleString()} invested
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TRADE TABLE ───────────────────────────────────────────────────────
function TradeTable({ data, onScripClick }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {["TSN","SCRIP","Quantity","Buy Rate","Sell Rate","Buy Amount","Sold Amount"].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(t => (
            <tr key={t.tsn}>
              <td className="td--mono">{t.tsn}</td>
              <td>
                <button className="scrip-btn" onClick={() => onScripClick(t)}>{t.scrip}</button>
              </td>
              <td>{t.qty}</td>
              <td>${t.buyRate.toFixed(2)}</td>
              <td>${t.sellRate.toFixed(2)}</td>
              <td>${t.buyAmt.toLocaleString()}</td>
              <td className={t.soldAmt >= t.buyAmt ? "td--profit" : "td--loss"}>
                ${t.soldAmt.toLocaleString()}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={7} className="td--empty">No trades found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────
function Dashboard() {
  return (
    <div className="dashboard">
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__label">Total Invested</div>
          <div className="stat-card__value">${totalInvested.toLocaleString()}</div>
          <div className="stat-card__sub">Across all trades</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Net P&amp;L</div>
          <div className={`stat-card__value ${netPL >= 0 ? "stat-card__value--profit" : "stat-card__value--loss"}`}>
            {netPL >= 0 ? "+" : ""}${netPL}
          </div>
          <div className="stat-card__sub">Realized gains / losses</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Win Rate</div>
          <div className="stat-card__value stat-card__value--blue">{winRate}%</div>
          <div className="stat-card__sub">{wins} of {TRADES.length} trades</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Total Qty Traded</div>
          <div className="stat-card__value stat-card__value--purple">{totalQty}</div>
          <div className="stat-card__sub">Shares / units</div>
        </div>
        <div className="emoji-card">
          <div className="emoji-card__icon">{plScene.e}</div>
          <div className={`emoji-card__label ${plScene.cls}`}>{plScene.label}</div>
          <div className="emoji-card__sub">Current P&amp;L Scenario</div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-section__title">Profit vs Loss — Monthly</div>
        <div className="chart-section__sub">Two simultaneous lines tracking gains (green) and losses (red)</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={LINE_DATA} margin={{ top:5, right:10, left:-10, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize:12, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:12, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius:"8px", border:"1px solid #e2e8f0", fontSize:"12px" }} />
            <Legend wrapperStyle={{ fontSize:"12px", paddingTop:"8px" }} />
            <Line type="monotone" dataKey="Profit" stroke="#16a34a" strokeWidth={2.5} dot={{ r:5, fill:"#16a34a" }} activeDot={{ r:7 }} />
            <Line type="monotone" dataKey="Loss"   stroke="#dc2626" strokeWidth={2.5} dot={{ r:5, fill:"#dc2626" }} activeDot={{ r:7 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-section">
        <div className="chart-section__title">Total Invested Capital vs Net Profit</div>
        <div className="chart-section__sub">Capital deployed each month vs returns generated</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={BAR_DATA} margin={{ top:5, right:10, left:-10, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize:12, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:12, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius:"8px", border:"1px solid #e2e8f0", fontSize:"12px" }} />
            <Legend wrapperStyle={{ fontSize:"12px", paddingTop:"8px" }} />
            <Bar dataKey="Invested" fill="#93c5fd" radius={[5,5,0,0]} name="Total Invested" />
            <Bar dataKey="NetProfit" radius={[5,5,0,0]} name="Net Profit">
              {BAR_DATA.map((d,i) => (
                <Cell key={i} fill={d.NetProfit >= 0 ? "#86efac" : "#fca5a5"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── JOURNAL ───────────────────────────────────────────────────────────
function Journal({ onScripClick }) {
  return (
    <div className="card--no-pad">
      <div className="card__header">
        <div>
          <div className="card__title">Trade Journal</div>
          <div className="card__subtitle">Click on any <strong>SCRIP</strong> to view full trade details</div>
        </div>
      </div>
      <TradeTable data={TRADES} onScripClick={onScripClick} />
    </div>
  );
}

// ── INVESTMENT ────────────────────────────────────────────────────────
function Investment() {
  return (
    <div className="card--no-pad">
      <div className="card__header">
        <div>
          <div className="card__title">Investment Portfolio</div>
          <div className="card__subtitle">Long-term investment positions</div>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {["SN","SCRIP","Quantity","Buy Rate","Sell Rate","Bought Amount","Sold Amount"].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INVESTMENTS.map(inv => (
              <tr key={inv.sn}>
                <td className="td--muted">{inv.sn}</td>
                <td className="td--bold">{inv.scrip}</td>
                <td>{inv.qty}</td>
                <td>₹{inv.buyRate.toLocaleString()}</td>
                <td>₹{inv.sellRate.toLocaleString()}</td>
                <td>₹{inv.buyAmt.toLocaleString()}</td>
                <td className={inv.soldAmt >= inv.buyAmt ? "td--profit" : "td--loss"}>
                  ₹{inv.soldAmt.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── WATCHLIST ─────────────────────────────────────────────────────────
function Watchlist() {
  return (
    <div className="card--no-pad">
      <div className="card__header">
        <div>
          <div className="card__title">Watchlist</div>
          <div className="card__subtitle">Stocks currently on your radar</div>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {["SN","SCRIP","Sector","Watch Level","Notes"].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WATCHLIST.map(w => (
              <tr key={w.sn}>
                <td className="td--muted">{w.sn}</td>
                <td className="td--bold">{w.scrip}</td>
                <td><span className={sectorBadgeClass(w.sector)}>{w.sector}</span></td>
                <td className="watch-level">₹{w.watchLevel}</td>
                <td className="td--subtle">{w.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── LOSING ────────────────────────────────────────────────────────────
function Losing({ onScripClick }) {
  const losing    = TRADES.filter(t => t.pl < 0);
  const totalLoss = losing.reduce((s,t) => s + t.pl, 0);
  const lossRate  = (100 - parseFloat(winRate)).toFixed(1);
  return (
    <div className="losing">
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__label">Total Losses</div>
          <div className="stat-card__value stat-card__value--loss">{losing.length} Trades</div>
          <div className="stat-card__sub">Out of {TRADES.length} total</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Net Loss Amount</div>
          <div className="stat-card__value stat-card__value--loss">${totalLoss}</div>
          <div className="stat-card__sub">Realized losses</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Loss Rate</div>
          <div className="stat-card__value stat-card__value--loss">{lossRate}%</div>
          <div className="stat-card__sub">Of all trades</div>
        </div>
      </div>
      <div className="card--no-pad">
        <div className="card__header">
          <div>
            <div className="card__title">Losing Trades Journal</div>
            <div className="card__subtitle">Click on any <strong>SCRIP</strong> to view full trade details</div>
          </div>
          <span className="loss-badge">📉 {losing.length} Losses</span>
        </div>
        <TradeTable data={losing} onScripClick={onScripClick} />
      </div>
    </div>
  );
}

// ── TABS ──────────────────────────────────────────────────────────────
const TABS = [
  { id:"dashboard",  label:"🏠 Dashboard"  },
  { id:"journal",    label:"📝 Journal"    },
  { id:"investment", label:"💼 Investment" },
  { id:"watchlist",  label:"👁️ Watchlist"  },
  { id:"losing",     label:"📉 Losing"     },
];

// ── APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [tab,   setTab]   = useState("dashboard");
  const [modal, setModal] = useState(null);

  return (
    <>
     
      <header className="topbar">
        <div className="topbar__logo">
          <div className="topbar__icon">📊</div>
          <div>
            <div className="topbar__title">TradeLog</div>
            <div className="topbar__subtitle">Investment Journal &amp; Performance Tracker</div>
          </div>
        </div>
        <div className="topbar__date">
          {new Date().toLocaleDateString("en-US", { weekday:"short", year:"numeric", month:"short", day:"numeric" })}
        </div>
      </header>

      <nav className="tabbar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? "tab-btn--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="page">
        {tab === "dashboard"  && <Dashboard />}
        {tab === "journal"    && <Journal    onScripClick={setModal} />}
        {tab === "investment" && <Investment />}
        {tab === "watchlist"  && <Watchlist />}
        {tab === "losing"     && <Losing     onScripClick={setModal} />}
      </main>

      <Modal trade={modal} onClose={() => setModal(null)} />
    </>
  );
}