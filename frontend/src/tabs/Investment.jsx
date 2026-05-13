import { fmt, holdDays } from "../utils/helpers";
import "./Investment.css";

// ── INVESTMENT TAB ────────────────────────────────────────
// Props:
//   investments  – array of investment objects
//   onScripClick – open detail modal for the clicked investment

export function Investment({ investments, onScripClick }) {
  const holdingCount = investments.filter(i => !i.soldDate).length;
  const soldCount    = investments.filter(i => !!i.soldDate).length;

  return (
    <div className="card--np">
      <div className="card__header">
        <div>
          <div className="card__title">Investment Portfolio</div>
          <div className="card__sub">Click any SCRIP to view · Edit · Delete</div>
        </div>
        <div className="inv-badges">
          <span className="status-badge sb--holding">⬤ {holdingCount} Holding</span>
          <span className="status-badge sb--sold">✓ {soldCount} Sold</span>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SN</th>
              <th>SCRIP</th>
              <th>Quantity</th>
              <th>Buy Rate</th>
              <th>Bought Date</th>
              <th>Bought Amount</th>
              <th>Holding Days</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {investments.length === 0 && (
              <tr>
                <td colSpan={8} className="td--empty">No investments yet</td>
              </tr>
            )}
            {investments.map((inv, i) => {
              const isSold = !!inv.soldDate;
              const d      = holdDays(inv.boughtDate, inv.soldDate);
              return (
                <tr key={inv.id}>
                  <td className="td--muted">{i + 1}</td>
                  <td>
                    <button className="scrip-btn" onClick={() => onScripClick(inv)}>
                      {inv.scrip}
                    </button>
                  </td>
                  <td>{inv.qty}</td>
                  <td className="td--mono">₹{fmt(inv.buyRate)}</td>
                  <td className="td--mono">{inv.boughtDate}</td>
                  <td className="td--mono">₹{fmt(inv.buyAmt)}</td>
                  <td className="td--mono inv-days">{d}{d !== "—" ? "d" : ""}</td>
                  <td>
                    {isSold
                      ? <span className="status-badge sb--sold">✓ Sold</span>
                      : <span className="status-badge sb--holding">⬤ Holding</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}