import { useEffect } from 'react';

export default function RecordDetailModal({ record, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!record) return null;

  const dateStr = record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const doctor = record.doctorId?.name || 'CareOS Provider';
  const medicines = record.payload?.medicines || [];
  const diagnoses = record.payload?.diagnoses || [];
  const notes = record.payload?.notes || '';
  const isPrescription = record.type === 'PRESCRIPTION';

  // Generate printable view in new tab when no pdfFileUrl
  const handleDownload = () => {
    if (record.pdfFileUrl) {
      window.open(record.pdfFileUrl, '_blank');
      return;
    }
    // Generate HTML printable page
    const html = `
      <!DOCTYPE html><html><head><title>${record.title || 'Prescription'}</title>
      <style>body{font-family:sans-serif;max-width:700px;margin:40px auto;color:#1a1a2e}h1{font-size:22px}h2{font-size:16px;margin-top:24px;border-bottom:1px solid #ddd;padding-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{text-align:left;padding:8px;border:1px solid #ddd;font-size:14px}th{background:#f5f5f5}.muted{color:#777;font-size:13px}@media print{button{display:none}}</style>
      </head><body>
      <h1>${record.title || 'Prescription'}</h1>
      <p class="muted">Issued by: <b>${doctor}</b> &nbsp;•&nbsp; Date: <b>${dateStr}</b></p>
      ${diagnoses.length ? `<h2>Diagnoses</h2><p>${diagnoses.join(', ')}</p>` : ''}
      ${medicines.length ? `<h2>Medications</h2><table><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr>${medicines.map(m => `<tr><td>${m.name}</td><td>${m.dosage || '—'}</td><td>${m.frequency || '—'}</td><td>${m.duration || '—'}</td><td>${m.instructions || '—'}</td></tr>`).join('')}</table>` : ''}
      ${notes ? `<h2>Clinical Notes</h2><p>${notes}</p>` : ''}
      <br/><button onclick="window.print()">Print / Save PDF</button>
      </body></html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-fade-in-up"
        style={{
          background: 'var(--surface-lowest)',
          borderRadius: 'var(--radius-3xl)', padding: 32,
          width: '100%', maxWidth: 660, maxHeight: '88vh',
          overflowY: 'auto', boxShadow: 'var(--shadow-ambient)',
        }}
      >
        {/* Header */}
        <div className="cp-flex cp-justify-between cp-items-start cp-mb-6">
          <div>
            <div className="cp-flex cp-items-center cp-gap-3 cp-mb-2">
              <span className={`cp-tag ${isPrescription ? 'cp-tag--primary' : 'cp-tag--success'}`}>
                {isPrescription ? 'Prescription' : record.type === 'LAB_REPORT' ? 'Lab Report' : 'Consultation'}
              </span>
              <span className="cp-muted cp-small">{dateStr}</span>
            </div>
            <h2 style={{ fontWeight: 900, color: 'var(--text-h)', fontSize: 20, marginBottom: 2 }}>{record.title || 'Health Record'}</h2>
            <p className="cp-muted cp-small">
              <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>person</span>
              {doctor}
            </p>
          </div>
          <button className="cp-btn cp-btn--ghost cp-btn--sm" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Diagnoses */}
        {diagnoses.length > 0 && (
          <div className="cp-mb-6">
            <h3 style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--on-surface-variant)', marginBottom: 12 }}>
              Diagnoses
            </h3>
            <div className="cp-flex" style={{ flexWrap: 'wrap', gap: 8 }}>
              {diagnoses.map(d => (
                <span key={d} className="cp-pill" style={{ background: 'var(--error-container)', color: 'var(--error)', fontWeight: 700 }}>{d}</span>
              ))}
            </div>
          </div>
        )}

        {/* Medicines */}
        {medicines.length > 0 && (
          <div className="cp-mb-6">
            <h3 style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--on-surface-variant)', marginBottom: 12 }}>
              Medications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {medicines.map((med, i) => (
                <div key={i} style={{
                  background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)',
                  padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 8, alignItems: 'start'
                }}>
                  <div style={{ gridColumn: 'span 3', fontWeight: 800, color: 'var(--text-h)', marginBottom: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6, color: 'var(--primary)' }}>medication</span>
                    {med.name}
                  </div>
                  {med.dosage && <div><span className="cp-muted" style={{ fontSize: 11 }}>Dosage</span><br /><b style={{ fontSize: 13 }}>{med.dosage}</b></div>}
                  {med.frequency && <div><span className="cp-muted" style={{ fontSize: 11 }}>Frequency</span><br /><b style={{ fontSize: 13 }}>{med.frequency}</b></div>}
                  {med.duration && <div><span className="cp-muted" style={{ fontSize: 11 }}>Duration</span><br /><b style={{ fontSize: 13 }}>{med.duration}</b></div>}
                  {med.instructions && (
                    <div style={{ gridColumn: 'span 3', fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>info</span>
                      {med.instructions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="cp-mb-6">
            <h3 style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--on-surface-variant)', marginBottom: 10 }}>
              Clinical Notes
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-h)', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: '12px 16px' }}>{notes}</p>
          </div>
        )}

        {medicines.length === 0 && diagnoses.length === 0 && !notes && (
          <p className="cp-muted" style={{ textAlign: 'center', padding: 24 }}>No detailed data available for this record.</p>
        )}

        {/* Actions */}
        <div className="cp-flex cp-gap-3" style={{ marginTop: 8 }}>
          <button className="cp-btn cp-btn--primary cp-flex-1" onClick={handleDownload}>
            <span className="material-symbols-outlined">download</span>
            {record.pdfFileUrl ? 'Download PDF' : 'Save as PDF'}
          </button>
          <button className="cp-btn cp-btn--ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
