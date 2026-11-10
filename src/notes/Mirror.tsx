import { Icon } from "./Icon";
import { MOODS, countWords, dateLabel, localDate, type Entry } from "./model";

export function Mirror({
  entries,
  open,
  recap = false,
}: {
  entries: Entry[];
  open: (entry: Entry) => void;
  recap?: boolean;
}) {
  const start = new Date();
  start.setDate(start.getDate() - 6);
  const records = recap
    ? entries.filter((entry) => entry.date >= localDate(start) && entry.date <= localDate())
    : entries;
  const words = records.reduce((count, entry) => count + countWords(entry.body), 0);
  const days = new Set(records.map((entry) => entry.date)).size;
  const tags = new Map<string, number>();
  records.forEach((entry) => entry.tags.forEach((tag) => tags.set(tag, (tags.get(tag) ?? 0) + 1)));
  const topTags = [...tags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  return (
    <section className="scroll-view mirror-screen">
      <div className="section-heading">
        <div>
          <span className="label">
            {recap ? "THE LAST SEVEN DAYS" : "OBSERVATION-ONLY SELF MIRROR"}
          </span>
          <h1>{recap ? "A week worth returning to." : "A reflection, still becoming."}</h1>
        </div>
        <span className="dossier-stamp">{recap ? "WEEKLY RECAP" : "YOUR ENGRAM"}</span>
      </div>
      <div className="mirror-hero">
        <div className="mirror-visual">
          <div className="iris-orb large" aria-hidden="true">
            <span />
          </div>
          <div className="orbit-label label">{records.length} POINTS OF REFERENCE</div>
        </div>
        <div>
          <span className="label accent">
            {recap
              ? `${dateLabel(localDate(start))} — ${dateLabel(localDate())}`
              : "YOU REMAIN THE AUTHOR"}
          </span>
          <h2>
            {records.length
              ? "Your words form\na living record."
              : "A mirror begins\nwith what you share."}
          </h2>
          <p>
            {records.length
              ? `This view draws from ${records.length} saved ${records.length === 1 ? "entry" : "entries"} across ${days} ${days === 1 ? "day" : "days"}. Every number below comes from your notebook.`
              : "Save a note or check in with a mood. Your mirror will show the record you build, with links back to its sources."}
          </p>
          <span className="provenance">
            <Icon name="eye" size={14} />
            Calculated from entries · No personality diagnosis
          </span>
        </div>
      </div>
      <div className="stats-row">
        <div>
          <span className="label">ENTRIES</span>
          <strong>{records.length}</strong>
        </div>
        <div>
          <span className="label">WORDS CAPTURED</span>
          <strong>{words.toLocaleString()}</strong>
        </div>
        <div>
          <span className="label">DAYS REFLECTED</span>
          <strong>{days}</strong>
        </div>
      </div>
      <div className="mirror-grid">
        <article className="panel">
          <span className="label">MOOD LANDSCAPE</span>
          <h2>The feelings you named.</h2>
          <div className="mood-bars">
            {MOODS.map((mood) => {
              const count = records.filter((entry) => entry.mood === mood.id).length;
              return (
                <div className="mood-bar" key={mood.id}>
                  <span>
                    <i style={{ background: mood.color }} />
                    {mood.label}
                  </span>
                  <div>
                    <span
                      style={{
                        width: records.length ? `${(count / records.length) * 100}%` : "0%",
                        background: mood.color,
                      }}
                    />
                  </div>
                  <span>{count}</span>
                </div>
              );
            })}
          </div>
          <p className="fine-print">
            Counts of your selected moods. Entries without a mood are not assigned one.
          </p>
        </article>
        <article className="panel">
          <span className="label">RECURRING THREADS</span>
          <h2>Where your attention returns.</h2>
          {topTags.length ? (
            <div className="thread-tags">
              {topTags.map(([tag, count]) => (
                <span className="thread-tag" key={tag}>
                  {tag}
                  <small>
                    {count} {count === 1 ? "entry" : "entries"}
                  </small>
                </span>
              ))}
            </div>
          ) : (
            <p>Add tags to your entries to see your recurring threads here.</p>
          )}
          <p className="fine-print">These are tags you chose, rather than inferred interests.</p>
        </article>
      </div>
      <div className="section-heading small">
        <div>
          <span className="label">SOURCE RECORD</span>
          <h2>Return to the moment.</h2>
        </div>
      </div>
      <div className="source-list">
        {records.slice(0, 12).map((entry) => (
          <button key={entry.id} onClick={() => open(entry)}>
            <span className="label">{dateLabel(entry.date)}</span>
            <span>{entry.title || entry.body.slice(0, 70)}</span>
            <Icon name="arrow" size={15} />
          </button>
        ))}
        {!records.length && <p className="fine-print">Your saved entries will be linked here.</p>}
      </div>
    </section>
  );
}
