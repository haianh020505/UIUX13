import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3, Edit3, Mail, Plus, Save, Search, Send, Smartphone, Trash2, X, XCircle } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import ConfirmDialog from './components/ConfirmDialog';
import Field from './components/Field';

type NotificationTab = 'config' | 'manual' | 'history';
type ReminderOffset = '24h' | '2h';
type ChannelMode = 'sms-email' | 'sms' | 'email';
type TemplateType = 'appointment' | 'result' | 'payment' | 'followup';
type HistoryStatus = 'success' | 'failed' | 'pending';
type HistoryChannel = 'SMS' | 'Email' | 'SMS & Email';

type Template = {
  id: string;
  title: string;
  type: TemplateType;
  content: string;
  updatedAt: string;
};

type HistoryItem = {
  id: string;
  time: string;
  recipient: string;
  phone: string;
  content: string;
  channel: HistoryChannel;
  status: HistoryStatus;
  errorReason?: string;
};

type Recipient = {
  id: number;
  name: string;
  phone: string;
  time: string;
  selected: boolean;
};

const tabs: Array<{ id: NotificationTab; label: string }> = [
  { id: 'manual', label: 'Gửi thông báo' },
  { id: 'config', label: 'Cấu hình & Template' },
  { id: 'history', label: 'Lịch sử gửi' },
];

const templateTypes: Record<TemplateType, string> = {
  appointment: 'Nhắc lịch hẹn',
  result: 'Kết quả xét nghiệm',
  payment: 'Thanh toán',
  followup: 'Tái khám',
};

const initialTemplates: Template[] = [
  {
    id: 'TPL-001',
    title: 'Nhắc lịch hẹn',
    type: 'appointment',
    content: 'Chào {ten_bn}, bạn có lịch khám tại {phong_kham} lúc {gio_hen}, ngày {ngay_hen}. Vui lòng đến trước 10 phút.',
    updatedAt: '10/05/2026',
  },
  {
    id: 'TPL-002',
    title: 'Kết quả xét nghiệm',
    type: 'result',
    content: 'Kết quả xét nghiệm của {ten_bn} đã có trên hệ thống. Vui lòng đăng nhập hoặc liên hệ quầy tiếp nhận để được hỗ trợ.',
    updatedAt: '08/05/2026',
  },
  {
    id: 'TPL-003',
    title: 'Nhắc tái khám',
    type: 'followup',
    content: 'Chào {ten_bn}, phòng khám nhắc bạn lịch tái khám dự kiến vào {ngay_hen}. Vui lòng xác nhận lại lịch khi thuận tiện.',
    updatedAt: '06/05/2026',
  },
];

const initialHistory: HistoryItem[] = [
  { id: 'HIS-001', time: '10/05/2026 - 08:30', recipient: 'Lê Tuấn Anh', phone: '0988.123.456', content: 'Nhắc lịch khám Tai Mũi Họng lúc 09:00...', channel: 'SMS', status: 'success' },
  { id: 'HIS-002', time: '10/05/2026 - 08:15', recipient: 'Nguyễn Thị C', phone: '0912.345.678', content: 'Thông báo kết quả xét nghiệm đã có...', channel: 'Email', status: 'failed', errorReason: 'Sai định dạng email' },
  { id: 'HIS-003', time: '10/05/2026 - 09:05', recipient: 'Nhật Linh', phone: '0977.222.333', content: 'Nhắc lịch khám Nội Tổng Hợp lúc 10:00...', channel: 'SMS & Email', status: 'success' },
  { id: 'HIS-004', time: '10/05/2026 - 09:40', recipient: 'Đỗ Minh Khôi', phone: '0904.111.222', content: 'Thông báo lịch hẹn đã được hủy theo yêu cầu...', channel: 'SMS', status: 'success' },
  { id: 'HIS-005', time: '10/05/2026 - 10:00', recipient: 'Nguyễn Duy Cương', phone: '0933.456.789', content: 'Tin nhắn xác nhận lịch đang chờ gửi...', channel: 'SMS & Email', status: 'pending' },
];

const recipientGroups = [
  'Bệnh nhân có lịch hẹn hôm nay (10/05)',
  'Bệnh nhân chờ xác nhận lịch',
  'Bệnh nhân có kết quả xét nghiệm',
  'Bệnh nhân cần tái khám trong tuần',
];

export default function NotificationReminderManagement({ onNotify }: { onNotify?: (message: string) => void }) {
  const [activeTab, setActiveTab] = useState<NotificationTab>('manual');
  const [templates, setTemplates] = useState(initialTemplates);
  const [history, setHistory] = useState(initialHistory);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplates[0]?.id ?? '');

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-800">{activeTab === 'manual' ? 'Gửi thông báo' : activeTab === 'config' ? 'Cấu hình & Template' : 'Lịch sử gửi thông báo'}</h1>
      <NotificationTabs activeTab={activeTab} onChange={setActiveTab} />
      <div className="mt-5">
        {activeTab === 'config' ? (
          <ConfigTab
            templates={templates}
            onChangeTemplates={setTemplates}
            onNotify={onNotify}
            onQuickSend={(template) => {
              setSelectedTemplateId(template.id);
              setActiveTab('manual');
            }}
          />
        ) : null}
        {activeTab === 'manual' ? (
          <ManualNotificationTab
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onNotify={(message) => {
              const next: HistoryItem = {
                id: `HIS-${String(history.length + 1).padStart(3, '0')}`,
                time: '10/05/2026 - 10:30',
                recipient: 'Nhóm bệnh nhân',
                phone: '--',
                content: message,
                channel: 'SMS & Email',
                status: 'success',
              };
              setHistory((items) => [next, ...items]);
              onNotify?.('Đã gửi thông báo');
            }}
          />
        ) : null}
        {activeTab === 'history' ? <HistoryTab history={history} onNotify={onNotify} /> : null}
      </div>
    </div>
  );
}

function NotificationTabs({ activeTab, onChange }: { activeTab: NotificationTab; onChange: (tab: NotificationTab) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex min-w-[640px]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex h-14 min-w-48 items-center justify-center px-5 text-sm font-extrabold transition ${
              activeTab === tab.id ? 'text-brand' : 'text-slate-500 hover:text-brand'
            }`}
          >
            {tab.label}
            {activeTab === tab.id ? <span className="absolute bottom-0 left-0 h-1 w-full bg-brand" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function ConfigTab({
  templates,
  onChangeTemplates,
  onNotify,
  onQuickSend,
}: {
  templates: Template[];
  onChangeTemplates: (templates: Template[]) => void;
  onNotify?: (message: string) => void;
  onQuickSend: (template: Template) => void;
}) {
  const [offsets, setOffsets] = useState<Record<ReminderOffset, boolean>>({ '24h': true, '2h': false });
  const [channel, setChannel] = useState<ChannelMode>('sms-email');
  const [enabledSpecialties, setEnabledSpecialties] = useState<Record<string, boolean>>({ 'Nội Tổng Hợp': true, 'Răng Hàm Mặt': false, 'Tai Mũi Họng': true, 'Nhi Khoa': true });
  const [editingTemplate, setEditingTemplate] = useState<Template | 'new' | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<Template | null>(null);
  const [confirmSaveConfig, setConfirmSaveConfig] = useState(false);
  const allSpecialtiesEnabled = Object.values(enabledSpecialties).every(Boolean);

  return (
    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="panel-title">Cấu hình nhắc lịch tự động</h2>
          <p className="panel-subtitle">Thiết lập thời điểm, kênh gửi và chuyên khoa được bật nhắc lịch.</p>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <p className="mb-3 text-sm font-extrabold text-slate-700">Thời điểm gửi trước giờ khám</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <CheckOption label="Trước 24 tiếng" checked={offsets['24h']} onChange={() => setOffsets((value) => ({ ...value, '24h': !value['24h'] }))} />
              <CheckOption label="Trước 2 tiếng" checked={offsets['2h']} onChange={() => setOffsets((value) => ({ ...value, '2h': !value['2h'] }))} />
            </div>
          </div>
          <Field label="Kênh thông báo">
            <SelectMenu
              value={channelLabels[channel]}
              options={Object.values(channelLabels)}
              onChange={(value) => setChannel(Object.entries(channelLabels).find(([, label]) => label === value)?.[0] as ChannelMode)}
            />
          </Field>
          <Field label="Mẫu áp dụng (Mặc định)">
            <div className="flex min-h-12 items-center rounded-md border border-slate-200 bg-slate-50 px-4">
              <span className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">Mẫu: Nhắc lịch hẹn tự động</span>
            </div>
          </Field>
          <div>
            <p className="mb-3 text-sm font-extrabold text-slate-700">Bật/Tắt theo chuyên khoa</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-sky-100 bg-sky-50 px-4 py-3">
                <span className="text-sm font-extrabold text-slate-800">Bật/Tắt tất cả chuyên khoa</span>
                <Toggle
                  checked={allSpecialtiesEnabled}
                  onChange={() => {
                    const nextValue = !allSpecialtiesEnabled;
                    setEnabledSpecialties((items) => Object.fromEntries(Object.keys(items).map((specialty) => [specialty, nextValue])));
                  }}
                />
              </div>
              {Object.entries(enabledSpecialties).map(([specialty, enabled]) => (
                <div key={specialty} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-bold text-slate-700">{specialty}</span>
                  <Toggle checked={enabled} onChange={() => setEnabledSpecialties((items) => ({ ...items, [specialty]: !items[specialty] }))} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end border-t border-slate-100 px-4 py-3">
          <button type="button" onClick={() => setConfirmSaveConfig(true)} className="secondary-action">
            <Save size={16} />
            Lưu cấu hình
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="panel-title">Quản lý Template</h2>
            <p className="panel-subtitle">Mẫu tin nhắn dùng cho SMS và Email.</p>
          </div>
          <button type="button" onClick={() => setEditingTemplate('new')} className="secondary-action h-9 px-4">
            <Plus size={15} />
            Thêm mẫu
          </button>
        </div>
        <div className="space-y-3 p-4">
          {templates.map((template) => (
            <article key={template.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4 transition hover:border-brand/40 hover:bg-sky-50/50">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-brand">
                    Mẫu: {template.title} <span className="text-slate-400">({template.type})</span>
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-7 text-slate-500">
                    <TemplateContent text={template.content} />
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-400">Cập nhật: {template.updatedAt}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button type="button" onClick={() => onQuickSend(template)} className="icon-button h-9 w-9" aria-label={`Gửi bằng mẫu ${template.title}`}>
                    <Send size={16} />
                  </button>
                  <button type="button" onClick={() => setEditingTemplate(template)} className="icon-button h-9 w-9" aria-label={`Sửa ${template.title}`}>
                    <Edit3 size={16} />
                  </button>
                  <button type="button" onClick={() => setDeleteTemplate(template)} className="icon-button h-9 w-9 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500" aria-label={`Xóa ${template.title}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {editingTemplate ? (
        <TemplateForm
          template={editingTemplate === 'new' ? null : editingTemplate}
          onCancel={() => setEditingTemplate(null)}
          onSave={(template) => {
            if (editingTemplate === 'new') {
              onChangeTemplates([...templates, template]);
              onNotify?.('Đã thêm template');
            } else {
              onChangeTemplates(templates.map((item) => (item.id === template.id ? template : item)));
              onNotify?.('Đã lưu template');
            }
            setEditingTemplate(null);
          }}
        />
      ) : null}

      {deleteTemplate ? (
        <ConfirmDialog
          title="Xóa template?"
          message={`Template "${deleteTemplate.title}" sẽ bị xóa khỏi danh sách mẫu thông báo.`}
          confirmText="Xóa"
          tone="danger"
          onCancel={() => setDeleteTemplate(null)}
          onConfirm={() => {
            onChangeTemplates(templates.filter((item) => item.id !== deleteTemplate.id));
            setDeleteTemplate(null);
            onNotify?.('Đã xóa template');
          }}
        />
      ) : null}

      {confirmSaveConfig ? (
        <ConfirmDialog
          title="Lưu cấu hình nhắc lịch?"
          message="Các thiết lập nhắc lịch tự động sẽ được áp dụng cho các lịch khám sắp tới."
          confirmText="Lưu cấu hình"
          onCancel={() => setConfirmSaveConfig(false)}
          onConfirm={() => {
            setConfirmSaveConfig(false);
            onNotify?.('Đã lưu cấu hình nhắc lịch');
          }}
        />
      ) : null}
    </div>
  );
}

function ManualNotificationTab({ templates, selectedTemplateId, onNotify }: { templates: Template[]; selectedTemplateId: string; onNotify: (message: string) => void }) {
  const [recipientGroup, setRecipientGroup] = useState(recipientGroups[0]);
  const initialTemplate = templates.find((item) => item.id === selectedTemplateId) ?? templates[0];
  const [templateTitle, setTemplateTitle] = useState(initialTemplate?.title ?? '');
  const [content, setContent] = useState(initialTemplate?.content ?? '');
  const [sendTime, setSendTime] = useState('Gửi ngay lập tức');
  const [confirmSend, setConfirmSend] = useState(false);
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: 1, name: 'Nguyễn Văn A', phone: '0912.345.678', time: '09:00', selected: true },
    { id: 2, name: 'Trần Thị B', phone: '0988.111.222', time: '09:30', selected: true },
    { id: 3, name: 'Lê Tuấn C', phone: '0977.333.444', time: '10:00', selected: true },
  ]);

  const selectedTemplate = templates.find((item) => item.title === templateTitle);
  const preview = renderRealisticPreview(content.trim() || 'Nội dung tin nhắn sẽ hiển thị tại đây...');
  const recipientCount = recipients.filter((recipient) => recipient.selected).length;
  const quickVariables = [
    { label: 'Tên bệnh nhân', value: '{ten_bn}' },
    { label: 'Phòng khám', value: '{phong_kham}' },
    { label: 'Giờ hẹn', value: '{gio_hen}' },
    { label: 'Ngày hẹn', value: '{ngay_hen}' },
  ];

  const handleInsertVariable = (variableStr: string) => {
    setContent((current) => `${current}${current.trim() ? ' ' : ''}${variableStr}`);
  };

  const toggleSelect = (id: number) => {
    setRecipients((items) => items.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)));
  };

  const resetForm = () => {
    const template = templates.find((item) => item.id === selectedTemplateId) ?? templates[0];
    setRecipientGroup(recipientGroups[0]);
    setTemplateTitle(template?.title ?? '');
    setContent(template?.content ?? '');
    setSendTime('Gửi ngay lập tức');
  };

  useEffect(() => {
    const template = templates.find((item) => item.id === selectedTemplateId);
    if (!template) {
      return;
    }

    setTemplateTitle(template.title);
    setContent(template.content);
  }, [selectedTemplateId, templates]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setConfirmSend(true);
  };

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="panel-title">Soạn thông báo</h2>
          <p className="panel-subtitle">Gửi SMS/Email theo nhóm bệnh nhân đã chọn.</p>
        </div>
        <div className="space-y-4 p-4">
          <Field label="Chọn nhóm người nhận">
            <SelectMenu value={recipientGroup} options={recipientGroups} onChange={setRecipientGroup} />
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <span>
                Đã chọn: <strong className="text-blue-600">{recipientCount}</strong> bệnh nhân
              </span>
              <button type="button" onClick={() => setIsRecipientModalOpen(true)} className="ml-1 cursor-pointer text-xs font-extrabold text-blue-500 hover:underline">
                (Xem danh sách)
              </button>
            </div>
          </Field>
          <Field label="Dùng template">
            <SelectMenu
              value={templateTitle}
              options={templates.map((item) => item.title)}
              onChange={(value) => {
                setTemplateTitle(value);
                setContent(templates.find((item) => item.title === value)?.content ?? '');
              }}
            />
          </Field>
          <Field label="Nội dung thông báo">
            <textarea className="form-textarea min-h-40" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Nhập nội dung tin nhắn tự do tại đây..." spellCheck={false} />
          </Field>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-extrabold text-slate-700">
              Chèn biến nhanh <span className="font-semibold text-slate-400">({selectedTemplate?.title ?? 'Không có template'})</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {quickVariables.map((variable) => (
                <button
                  key={variable.value}
                  type="button"
                  onClick={() => handleInsertVariable(variable.value)}
                  className="cursor-pointer rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 transition-colors hover:bg-blue-100 hover:text-blue-700"
                >
                  + {variable.label}
                </button>
              ))}
            </div>
          </div>
          <Field label="Thời gian gửi">
            <SelectMenu value={sendTime} options={['Gửi ngay lập tức', 'Đặt lịch gửi sau 30 phút', 'Đặt lịch gửi cuối ngày']} onChange={setSendTime} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-4 py-3">
          <button type="button" onClick={resetForm} className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-gray-50 px-5 text-sm font-extrabold text-slate-600 transition hover:bg-white">
            Làm mới
          </button>
          <button type="submit" className="secondary-action">
            <Send size={16} />
            Gửi thông báo
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="panel-title">Xem trước</h2>
        <p className="panel-subtitle">SMS Preview</p>
        <div className="mx-auto mt-4 w-full max-w-64 rounded-[2rem] bg-slate-900 p-3 shadow-xl">
          <div className="min-h-[360px] rounded-[1.5rem] bg-white p-4">
            <div className="rounded-lg bg-slate-100 p-3">
              <p className="text-xs font-extrabold text-slate-800">FAKEEH CARE</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{preview}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-2 text-xs font-bold text-slate-500">
          <span className="inline-flex items-center gap-2"><Smartphone size={14} className="text-brand" /> SMS</span>
          <span className="inline-flex items-center gap-2"><Mail size={14} className="text-brand" /> Email bản dài</span>
        </div>
      </section>

      {confirmSend ? (
        <ConfirmDialog
          title="Gửi thông báo?"
          message={`Thông báo sẽ được gửi tới nhóm: ${recipientGroup}.`}
          confirmText="Gửi"
          onCancel={() => setConfirmSend(false)}
          onConfirm={() => {
            setConfirmSend(false);
            onNotify(content);
          }}
        />
      ) : null}
      {isRecipientModalOpen ? (
        <RecipientListModal
          recipients={recipients}
          onToggleSelect={toggleSelect}
          onClose={() => setIsRecipientModalOpen(false)}
        />
      ) : null}
    </form>
  );
}

function RecipientListModal({
  recipients,
  onToggleSelect,
  onClose,
}: {
  recipients: Recipient[];
  onToggleSelect: (id: number) => void;
  onClose: () => void;
}) {
  const selectedCount = recipients.filter((recipient) => recipient.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-base font-extrabold text-slate-800">Danh sách người nhận</h2>
          <button type="button" onClick={onClose} className="icon-button h-9 w-9" aria-label="Đóng danh sách người nhận">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto p-4">
          {recipients.map((recipient) => (
            <div key={recipient.id} className="flex items-center justify-between gap-4 border-b border-gray-100 py-3 last:border-b-0">
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={recipient.selected}
                  onChange={() => onToggleSelect(recipient.id)}
                  className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-extrabold text-slate-800">{recipient.name}</span>
                  <span className="block text-sm font-semibold text-gray-500">{recipient.phone}</span>
                </span>
              </label>
              <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-600">{recipient.time}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-b-xl border-t border-gray-100 bg-gray-50 p-4">
          <span className="text-sm font-semibold text-slate-600">
            Đã chọn: <strong className="text-blue-600">{selectedCount}</strong> / {recipients.length}
          </span>
          <button type="button" onClick={onClose} className="rounded-lg bg-brand px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[#1f7fb9]">
            Xong
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryTab({ history, onNotify }: { history: HistoryItem[]; onNotify?: (message: string) => void }) {
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
  const [channelFilter, setChannelFilter] = useState('Tất cả kênh');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [resendItem, setResendItem] = useState<HistoryItem | null>(null);
  const pageSize = 2;

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchStatus = statusFilter === 'Tất cả trạng thái' || statusLabels[item.status] === statusFilter;
      const matchChannel = channelFilter === 'Tất cả kênh' || item.channel === channelFilter;
      const keyword = query.trim().toLowerCase();
      const matchQuery = !keyword || [item.recipient, item.phone, item.content].some((value) => value.toLowerCase().includes(keyword));
      return matchStatus && matchChannel && matchQuery;
    });
  }, [channelFilter, history, query, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const pagedHistory = filteredHistory.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="grid gap-4 border-b border-slate-100 p-5 md:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
          <p className="text-xs font-extrabold uppercase text-slate-400">Đã gửi hôm nay</p>
          <p className="mt-2 text-4xl font-extrabold text-gray-600">150</p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <p className="text-xs font-extrabold uppercase text-green-600">Thành công</p>
          <p className="mt-2 text-4xl font-extrabold text-green-600">145</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-xs font-extrabold uppercase text-red-500">Thất bại</p>
          <p className="mt-2 text-4xl font-extrabold text-red-500">5</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
        <label className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            className="form-input pl-10"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm người nhận, SĐT, nội dung..."
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
          <SelectMenu
            value={statusFilter}
            options={['Tất cả trạng thái', 'Thành công', 'Thất bại', 'Đang chờ']}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          />
          <SelectMenu
            value={channelFilter}
            options={['Tất cả kênh', 'SMS', 'Email', 'SMS & Email']}
            onChange={(value) => {
              setChannelFilter(value);
              setPage(1);
            }}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs font-extrabold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Người nhận</th>
              <th className="px-4 py-3">Nội dung</th>
              <th className="px-4 py-3">Kênh</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagedHistory.map((item) => (
              <tr key={item.id} className="bg-white transition hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-500">{item.time}</td>
                <td className="px-4 py-3">
                  <p className="font-extrabold text-slate-800">{item.recipient}</p>
                  <p className="text-xs font-semibold text-slate-400">{item.phone}</p>
                </td>
                <td className="max-w-md px-4 py-3 font-medium text-slate-500">{item.content}</td>
                <td className="px-4 py-3 font-bold text-slate-600">{item.channel}</td>
                <td className="px-4 py-3">
                  <HistoryStatusBadge status={item.status} />
                  {item.status === 'failed' ? <p className="mt-1 text-xs font-semibold text-red-500">{item.errorReason ?? 'Hết hạn mức SMS'}</p> : null}
                </td>
                <td className="px-4 py-3 text-right">
                  {item.status === 'failed' ? (
                    <button type="button" onClick={() => setResendItem(item)} className="filter-button">
                      Gửi lại
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-300">--</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 p-4">
        <p className="text-sm font-semibold text-slate-500">
          Hiển thị {pagedHistory.length} trên tổng số {filteredHistory.length} thông báo
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="flex h-8 w-8 items-center justify-center rounded text-slate-400 transition hover:bg-sky-50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Trang trước"
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-extrabold transition ${
                page === pageNumber ? 'bg-brand text-white shadow-sm' : 'text-brand hover:bg-sky-50'
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="flex h-8 w-8 items-center justify-center rounded text-slate-400 transition hover:bg-sky-50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Trang sau"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      {resendItem ? (
        <ConfirmDialog
          title="Gửi lại thông báo?"
          message={`Gửi lại thông báo thất bại cho ${resendItem.recipient}.`}
          confirmText="Gửi lại"
          onCancel={() => setResendItem(null)}
          onConfirm={() => {
            setResendItem(null);
            onNotify?.('Đã gửi lại thông báo');
          }}
        />
      ) : null}
    </section>
  );
}

function TemplateForm({ template, onCancel, onSave }: { template: Template | null; onCancel: () => void; onSave: (template: Template) => void }) {
  const [title, setTitle] = useState(template?.title ?? '');
  const [typeLabel, setTypeLabel] = useState(template ? templateTypes[template.type] : templateTypes.appointment);
  const [content, setContent] = useState(template?.content ?? '');
  const [confirmSave, setConfirmSave] = useState(false);
  const type = Object.entries(templateTypes).find(([, label]) => label === typeLabel)?.[0] as TemplateType;
  const payload: Template = {
    id: template?.id ?? `TPL-${String(Date.now()).slice(-3)}`,
    title: title.trim() || 'Template mới',
    type,
    content: content.trim() || 'Nội dung template...',
    updatedAt: '10/05/2026',
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setConfirmSave(true);
        }}
        className="w-full max-w-2xl rounded-xl bg-white shadow-xl"
      >
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="panel-title">{template ? 'Chỉnh sửa template' : 'Thêm template mới'}</h2>
          <p className="panel-subtitle">Có thể dùng biến động: {'{ten_bn}'}, {'{gio_hen}'}, {'{ngay_hen}'}, {'{phong_kham}'}.</p>
        </div>
        <div className="grid gap-5 p-4 md:grid-cols-2">
          <Field label="Tên template">
            <input className="form-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nhập tên template..." />
          </Field>
          <Field label="Loại template">
            <SelectMenu value={typeLabel} options={Object.values(templateTypes)} onChange={setTypeLabel} />
          </Field>
          <Field label="Nội dung" className="md:col-span-2">
            <textarea className="form-textarea min-h-40" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Nhập nội dung template..." />
          </Field>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-4 py-3">
          <button type="button" onClick={onCancel} className="ghost-action">Hủy</button>
          <button type="submit" className="secondary-action">Lưu template</button>
        </div>
      </form>
      {confirmSave ? (
        <ConfirmDialog
          title="Lưu template?"
          message={`Template "${payload.title}" sẽ được lưu vào danh sách mẫu thông báo.`}
          confirmText="Lưu"
          onCancel={() => setConfirmSave(false)}
          onConfirm={() => {
            setConfirmSave(false);
            onSave(payload);
          }}
        />
      ) : null}
    </div>
  );
}

function TemplateContent({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\{[^}]+\})/g).map((part, index) =>
        /^\{[^}]+\}$/.test(part) ? (
          <span key={`${part}-${index}`} className="rounded bg-blue-50 px-1 font-mono text-sm font-bold text-blue-600">
            {part}
          </span>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

function renderRealisticPreview(text: string) {
  return text
    .replace(/\{ten_bn\}/g, 'Nguyễn Văn A')
    .replace(/\{phong_kham\}/g, 'Phòng khám Nội 101')
    .replace(/\{gio_hen\}/g, '09:00')
    .replace(/\{ngay_hen\}/g, '15/06/2026');
}

function SelectMenu({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button type="button" className="form-input flex items-center justify-between text-left" onClick={() => setOpen((current) => !current)}>
        <span className="truncate">{value}</span>
        <ChevronDown size={16} />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`block w-full px-4 py-2 text-left text-sm font-semibold transition hover:bg-sky-50 hover:text-brand ${option === value ? 'bg-sky-50 text-brand' : 'text-slate-600'}`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CheckOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${checked ? 'border-brand bg-sky-50 text-brand' : 'border-slate-200 bg-white text-slate-500 hover:border-brand/40'}`}>
      <span className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white'}`}>
        {checked ? <CheckCircle2 size={14} /> : null}
      </span>
      <span className="text-sm font-extrabold">{label}</span>
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-brand' : 'bg-slate-200'}`} aria-pressed={checked}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

function HistoryStatusBadge({ status }: { status: HistoryStatus }) {
  const tone: Record<HistoryStatus, string> = {
    success: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-rose-100 text-rose-600',
    pending: 'bg-amber-100 text-amber-700',
  };
  const Icon = status === 'success' ? CheckCircle2 : status === 'failed' ? XCircle : Clock3;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${tone[status]}`}>
      <Icon size={13} />
      {statusLabels[status]}
    </span>
  );
}

const channelLabels: Record<ChannelMode, string> = {
  'sms-email': 'Cả SMS và Email',
  sms: 'Chỉ SMS',
  email: 'Chỉ Email',
};

const statusLabels: Record<HistoryStatus, string> = {
  success: 'Thành công',
  failed: 'Thất bại',
  pending: 'Đang chờ',
};
