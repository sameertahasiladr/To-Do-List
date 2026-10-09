import { Stats } from "../types";

export default function StatsBar({ stats }: { stats: Stats | null }) {
  if (!stats) return null;
  const percent = stats.total ? Math.round((stats.complete / stats.total) * 100) : 0;

  return (
    <section className="stats" aria-label="Progress">
      <div className="stats-top">
        <p className="stats-line">
          {stats.total === 0 ? (
            "No tasks yet"
          ) : (
            <>
              <strong>{stats.complete} of {stats.total}</strong> tasks complete
            </>
          )}
        </p>
        <span className="stats-pct">{percent}%</span>
      </div>
      <div className="progress" role="progressbar" aria-label="Tasks completed" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-bar" style={{ width: `${percent}%` }} />
      </div>
      <dl className="stats-legend">
        <div><dt><i className="dot dot-done" />Completed</dt><dd>{stats.complete}</dd></div>
        <div><dt><i className="dot dot-todo" />Pending</dt><dd>{stats.incomplete}</dd></div>
        <div><dt><i className="dot dot-all" />Total</dt><dd>{stats.total}</dd></div>
      </dl>
    </section>
  );
}
