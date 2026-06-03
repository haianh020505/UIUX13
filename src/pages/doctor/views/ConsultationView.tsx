import { useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { consultationRequests, getPatient } from '../data';
import { SearchInput } from '../components/shared';

export default function ConsultationView({
  selectedPatientCode,
  resolvedConsultationCodes,
  onResolveConsultation,
  onNotify,
}: {
  selectedPatientCode?: string;
  resolvedConsultationCodes: string[];
  onResolveConsultation: (patientCode: string, action: 'appointment' | 'complete') => void;
  onNotify: (message: string) => void;
}) {
  const [activeCode, setActiveCode] = useState<string | null>(selectedPatientCode ?? null);
  const [messageDraft, setMessageDraft] = useState('');
  const [chatMessagesByPatient, setChatMessagesByPatient] = useState<Record<string, Array<{ id: string; align: 'left' | 'right'; text: string; time: string }>>>({});

  useEffect(() => {
    if (selectedPatientCode) {
      setActiveCode(selectedPatientCode);
    } else {
      setActiveCode(null);
    }
  }, [selectedPatientCode]);

  const activeRequest = consultationRequests.find((item) => item.patientCode === activeCode) ?? null;
  const activePatient = activeRequest ? getPatient(activeRequest.patientCode) : null;
  const unresolvedCount = consultationRequests.filter((item) => !resolvedConsultationCodes.includes(item.patientCode)).length;
  const activeMessages = activeRequest ? getChatMessages(activeRequest, chatMessagesByPatient[activeRequest.patientCode]) : [];

  const handleResolveChat = (action: 'appointment' | 'complete') => {
    if (!activeRequest) return;
    onResolveConsultation(activeRequest.patientCode, action);
    setActiveCode(null);
    setMessageDraft('');
  };

  const handleSendMessage = () => {
    if (!activeRequest || !messageDraft.trim()) return;

    const message = {
      id: `${activeRequest.patientCode}-${Date.now()}`,
      align: 'right' as const,
      text: messageDraft.trim(),
      time: new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()),
    };

    setChatMessagesByPatient((current) => ({
      ...current,
      [activeRequest.patientCode]: [...getChatMessages(activeRequest, current[activeRequest.patientCode]), message],
    }));
    setMessageDraft('');
    onNotify('Đã gửi tin nhắn tư vấn');
  };

  return (
    <div className="grid h-[calc(100dvh-6.5rem)] min-h-[520px] gap-4 xl:grid-cols-[0.8fr_1.35fr_0.85fr]">
      <aside className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="panel-title">Ca chờ tư vấn ({unresolvedCount})</h2>
        <div className="mt-3">
          <SearchInput placeholder="Tìm kiếm..." />
        </div>
        <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {consultationRequests.map((item) => {
            const patient = getPatient(item.patientCode);
            const active = item.patientCode === activeCode;
            const resolved = resolvedConsultationCodes.includes(item.patientCode);

            return (
              <button
                key={`${item.patientCode}-${item.title}`}
                type="button"
                onClick={() => setActiveCode(item.patientCode)}
                className={`w-full cursor-pointer rounded-md border px-3 py-2.5 text-left transition hover:border-brand active:scale-[0.99] ${
                  active
                    ? 'border-sky-100 bg-sky-50'
                    : resolved
                      ? 'border-transparent bg-slate-50/60'
                      : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {!resolved ? <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" /> : null}
                    <span className={`truncate text-slate-800 ${resolved ? 'font-medium' : 'font-bold'}`}>{patient.name}</span>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{item.timeLabel}</span>
                </div>
                <span className={`mt-1 inline-flex rounded px-2 py-0.5 text-[11px] font-bold ${item.urgency === 'Khẩn cấp' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                  {item.urgency}
                </span>
                <p className={`mt-1 truncate text-[11px] ${resolved ? 'text-slate-400' : 'text-slate-500'}`}>{item.summary}</p>
              </button>
            );
          })}
        </div>
      </aside>

      {activeRequest && activePatient ? (
        <section className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center border-b border-slate-200 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-8 w-8 shrink-0 rounded-full bg-slate-200" />
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-800">{activePatient.name}</p>
                <p className="text-xs font-medium text-emerald-600">Đang trực tuyến</p>
              </div>
            </div>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            <p className="mx-auto w-fit rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">Hệ thống: Ca tư vấn được chuyển giao từ AI Triage.</p>
            {activeMessages.map((message) => (
              <ChatBubble key={message.id} align={message.align} text={message.text} time={message.time} />
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-slate-200 p-3">
            <input
              className="form-input flex-1 rounded-full bg-slate-50"
              placeholder="Nhập tin nhắn tư vấn..."
              value={messageDraft}
              onChange={(event) => setMessageDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!messageDraft.trim()}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-blue-600 p-2 text-white transition hover:bg-blue-700 active:scale-95"
              aria-label="Gửi tin nhắn"
            >
              <Send size={18} />
            </button>
          </div>
        </section>
      ) : (
        <EmptyChatState />
      )}

      {activeRequest && activePatient ? (
        <aside className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className={`border-b px-4 py-3 ${activeRequest.urgency === 'Khẩn cấp' ? 'border-rose-100 bg-rose-50' : 'border-slate-100 bg-slate-50'}`}>
            <h3 className={`font-bold ${activeRequest.urgency === 'Khẩn cấp' ? 'text-rose-600' : 'text-slate-700'}`}>Tóm tắt từ Chatbot AI</h3>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            <InfoBlock title="Vấn đề chính:" lines={[activeRequest.title, activeRequest.summary]} />
            <InfoBlock title="Đánh giá nguy cơ (AI):" badge={activeRequest.urgency === 'Khẩn cấp' ? 'Cao (Khẩn cấp)' : 'Bình thường'} />
            <InfoBlock title="Hồ sơ liên quan:" lines={[`${activePatient.code} - ${activePatient.age} tuổi`, activePatient.diagnosis]} />
            <label className="block border-t border-slate-100 pt-4">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Ghi kết luận tư vấn</span>
              <textarea className="form-textarea" placeholder="Ghi chú lâm sàng ngắn gọn..." />
            </label>
            <section className="border-t border-slate-100 pt-4">
              <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-400">Hướng giải quyết</h4>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleResolveChat('appointment')}
                  className="w-full cursor-pointer rounded-md bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  Yêu cầu đặt lịch khám
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveChat('complete')}
                  className="w-full cursor-pointer rounded-md border border-gray-300 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
                >
                  Hoàn tất tư vấn
                </button>
              </div>
            </section>
          </div>
        </aside>
      ) : (
        <aside className="flex items-center justify-center rounded-lg border border-slate-200 bg-white/60 shadow-sm">
          <MessageCircle className="h-16 w-16 text-slate-200" />
        </aside>
      )}
    </div>
  );
}

function EmptyChatState() {
  return (
    <section className="flex h-full min-h-[520px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-gray-50/50 text-center shadow-sm">
      <MessageCircle className="mb-4 h-20 w-20 text-gray-300" />
      <p className="font-medium text-gray-500">Chưa chọn ca tư vấn nào</p>
      <p className="mt-2 text-sm text-gray-400">Hãy chọn một bệnh nhân từ danh sách bên trái để bắt đầu tư vấn.</p>
    </section>
  );
}

function getChatMessages(
  request: { patientCode: string; summary: string },
  messages?: Array<{ id: string; align: 'left' | 'right'; text: string; time: string }>,
) {
  return messages ?? [
    { id: `${request.patientCode}-patient-initial`, align: 'left' as const, text: request.summary, time: '14:05' },
    {
      id: `${request.patientCode}-doctor-initial`,
      align: 'right' as const,
      text: 'Tôi đã nhận thông tin. Bạn giữ máy để tôi kiểm tra mức độ ưu tiên và hướng dẫn bước tiếp theo.',
      time: '14:07',
    },
  ];
}

function ChatBubble({ align, text, time }: { align: 'left' | 'right'; text: string; time: string }) {
  const right = align === 'right';

  return (
    <div className={`flex ${right ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[68%] rounded-lg px-4 py-3 text-sm ${right ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}>
        <p>{text}</p>
        <p className={`mt-2 text-right text-xs ${right ? 'text-white/70' : 'text-slate-400'}`}>{time}</p>
      </div>
    </div>
  );
}

function InfoBlock({ title, lines, badge }: { title: string; lines?: string[]; badge?: string }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-bold text-slate-700">{title}</h4>
      {badge ? <span className="rounded bg-rose-50 px-2 py-1 text-xs font-bold text-rose-600">{badge}</span> : null}
      {lines ? (
        <div className="space-y-1 text-sm text-slate-600">
          {lines.map((line) => (
            <p key={line}>- {line}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
