import { getPatient, labResults } from '../data';

export default function LabResultsView({ onOpenRecord }: { onOpenRecord: (code: string) => void }) {
  return (
    <div className="doctor-dashboard-home">
      <section className="doctor-dashboard-heading-row">
        <div>
          <h2 className="doctor-page-title">Kết quả cận lâm sàng</h2>
          <p className="doctor-greeting">Theo dõi kết quả mới, kết quả đang chờ và kết quả đã xem trong ca trực.</p>
        </div>
      </section>
      <section className="doctor-panel">
        <div className="waiting-table-scroll">
          <table className="waiting-table">
            <thead>
              <tr>
                <th>Bệnh nhân</th>
                <th>Loại</th>
                <th>Kết quả</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {labResults.map((item) => {
                const patient = getPatient(item.patientCode);
                const badgeClass = item.status === 'Mới' ? 'badge--new' : item.status === 'Đang chờ KQ' ? 'badge--pending' : 'badge--viewed';
                return (
                  <tr key={`${item.patientCode}-${item.title}`}>
                    <td>
                      <span className="waiting-patient-name">{patient.name}</span>
                      <span className="cls-code"> ({patient.code})</span>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      <div className="cls-name">{item.title}</div>
                      <div className="cls-desc">{item.description}</div>
                    </td>
                    <td>{item.timeLabel}</td>
                    <td><span className={`status-pill ${badgeClass}`}>{item.status}</span></td>
                    <td className="text-right">
                      <button type="button" onClick={() => onOpenRecord(patient.code)} className="btn-secondary-compact">
                        Xem hồ sơ
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
