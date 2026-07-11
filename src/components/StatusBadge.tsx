import { STATUS_COLOR, STATUS_LABEL, type StockStatus } from "@/lib/stock";

export function StatusBadge({ status, compact }: { status: StockStatus; compact?: boolean }) {
  const dot: Record<StockStatus, string> = {
    SUFFISANT: "🟢",
    FAIBLE: "🟠",
    RUPTURE: "🔴",
  };
  return (
    <span className={`status-pill ${STATUS_COLOR[status]}`}>
      <span aria-hidden>{dot[status]}</span>
      {!compact && STATUS_LABEL[status]}
    </span>
  );
}

export function PlannedBadge() {
  return (
    <span className="status-pill status-planned">
      <span aria-hidden>🔵</span>
      Prévu au réapprovisionnement
    </span>
  );
}
