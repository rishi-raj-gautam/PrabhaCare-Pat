import { useState } from 'react';
import { useApp } from '../context/AppContext';
import DoctorCard from '../components/DoctorCard';
import { SPECIALTIES } from '../data/mockData';

export default function DoctorDiscovery() {
  const { doctors = [] } = useApp();
  const [search, setSearch] = useState('');
  const [selectedSpecs, setSelectedSpecs] = useState(['Cardiologist']);
  const [experience, setExperience] = useState('any');
  const [maxFee, setMaxFee] = useState(5000);
  const [sortBy, setSortBy] = useState('relevance');

  const toggleSpec = (spec) => {
    setSelectedSpecs(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const filteredDoctors = doctors.filter(doc => {
    if (search && !doc.name.toLowerCase().includes(search.toLowerCase()) &&
        !doc.specialty.toLowerCase().includes(search.toLowerCase())) return false;
    if (doc.fee > maxFee) return false;
    if (experience === '5+' && doc.experience < 5) return false;
    if (experience === '10+' && doc.experience < 10) return false;
    if (experience === '20+' && doc.experience < 20) return false;
    return true;
  });

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'experience') return b.experience - a.experience;
    if (sortBy === 'fee') return a.fee - b.fee;
    return 0;
  });

  return (
    <div className="cp-page">
      {/* Hero */}
      <section className="cp-mb-8 animate-fade-in-up">
        <h1 className="cp-headline" style={{ marginBottom: 24 }}>
          Discovery your clinical care.
        </h1>
        <div className="cp-search-bar">
          <span className="material-symbols-outlined" style={{ color: 'var(--outline)' }}>search</span>
          <input
            className="cp-search-input"
            placeholder="Search by name, specialty, or condition..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="cp-search-divider" />
          <div className="cp-search-location">
            <span className="material-symbols-outlined">location_on</span>
            <span>New Delhi</span>
          </div>
          <button className="cp-btn cp-btn--primary">Search</button>
        </div>
      </section>

      <div className="cp-grid cp-grid--12">
        {/* Filters Sidebar */}
        <aside className="cp-col-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="cp-card cp-card--flat" style={{ borderRadius: 'var(--radius-xl)' }}>
            <div className="cp-flex cp-justify-between cp-items-center cp-mb-6">
              <h3 style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-h)' }}>Filters</h3>
              <button className="cp-btn cp-btn--ghost cp-btn--sm" onClick={() => { setSelectedSpecs([]); setExperience('any'); setMaxFee(5000); }}>
                Clear All
              </button>
            </div>

            {/* Specialty */}
            <div className="cp-filter-section">
              <div className="cp-filter-title">Specialty</div>
              <div className="cp-filter-list">
                {SPECIALTIES.slice(0, 4).map(spec => (
                  <label key={spec} className="cp-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedSpecs.includes(spec)}
                      onChange={() => toggleSpec(spec)}
                    />
                    <span>{spec}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="cp-filter-section">
              <div className="cp-filter-title">Experience</div>
              <select
                className="cp-select"
                value={experience}
                onChange={e => setExperience(e.target.value)}
              >
                <option value="any">Any Experience</option>
                <option value="5+">5+ Years</option>
                <option value="10+">10+ Years</option>
                <option value="20+">20+ Years</option>
              </select>
            </div>

            {/* Fee Range */}
            <div className="cp-filter-section">
              <div className="cp-filter-title">Consultation Fee</div>
              <input
                type="range"
                className="cp-range"
                min={0}
                max={5000}
                step={500}
                value={maxFee}
                onChange={e => setMaxFee(Number(e.target.value))}
              />
              <div className="cp-flex cp-justify-between cp-mt-2">
                <span className="cp-muted cp-small">₹0</span>
                <span className="cp-muted cp-small">₹5,000+</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section className="cp-col-9">
          <div className="cp-flex cp-justify-between cp-items-center cp-mb-6 animate-fade-in-up">
            <p style={{ color: 'var(--secondary)' }}>
              Showing <strong style={{ color: 'var(--text-h)' }}>{sortedDoctors.length}</strong> doctors
            </p>
            <div className="cp-flex cp-items-center cp-gap-2">
              <span className="cp-muted cp-small">Sort by:</span>
              <select
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: 14,
                  color: 'var(--text-h)',
                  cursor: 'pointer',
                }}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Rating (High to Low)</option>
                <option value="experience">Experience</option>
                <option value="fee">Fee (Low to High)</option>
              </select>
            </div>
          </div>

          <div className="cp-flex cp-flex-col cp-gap-6">
            {sortedDoctors.map((doc, i) => (
              <div key={doc.id} style={{ animationDelay: `${0.1 + i * 0.08}s` }} className="animate-fade-in-up">
                <DoctorCard doctor={doc} />
              </div>
            ))}
            {sortedDoctors.length === 0 && (
              <div className="cp-card" style={{ textAlign: 'center', padding: 48 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--muted)', marginBottom: 16 }}>search_off</span>
                <p style={{ color: 'var(--muted)' }}>No doctors found matching your filters.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
