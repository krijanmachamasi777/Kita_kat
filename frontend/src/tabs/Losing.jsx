import { fmt } from "../utils/helpers";
import { JournalTable } from "../components/JournalTable";
import "./Losing.css";

// ── LOSING TAB ────────────────────────────────────────────
// Props:
//   trades       – full array of all trade objects (used for totals)
//   onScripClick – open detail modal for the clicked trade

export function Losing({ trades, onScripClick }) {
  const losingTrades = trades.filter(t => t.soldAmt < t.buyAmt);
  const netLoss      = losingTrades.reduce((s, t) => s + (t.soldAmt - t.buyAmt), 0);
  const winCount     = trades.filter(t => t.soldAmt > t.buyAmt).length;
  const lossRate     = trades.length
    ? (100 - (winCount / trades.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="losing">
      {/* ── Summary stats ── */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__label">Total Losses</div>
          <div className="stat-card__value v--loss">{losingTrades.length} Trades</div>
          <div className="stat-card__sub">Out of {trades.length} total</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Net Loss Amount</div>
          <div className="stat-card__value v--loss">-{fmt(Math.abs(netLoss))}</div>
          <div className="stat-card__sub">Realized losses</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Loss Rate</div>
          <div className="stat-card__value v--loss">{lossRate}%</div>
          <div className="stat-card__sub">Of all trades</div>
        </div>
      </div>

      {/* ── Losing trades table ── */}
      <div className="card--np">
        <div className="card__header">
          <div>
            <div className="card__title">Losing Trades Journal</div>
            <div className="card__sub">Click any SCRIP to view · Edit · Delete</div>
          </div>
          <span className="loss-badge">📉 {losingTrades.length} Losses</span>
        </div>
        <JournalTable trades={losingTrades} onScripClick={onScripClick} />
      </div>
    </div>
  );
}