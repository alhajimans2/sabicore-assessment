import { useEffect, useMemo, useRef, useState } from 'react';
import studiesData from './mockStudies.json';

const STATUS = {
  pending: 'pending',
  included: 'included',
  excluded: 'excluded',
  maybe: 'maybe',
};

export default function StudyScreener() {
  const [query, setQuery] = useState('');
  const [studies, setStudies] = useState(studiesData);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);

  const filteredStudies = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return studies;

    return studies.filter((study) => {
      const searchable = `${study.title} ${study.authors} ${study.abstract} ${study.year}`.toLowerCase();
      return searchable.includes(term);
    });
  }, [query, studies]);

  useEffect(() => {
    if (filteredStudies.length === 0) {
      setActiveIndex(0);
      return;
    }

    if (activeIndex > filteredStudies.length - 1) {
      setActiveIndex(filteredStudies.length - 1);
    }
  }, [filteredStudies, activeIndex]);

  useEffect(() => {
    const handler = (event) => {
      if (filteredStudies.length === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredStudies.length);
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filteredStudies.length) % filteredStudies.length);
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        const selected = filteredStudies[activeIndex];
        if (selected) {
          setStatus(selected.id, STATUS.maybe);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filteredStudies, activeIndex]);

  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index='${activeIndex}']`);
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, filteredStudies]);

  const activeStudy = filteredStudies[activeIndex] || null;

  const setStatus = (studyId, status) => {
    setStudies((prev) =>
      prev.map((study) => (study.id === studyId ? { ...study, status } : study))
    );
  };

  const stats = useMemo(() => {
    return studies.reduce(
      (acc, study) => {
        acc.total += 1;
        acc[study.status] += 1;
        return acc;
      },
      { total: 0, pending: 0, included: 0, excluded: 0, maybe: 0 }
    );
  }, [studies]);

  return (
    <div className="page">
      <header className="hero">
        <h1>Study Screener</h1>
        <p>Keyboard shortcuts: Arrow Up/Down to move, Enter to mark as Maybe.</p>
      </header>

      <section className="summary-grid">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Included" value={stats.included} />
        <StatCard label="Excluded" value={stats.excluded} />
        <StatCard label="Maybe" value={stats.maybe} />
      </section>

      <div className="workspace">
        <aside className="list-panel">
          <div className="panel-header">
            <h2>Studies</h2>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, abstract, author, year..."
              aria-label="Search studies"
            />
          </div>

          <ul ref={listRef} className="study-list">
            {filteredStudies.map((study, index) => (
              <li key={study.id}>
                <button
                  type="button"
                  data-index={index}
                  onClick={() => setActiveIndex(index)}
                  className={`study-item ${index === activeIndex ? 'active' : ''}`}
                >
                  <p className="title">{study.title}</p>
                  <p className="meta">
                    {study.authors} • {study.year}
                  </p>
                  <span className={`pill ${study.status}`}>{study.status}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="detail-panel">
          {!activeStudy ? (
            <p className="empty-state">No matching studies found.</p>
          ) : (
            <>
              <h2>{activeStudy.title}</h2>
              <p className="detail-meta">
                {activeStudy.authors} • {activeStudy.year}
              </p>
              <p className="abstract">{activeStudy.abstract}</p>
              <div className="actions">
                <button type="button" onClick={() => setStatus(activeStudy.id, STATUS.included)}>
                  Include
                </button>
                <button type="button" onClick={() => setStatus(activeStudy.id, STATUS.excluded)}>
                  Exclude
                </button>
                <button type="button" onClick={() => setStatus(activeStudy.id, STATUS.maybe)}>
                  Maybe
                </button>
                <button type="button" onClick={() => setStatus(activeStudy.id, STATUS.pending)}>
                  Reset
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
