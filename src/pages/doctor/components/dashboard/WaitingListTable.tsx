import { forwardRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getPatient } from '../../data';
import type { Appointment } from '../../types';
import { StatusPill } from '../shared';

type WaitingListTab = 'all' | 'waiting' | 'urgent' | 'delayed' | 'done';

type WaitingListTableProps = {
  appointments: Appointment[];
  activePatientId: string | null;
  activeTab: WaitingListTab;
  onTabChange: (tab: WaitingListTab) => void;
  onCall: (appointment: Appointment) => void;
  onOpenRecord: (code: string) => void;
  onOpenActiveExam: () => void;
};

const WaitingListTable = forwardRef<HTMLElement, WaitingListTableProps>(function WaitingListTable(
  { appointments, activePatientId, activeTab, onTabChange, onCall, onOpenRecord, onOpenActiveExam },
  ref,
) {
  const urgentCount = appointments.filter((a) => a.triageFlag).length;
  const waitingCount = appointments.filter((a) => a.status === 'Đang chờ' || a.status === 'Đang khám').length;
  const delayedCount = appointments.filter((a) => a.status === 'Đang chờ' && a.waitMinutes > 15).length;
  const doneCount = appointments.filter((a) => a.status === 'Đã khám').length;
  const displayedAppointments =
    activeTab === 'urgent'
      ? appointments.filter((a) => a.triageFlag)
      : activeTab === 'waiting'
        ? appointments.filter((a) => a.status === 'Đang chờ' || a.status === 'Đang khám')
        : activeTab === 'delayed'
          ? appointments.filter((a) => a.status === 'Đang chờ' && a.waitMinutes > 15)
          : activeTab === 'done'
            ? appointments.filter((a) => a.status === 'Đã khám')
            : appointments;
  const firstWaitingIndex = displayedAppointments.findIndex((a) => a.status === 'Đang chờ');
  const tabs: Array<{ id: WaitingListTab; label: string; count: number }> = [
    { id: 'all', label: 'Tất cả', count: appointments.length },
    { id: 'waiting', label: 'Đang chờ', count: waitingCount },
    { id: 'urgent', label: 'Khẩn cấp', count: urgentCount },
    { id: 'delayed', label: 'Chờ lâu', count: delayedCount },
    { id: 'done', label: 'Đã khám', count: doneCount },
  ];

  return (
    <section ref={ref} className="doctor-panel">
      <div className="waiting-table-header">
        <div>
          <h3 className="panel-title">Danh sách ca khám hôm nay</h3>
          <p className="panel-subtitle">Ưu tiên nguy cơ cao và bệnh nhân chờ lâu</p>
        </div>
        <div className="waiting-table-actions">
          <div className="waiting-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`waiting-tab ${activeTab === tab.id ? tab.id === 'urgent' ? 'waiting-tab--urgent-active' : 'waiting-tab--active' : ''}`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
          <button type="button" className="doctor-link-button">Xem tất cả</button>
        </div>
      </div>
      <div className="waiting-table-scroll">
        <table className="waiting-table waiting-table--fit">
          <thead>
            <tr>
              <th>Giờ</th>
              <th>Bệnh nhân</th>
              <th>Triệu chứng</th>
              <th>Trạng thái</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {displayedAppointments.map((row, index) => {
              const patient = getPatient(row.patientCode);
              const isActivePatient = row.id === activePatientId;
              const waiting = row.status === 'Đang chờ';
              const firstWaiting = waiting && index === firstWaitingIndex;
              const waitLabel = row.waitMinutes > 0 ? `Chờ ${row.waitMinutes} phút` : null;
              return (
                <tr key={row.id} className={isActivePatient ? 'waiting-row--active' : firstWaiting ? 'waiting-row--next' : undefined}>
                  <td className={`waiting-row-marker ${isActivePatient ? 'waiting-row-marker--active' : firstWaiting ? 'waiting-row-marker--next' : ''}`}>{row.time}</td>
                  <td>
                    <div className="waiting-patient-cell">
                      <span className="waiting-patient-name">
                        {patient.name}
                        {row.triageFlag ? (
                          <span className={`waiting-risk-badge ${row.riskLevel === 'Khẩn cấp' ? 'waiting-risk-badge--critical' : 'waiting-risk-badge--warning'}`} title={row.riskReason ?? ''}>
                            <AlertTriangle size={11} />
                            {row.riskLevel ?? 'Cần xem sớm'}
                          </span>
                        ) : null}
                      </span>
                      <span className="waiting-patient-sub">
                        {patient.age} tuổi · {patient.gender}
                        {waitLabel ? ` · ${waitLabel}` : ''}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="symptom-cell" title={row.summary}>{row.summary}</div>
                  </td>
                  <td><StatusPill status={row.status} /></td>
                  <td className="text-right">
                    {isActivePatient ? (
                      <button type="button" onClick={onOpenActiveExam} className="btn-secondary-compact">
                        Tiếp tục khám
                      </button>
                    ) : waiting && firstWaiting ? (
                      <button type="button" onClick={() => onCall(row)} className="btn-primary-compact">
                        Gọi vào khám
                      </button>
                    ) : waiting && row.triageFlag ? (
                      <button type="button" onClick={() => onCall(row)} className="btn-secondary-danger">
                        Ưu tiên khám
                      </button>
                    ) : (
                      <button type="button" onClick={() => onOpenRecord(patient.code)} className="btn-secondary-compact">
                        Xem hồ sơ
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!displayedAppointments.length ? (
              <tr>
                <td colSpan={5} className="table-empty">
                  Không có ca nào trong nhóm này.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
});

export default WaitingListTable;
