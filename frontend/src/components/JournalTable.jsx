import { fmt } from "../utils/helpers";

// ── JOURNAL TABLE ─────────────────────────────────────────
// Shared between Journal tab and Losing tab.
// Props:
//   trades       – array of trade objects
//   onScripClick – called with the trade when scrip button is clicked

export function JournalTable({ trades, onScripClick }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>TSN</th>
            <th>SCRIP</th>
            <th>Quantity</th>
            <th>Buy Rate</th>
            <th>Sell Rate</th>
            <th>Buy Amount</th>
            <th>Sold Amount</th>
            <th>P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {trades.length === 0 && (
            <tr>
              <td colSpan={8} className="td--empty">No trades found</td>
            </tr>
          )}
          {trades.map(t => {
            const pl  = t.soldAmt - t.buyAmt;
            const pos = pl >= 0;
            return (
              <tr key={t.id}>
                <td className="td--mono">{t.tsn}</td>
                <td>
                  <button className="scrip-btn" onClick={() => onScripClick(t)}>
                    {t.scrip}
                  </button>
                </td>
                <td>{t.qty}</td>
                <td className="td--mono">₹{fmt(t.buyRate)}</td>
                <td className="td--mono">₹{fmt(t.sellRate)}</td>
                <td className="td--mono">₹{fmt(t.buyAmt)}</td>
                <td className="td--mono">₹{fmt(t.soldAmt)}</td>
                <td className={pos ? "td--profit" : "td--loss"}>
                  {pos ? "+" : "-"}₹{fmt(Math.abs(pl))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}