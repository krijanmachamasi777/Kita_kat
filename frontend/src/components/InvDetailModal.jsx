import { fmt, pctRet, holdDays, annG, monG } from "../utils/helpers";
import "./modals.css";

// ── INVEST DETAIL MODAL ───────────────────────────────────
// Props:
//   inv      – investment object to display
//   onEdit   – called with the investment to open edit form
//   onDelete – called with inv.id
//   onClose  – dismiss the modal

export function InvDetailModal({ inv, onEdit, onDelete, onClose }) {
  const isSold = !!inv.soldDate;
  const d      = holdDays(inv.boughtDate, inv.soldDate);
  const pl     = isSold ? inv.soldAmt - inv.buyAmt : null;
  const pos    = pl != null ? pl >= 0 : null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <div className="modal__scrip">{inv.scrip}</div>
            <div className="modal__tid">Investment Detail</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={isSold ? "status-badge sb--sold" : "status-badge sb--holding"}>
              {isSold ? "✓ SOLD" : "⬤ HOLDING"}
            </span>
            <button className="modal__close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal__divider" />

        {/* P&L block — only when sold */}
        {isSold && pl != null && (
          <div className={`inv-pl-block ${pos ? "inv-pl-block--profit" : "inv-pl-block--loss"}`}>
            <div className="inv-pl-left">
              <span style={{ fontSize: 28 }}>{pos ? "📈" : "📉"}</span>
              <div>
                <div className={`inv-pl__big ${pos ? "inv-pl__big--p" : "inv-pl__big--l"}`}>
                  {pos ? "+" : "-"}₹{fmt(Math.abs(pl))}
                </div>
                <div className="inv-pl__sub">
                  {pos ? "Profit" : "Loss"} · {pctRet(pl, inv.buyAmt)} return
                </div>
              </div>
            </div>
            <div className="gain-chips">
              {annG(pl, inv.buyAmt, d) && (
                <div className="gain-chip">
                  <span className="gain-chip__lbl">Avg Annual</span>
                  <span className={`gain-chip__val ${pos ? "v--profit" : "v--loss"}`}>
                    {pos ? "+" : ""}{annG(pl, inv.buyAmt, d)}%
                  </span>
                </div>
              )}
              {monG(pl, inv.buyAmt, d) && (
                <div className="gain-chip">
                  <span className="gain-chip__lbl">Avg Monthly</span>
                  <span className={`gain-chip__val ${pos ? "v--profit" : "v--loss"}`}>
                    {pos ? "+" : ""}{monG(pl, inv.buyAmt, d)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Still-holding banner */}
        {!isSold && (
          <div className="inv-holding">
            <span style={{ fontSize: 18 }}>🕐</span>
            <div>
              <div style={{ fontWeight: 700, color: "var(--acc)", fontSize: 13 }}>Still Holding</div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", marginTop: 2 }}>
                Position open · {d} days held so far
              </div>
            </div>
          </div>
        )}

        <div className="inv-section-label">Position Details</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {["Quantity","Buy Rate","Sold Rate","Bought Date","Sold Date","Bought Amt","Sold Amt","Holding Days"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{inv.qty}</td>
                <td className="td--mono">₹{fmt(inv.buyRate)}</td>
                <td className="td--mono">
                  {inv.soldRate
                    ? `₹${fmt(inv.soldRate)}`
                    : <span className="td--muted">—</span>}
                </td>
                <td className="td--mono">{inv.boughtDate}</td>
                <td className="td--mono">
                  {inv.soldDate || <span className="td--muted">—</span>}
                </td>
                <td className="td--mono">₹{fmt(inv.buyAmt)}</td>
                <td className={inv.soldAmt
                  ? (inv.soldAmt >= inv.buyAmt ? "td--profit" : "td--loss")
                  : "td--muted"}>
                  {inv.soldAmt ? `₹${fmt(inv.soldAmt)}` : "—"}
                </td>
                <td className="td--mono">{d}{d !== "—" ? " days" : ""}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {inv.remarks && (
          <div className="inv-remarks">
            <span style={{ fontSize: 14 }}>💬</span>
            <span className="inv-remarks__text">{inv.remarks}</span>
          </div>
        )}

        <div className="modal__actions">
          <button className="btn btn--danger" onClick={() => { onDelete(inv.id); onClose(); }}>
            🗑 Delete
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn btn--ghost" onClick={onClose}>Close</button>
          <button className="btn btn--edit"  onClick={() => { onClose(); onEdit(inv); }}>✏ Edit</button>
        </div>
      </div>
    </div>
  );
}