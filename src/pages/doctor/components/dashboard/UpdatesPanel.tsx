import { useState } from 'react';
import { getPatient, labResults, consultationRequests } from '../../data';

type UpdateTab = 'all' | 'patients' | 'medical' | 'system';

export default function UpdatesPanel({
  onOpenLabResults,
  onOpenConsultation,
}: {
  onOpenLabResults: () => void;
  onOpenConsultation: () => void;
}) {
  const [activeTab, setActiveTab] = useState<UpdateTab>('all');

  /* Build a unified updates list from lab results + consultation requests */
  const allUpdates = [
    ...labResults.map((lr) => ({
      id: `lab-${lr.patientCode}-${lr.title}`,
      type: 'medical' as const,
      patientCode: lr.patientCode,
      title: lr.title,
      description: lr.description,
      timeLabel: lr.timeLabel,
      isNew: lr.status === 'Mới',
      icon: '🔬',
    })),
    ...consultationRequests.map((cr) => ({
      id: `consult-${cr.patientCode}-${cr.title}`,
      type: 'patients' as const,
      patientCode: cr.patientCode,
      title: cr.title,
      description: cr.summary,
      timeLabel: cr.timeLabel,
      isNew: cr.urgency === 'Khẩn cấp',
      icon: '💬',
    })),
    {
      id: 'system-update-1',
      type: 'system' as const,
      patientCode: '',
      title: 'Cập nhật danh sách thuốc',
      description: 'Đã thêm vị trí mới vào danh sách thuốc khả dụng.',
      timeLabel: '30 phút trước',
      isNew: false,
      icon: '📋',
    },
    {
      id: 'system-update-2',
      type: 'system' as const,
      patientCode: '',
      title: 'Thay đổi phác đồ điều trị',
      description: 'Đã cập nhật phác đồ điều trị bệnh mạn tính.',
      timeLabel: '1 giờ trước',
      isNew: false,
      icon: '⚕️',
    },
  ];

  const filteredUpdates = activeTab === 'all'
    ? allUpdates
    : allUpdates.filter((u) => u.type === activeTab);

  const tabs: { id: UpdateTab; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'patients', label: 'Bệnh nhân' },
    { id: 'medical', label: 'Y khoa' },
    { id: 'system', label: 'Hệ thống' },
  ];

  return (
    <section className="doctor-panel updates-panel">
      <div className="updates-header">
        <h3 className="panel-title">Cập nhật</h3>
        <button type="button" className="doctor-link-button" onClick={onOpenLabResults}>Chi tiết</button>
      </div>
      <div className="updates-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`updates-tab ${activeTab === tab.id ? 'updates-tab--active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="updates-list">
        {filteredUpdates.slice(0, 5).map((update) => {
          const patient = update.patientCode ? getPatient(update.patientCode) : null;
          return (
            <article key={update.id} className="update-item">
              <div className="update-icon">{update.icon}</div>
              <div className="update-content">
                <p className="update-title">
                  {update.title}
                  {update.isNew && <span className="update-new-badge">Mới</span>}
                </p>
                <p className="update-desc">{update.description}</p>
                {patient && <p className="update-patient">{patient.name}</p>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
