export default function RecordCard({ record, style, onView }) {
  const dateStr = record.createdAt ? new Date(record.createdAt).toLocaleDateString() : (record.date || '');
  const provider = record.doctorId?.name || record.provider || 'CareOS Provider';
  const typeLabel =
    record.type === 'PRESCRIPTION' ? 'Prescription' :
    record.type === 'LAB_REPORT' ? 'Lab Report' :
    record.type === 'CONSULTATION_NOTE' ? 'Consultation' : record.type;
  const icon =
    record.type === 'PRESCRIPTION' ? 'description' :
    record.type === 'LAB_REPORT' ? 'lab_research' : 'medical_services';
  const tagClass =
    record.type === 'PRESCRIPTION' ? 'cp-tag--primary' :
    record.type === 'LAB_REPORT' ? 'cp-tag--success' : 'cp-tag--neutral';

  return (
    <div className="cp-record-card" style={style}>
      <div className="cp-record-header">
        <div style={{ flex: 1 }}>
          <div className="cp-flex cp-items-center cp-gap-3 cp-mb-2">
            <span className={`cp-tag ${tagClass}`}>{typeLabel}</span>
            <span className="cp-muted cp-small">{dateStr}</span>
          </div>
          <div className="cp-record-title">{record.title}</div>
          <div className="cp-record-provider">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
            {provider}
          </div>
          {record.payload?.medicines && (
            <div className="cp-record-values">
              {record.payload.medicines.slice(0, 3).map(m => (
                <span key={m.name} className="cp-record-value-pill">{m.name}</span>
              ))}
              {record.payload.medicines.length > 3 && (
                <span className="cp-record-value-pill">+{record.payload.medicines.length - 3} more</span>
              )}
            </div>
          )}
          {record.pdfFileUrl && (
            <div className="cp-flex cp-items-center cp-gap-2" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14, marginTop: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>picture_as_pdf</span>
              Digital Copy Attached
            </div>
          )}
        </div>
        <div className="cp-record-actions">
          {record.pdfFileUrl && (
            <a href={record.pdfFileUrl} download={`Record_${record.title}.pdf`} className="cp-record-action-btn" title="Download">
              <span className="material-symbols-outlined">download</span>
            </a>
          )}
          {/* Fix #4: onView callback opens detail modal */}
          <button className="cp-record-action-btn" title="View Details" onClick={() => onView && onView(record)}>
            <span className="material-symbols-outlined">visibility</span>
          </button>
        </div>
      </div>
    </div>
  );
}
