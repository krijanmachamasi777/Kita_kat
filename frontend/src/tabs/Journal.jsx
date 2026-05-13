import { JournalTable } from "../components/JournalTable";
import "./Journal.css";

// ── JOURNAL TAB ───────────────────────────────────────────
// Props:
//   trades       – array of all trade objects
//   onScripClick – open detail modal for the clicked trade

export function Journal({ trades, onScripClick }) {
  return (
    <div className="card--np">
      <div className="card__header">
        <div>
          <div className="card__title">Trade Journal</div>
          <div className="card__sub">Click any SCRIP to view · Edit · Delete</div>
        </div>
        <span className="card__count">{trades.length} trades</span>
      </div>
      <JournalTable trades={trades} onScripClick={onScripClick} />
    </div>
  );
}