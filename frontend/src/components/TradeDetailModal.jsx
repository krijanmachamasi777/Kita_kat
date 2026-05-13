import { fmt, pctRet, holdDays } from "../utils/helpers";
import "./modals.css";

// ── TRADE DETAIL MODAL ────────────────────────────────────
// Props:
//   trade    – trade object to display
//   onEdit   – called with the trade to open edit form
//   onDelete – called with trade.id
//   onClose  – dismiss the modal

export function TradeDetailModal({ trade, onEdit, onDelete, onClose }) {
  const pl  = trade.soldAmt - trade.buyAmt;
  const pos = pl >= 0;
  const hd  = holdDays(trade.boughtDate, trade.soldDate);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
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
                {["Quantity","Bought Date","Sold Date","R-R","Remarks","Holding Days","P&L"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{trade.qty}</td>
                <td className="td--mono">{trade.boughtDate || "—"}</td>
                <td className="td--mono">{trade.soldDate   || "—"}</td>
                <td><span className="rr-badge">{trade.rr || "—"}</span></td>
                <td className="td--subtle">{trade.remarks || "—"}</td>
                <td className="td--mono">{hd}{hd !== "—" ? " days" : ""}</td>
                <td className={pos ? "td--profit" : "td--loss"}>
                  {pos ? "+" : "-"}₹{fmt(Math.abs(pl))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={`pl-footer ${pos ? "pl-footer--profit" : "pl-footer--loss"}`}>
          <span className="pl-footer__emoji">{pos ? "📈" : "📉"}</span>
          <div>
            <div className={`pl-footer__label pl-footer__label--${pos ? "profit" : "loss"}`}>
              {pos ? "Profitable Trade" : "Loss Trade"}
            </div>
            <div className="pl-footer__sub">
              Return: {pctRet(pl, trade.buyAmt)} · Invested ₹{fmt(trade.buyAmt)}
            </div>
          </div>
        </div>

        <div className="modal__actions">
          <button className="btn btn--danger" onClick={() => { onDelete(trade.id); onClose(); }}>
            🗑 Delete
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn btn--ghost" onClick={onClose}>Close</button>
          <button className="btn btn--edit"  onClick={() => { onClose(); onEdit(trade); }}>✏ Edit</button>
        </div>
      </div>
    </div>
  );
}