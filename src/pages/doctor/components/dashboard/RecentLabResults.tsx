import { getPatient, labResults } from '../../data';

export default function RecentLabResults({ onOpenLabResults }: { onOpenLabResults: () => void }) {
  return (
    <article className="doctor-panel-padded">
      <div className="cls-header">
        <div>
          <h3 className="panel-title">Kết quả cận lâm sàng mới</h3>
          <p className="panel-subtitle">Các kết quả cần bác sĩ xem</p>
        </div>
        <button type="button" onClick={onOpenLabResults} className="doctor-link-button">Xem tất cả</button>
      </div>
      <div className="cls-list">
        {labResults.map((item) => {
          const patient = getPatient(item.patientCode);
          const badgeClass = item.status === 'Mới' ? 'badge--new' : item.status === 'Đang chờ KQ' ? 'badge--pending' : 'badge--viewed';
          return (
            <article
              key={`${item.patientCode}-${item.title}`}
              className="cls-item"
            >
              <div className="cls-main">
                <span className="cls-name">{patient.name} <span className="cls-code">({patient.code})</span></span>
                <span className={`status-pill ${badgeClass}`}>{item.status}</span>
              </div>
              <div className="cls-desc">{item.category} · {item.title}: {item.description}</div>
              <div className="cls-time">{item.timeLabel}</div>
            </article>
          );
        })}
      </div>
    </article>
  );
}
