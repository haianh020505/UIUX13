import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Phone,
  Plus,
  Send,
  ShieldAlert,
  Siren,
  Stethoscope,
  User,
} from 'lucide-react';
import ConfirmDialog from '../manager/components/ConfirmDialog';
import type { BookingContext } from './types';

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */

type UrgencyLevel = 'red' | 'yellow' | 'green' | 'pending';
type MessageSender = 'ai' | 'patient' | 'doctor' | 'system';
type FlowId = 'A' | 'B' | 'C' | null;
type HandoffStage = null | 'connecting' | 'active' | 'ended';
type UrgencyAction = 'book' | 'handoff' | 'call115';

interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  time: string;
  urgency?: {
    level: UrgencyLevel;
    summary: string;
    recommendation: string;
    specialty?: string;
  };
  /** Chips to show after this message */
  chips?: ChipConfig;
  /** Action buttons for urgency card */
  actions?: ActionConfig[];
  /** Show "Hoàn thành tư vấn" button in doctor bubble */
  showComplete?: boolean;
  /** Session end marker text */
  sessionEndText?: string;
}

interface ChipConfig {
  options: string[];
  multiSelect?: boolean;
  disabled?: boolean;
  selected?: string[];
}

interface ActionConfig {
  label: string;
  style: 'primary' | 'danger' | 'outline';
  action: UrgencyAction;
}

interface ConsultSession {
  id: string;
  title: string;
  createdAt: string;
  preview: string;
  urgency: UrgencyLevel;
  status: 'ai-triage' | 'doctor-chat' | 'completed';
  doctorName?: string;
  specialty?: string;
  messages: ChatMessage[];
  /** Scripted flow state */
  flow: FlowId;
  step: number;
  handoff: HandoffStage;
  doctorReplyIndex: number;
}

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */

const URGENCY_MAP: Record<UrgencyLevel, { label: string; cls: string }> = {
  red: { label: 'Khẩn cấp', cls: 'urgency-badge--red' },
  yellow: { label: 'Cần theo dõi', cls: 'urgency-badge--yellow' },
  green: { label: 'Bình thường', cls: 'urgency-badge--green' },
  pending: { label: 'Đang đánh giá', cls: 'urgency-badge--pending' },
};

const FOLLOW_UP_NONE = 'Không có thêm';

function getUrgencyActions(level: Exclude<UrgencyLevel, 'pending'>): ActionConfig[] {
  if (level === 'red') {
    return [
      { label: 'Gọi cấp cứu 115', style: 'outline', action: 'call115' },
      { label: 'Kết nối Bác sĩ khẩn cấp', style: 'danger', action: 'handoff' },
    ];
  }

  return [
    { label: 'Đặt lịch hẹn', style: 'outline', action: 'book' },
    { label: level === 'yellow' ? 'Kết nối Bác sĩ ngay' : 'Kết nối Bác sĩ', style: 'primary', action: 'handoff' },
  ];
}

function getNextMultiSelection(current: string[], option: string) {
  if (option === FOLLOW_UP_NONE) {
    return current.includes(FOLLOW_UP_NONE) ? [] : [FOLLOW_UP_NONE];
  }

  const withoutNone = current.filter((item) => item !== FOLLOW_UP_NONE);
  return withoutNone.includes(option)
    ? withoutNone.filter((item) => item !== option)
    : [...withoutNone, option];
}

function getDoctorNameForSpecialty(specialty?: string) {
  if (specialty === 'Cấp cứu') return 'BS. Lê Minh Tuấn';
  if (specialty === 'Nội khoa') return 'BS. Nguyễn Văn A';
  return 'BS. Nguyễn Văn A';
}

function getBookingSpecialtyName(specialty?: string) {
  if (specialty === 'Nội khoa') return 'Nội tổng quát';
  if (specialty === 'Cấp cứu') return undefined;
  return specialty;
}

function now() {
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date());
}

let msgCounter = 0;
function uid() { return `m-${Date.now()}-${++msgCounter}`; }

const INITIAL_BOT_MSG = 'Xin chào! Tôi là trợ lý y tế AI của Fakeeh Care Group. 🏥\nHôm nay bạn đang gặp vấn đề gì? Hãy chọn triệu chứng chính:';

const INITIAL_CHIPS: string[] = [
  '🤒 Sốt',
  '😮‍💨 Khó thở',
  '🤕 Đau đầu',
  '🤧 Ho / Đau họng',
  '🤢 Buồn nôn',
  '✏️ Khác...',
];

const DOCTOR_REPLIES = [
  'Tôi hiểu rồi. Triệu chứng này bạn đã dùng thuốc gì chưa?',
  'Cảm ơn bạn đã chia sẻ. Dựa trên mô tả, tôi khuyên bạn nên đặt lịch khám trực tiếp để được kiểm tra kỹ hơn.',
  'Bạn có câu hỏi nào khác không? Tôi sẵn sàng hỗ trợ thêm.',
];

/* ═══════════════════════════════════════════════════════
   PRE-POPULATED SESSION HISTORY — 3 sessions
   ═══════════════════════════════════════════════════════ */

const HISTORY_SESSIONS: ConsultSession[] = [
  /* ── Session 1: Ho, đau họng — Xanh ── */
  {
    id: 'session-001',
    title: 'Ho, đau họng',
    createdAt: '20/05/2026',
    preview: 'Phiên tư vấn đã kết thúc',
    urgency: 'green',
    status: 'completed',
    doctorName: 'BS. Nguyễn Văn A',
    specialty: 'Tai Mũi Họng',
    flow: 'A',
    step: 4,
    handoff: 'ended',
    doctorReplyIndex: 3,
    messages: [
      { id: 'h1-1', sender: 'ai', text: 'Xin chào! Tôi là trợ lý y tế AI của Fakeeh Care Group. Hôm nay bạn đang gặp vấn đề gì?', time: '14:00',
        chips: { options: ['🤒 Sốt', '😮\u200d💨 Khó thở', '🤕 Đau đầu', '🤧 Ho / Đau họng', '🤢 Buồn nôn', '✏️ Khác...'], disabled: true, selected: ['🤧 Ho / Đau họng'] } },
      { id: 'h1-2', sender: 'patient', text: 'Ho / Đau họng', time: '14:01' },
      { id: 'h1-3', sender: 'ai', text: 'Bạn bị ho và đau họng từ khi nào?', time: '14:01',
        chips: { options: ['Hôm nay', '1–2 ngày', '3–5 ngày', 'Hơn 1 tuần'], disabled: true, selected: ['1–2 ngày'] } },
      { id: 'h1-4', sender: 'patient', text: '1–2 ngày', time: '14:02' },
      { id: 'h1-5', sender: 'ai', text: 'Bạn có kèm theo triệu chứng nào khác không?', time: '14:02',
        chips: { options: ['Sổ mũi', 'Sốt nhẹ', 'Mệt mỏi', 'Không có thêm'], multiSelect: true, disabled: true, selected: ['Sổ mũi', 'Mệt mỏi'] } },
      { id: 'h1-6', sender: 'patient', text: 'Tôi bị: Sổ mũi, Mệt mỏi', time: '14:03' },
      { id: 'h1-7', sender: 'ai', text: 'Hiện bạn có đang dùng thuốc gì không?', time: '14:03',
        chips: { options: ['Không', 'Có dùng thuốc OTC', 'Có đơn thuốc bác sĩ'], disabled: true, selected: ['Không'] } },
      { id: 'h1-8', sender: 'patient', text: 'Không', time: '14:04' },
      { id: 'h1-9', sender: 'system', text: '', time: '14:05',
        urgency: { level: 'green', summary: 'Mức độ: BÌNH THƯỜNG 🟢', recommendation: 'Các triệu chứng của bạn phù hợp với viêm họng thông thường. Không có dấu hiệu nguy hiểm. Bạn có thể theo dõi tại nhà hoặc đặt lịch khám trong 1–2 ngày tới.', specialty: 'Tai Mũi Họng' } },
      { id: 'h1-10', sender: 'patient', text: 'Kết nối Bác sĩ', time: '14:06' },
      { id: 'h1-11', sender: 'system', text: 'BS. Nguyễn Văn A đã tham gia cuộc tư vấn', time: '14:07' },
      { id: 'h1-12', sender: 'doctor', text: 'Xin chào bạn, tôi là BS. Nguyễn Văn A. Tôi đã xem qua thông tin triệu chứng bạn mô tả. Bạn có thể cho tôi biết thêm về tình trạng ho không?', time: '14:08' },
      { id: 'h1-13', sender: 'patient', text: 'Ho khan, không có đờm, chủ yếu về đêm', time: '14:10' },
      { id: 'h1-14', sender: 'doctor', text: 'Tôi hiểu rồi. Triệu chứng này bạn đã dùng thuốc gì chưa?', time: '14:12' },
      { id: 'h1-15', sender: 'patient', text: 'Chưa dùng gì ạ', time: '14:14' },
      { id: 'h1-16', sender: 'doctor', text: 'Cảm ơn bạn đã chia sẻ. Dựa trên mô tả, tôi khuyên bạn nên uống nhiều nước ấm, nghỉ ngơi và có thể dùng thuốc ho không kê đơn nếu cần. Nếu triệu chứng kéo dài hơn 5 ngày, hãy đặt lịch khám trực tiếp.', time: '14:20' },
      { id: 'h1-17', sender: 'system', text: 'BS. Nguyễn Văn A đã đánh dấu hoàn thành tư vấn', time: '14:32', sessionEndText: 'Cuộc tư vấn đã kết thúc lúc 14:32 — 20/05/2026' },
    ],
  },

  /* ── Session 2: Sốt 38.5°C, đau cơ — Vàng ── */
  {
    id: 'session-002',
    title: 'Sốt 38.5°C, đau cơ',
    createdAt: '08/05/2026',
    preview: 'Phiên tư vấn đã kết thúc',
    urgency: 'yellow',
    status: 'completed',
    doctorName: 'BS. Trần Thị Bình',
    specialty: 'Nội khoa',
    flow: 'B',
    step: 4,
    handoff: 'ended',
    doctorReplyIndex: 3,
    messages: [
      { id: 'h2-1', sender: 'ai', text: 'Xin chào! Tôi là trợ lý y tế AI của Fakeeh Care Group. Hôm nay bạn đang gặp vấn đề gì?', time: '08:50',
        chips: { options: ['🤒 Sốt', '😮\u200d💨 Khó thở', '🤕 Đau đầu', '🤧 Ho / Đau họng', '🤢 Buồn nôn', '✏️ Khác...'], disabled: true, selected: ['🤒 Sốt'] } },
      { id: 'h2-2', sender: 'patient', text: 'Sốt', time: '08:51' },
      { id: 'h2-3', sender: 'ai', text: 'Bạn đang bị sốt. Nhiệt độ cơ thể hiện tại của bạn là bao nhiêu?', time: '08:52',
        chips: { options: ['Dưới 38°C', '38°C – 39°C', 'Trên 39°C', 'Không đo được'], disabled: true, selected: ['38°C – 39°C'] } },
      { id: 'h2-4', sender: 'patient', text: '38°C – 39°C', time: '08:52' },
      { id: 'h2-5', sender: 'ai', text: 'Bạn đã sốt được bao lâu rồi?', time: '08:53',
        chips: { options: ['Mới bắt đầu hôm nay', '1–2 ngày', '3–4 ngày', 'Hơn 5 ngày'], disabled: true, selected: ['3–4 ngày'] } },
      { id: 'h2-6', sender: 'patient', text: '3–4 ngày', time: '08:53' },
      { id: 'h2-7', sender: 'ai', text: 'Ngoài sốt, bạn có gặp triệu chứng nào sau đây không?', time: '08:54',
        chips: { options: ['Đau đầu', 'Đau cơ', 'Phát ban', 'Buồn nôn', 'Không có thêm'], multiSelect: true, disabled: true, selected: ['Đau đầu', 'Đau cơ'] } },
      { id: 'h2-8', sender: 'patient', text: 'Tôi bị: Đau đầu, Đau cơ', time: '08:55' },
      { id: 'h2-9', sender: 'system', text: '', time: '08:56',
        urgency: { level: 'yellow', summary: 'Mức độ: CẦN THEO DÕI 🟡', recommendation: 'Triệu chứng sốt kéo dài cần được đánh giá bởi bác sĩ. Khuyến nghị kết nối tư vấn trực tiếp để được hỗ trợ kịp thời.', specialty: 'Nội khoa' } },
      { id: 'h2-10', sender: 'patient', text: 'Kết nối Bác sĩ ngay', time: '08:57' },
      { id: 'h2-11', sender: 'system', text: 'BS. Trần Thị Bình đã tham gia cuộc tư vấn', time: '08:58' },
      { id: 'h2-12', sender: 'doctor', text: 'Xin chào bạn, tôi là BS. Trần Thị Bình. Tôi đã xem qua thông tin triệu chứng. Sốt 3–4 ngày kèm đau cơ cần được theo dõi kỹ. Bạn có bị phát ban hay nổi mẩn đỏ không?', time: '09:00' },
      { id: 'h2-13', sender: 'patient', text: 'Không có phát ban ạ, nhưng người rất mệt', time: '09:02' },
      { id: 'h2-14', sender: 'doctor', text: 'Tôi hiểu rồi. Bạn đã dùng thuốc hạ sốt gì chưa?', time: '09:04' },
      { id: 'h2-15', sender: 'patient', text: 'Có dùng Paracetamol 500mg nhưng không thấy đỡ nhiều', time: '09:06' },
      { id: 'h2-16', sender: 'doctor', text: 'Cảm ơn bạn đã chia sẻ. Dựa trên mô tả, tôi khuyến nghị bạn đến khám trực tiếp để làm xét nghiệm máu cơ bản, loại trừ sốt xuất huyết. Tôi sẽ đặt lịch ưu tiên cho bạn vào ngày mai.', time: '09:10' },
      { id: 'h2-17', sender: 'system', text: 'BS. Trần Thị Bình đã đánh dấu hoàn thành tư vấn', time: '09:15', sessionEndText: 'Cuộc tư vấn đã kết thúc lúc 09:15 — 08/05/2026' },
    ],
  },

  /* ── Session 3: Khó thở, tức ngực — Đỏ ── */
  {
    id: 'session-003',
    title: 'Khó thở, tức ngực',
    createdAt: '15/04/2026',
    preview: 'Phiên tư vấn đã kết thúc',
    urgency: 'red',
    status: 'completed',
    doctorName: 'BS. Lê Minh Tuấn',
    specialty: 'Cấp cứu',
    flow: 'C',
    step: 3,
    handoff: 'ended',
    doctorReplyIndex: 3,
    messages: [
      { id: 'h3-1', sender: 'ai', text: 'Xin chào! Tôi là trợ lý y tế AI của Fakeeh Care Group. Hôm nay bạn đang gặp vấn đề gì?', time: '22:30',
        chips: { options: ['🤒 Sốt', '😮\u200d💨 Khó thở', '🤕 Đau đầu', '🤧 Ho / Đau họng', '🤢 Buồn nôn', '✏️ Khác...'], disabled: true, selected: ['😮\u200d💨 Khó thở'] } },
      { id: 'h3-2', sender: 'patient', text: 'Khó thở', time: '22:30' },
      { id: 'h3-3', sender: 'ai', text: '⚠️ Khó thở là triệu chứng cần được đánh giá ngay.\nMức độ khó thở của bạn như thế nào?', time: '22:31',
        chips: { options: ['Hơi khó thở khi vận động', 'Khó thở cả khi nghỉ', 'Rất khó thở, tức ngực'], disabled: true, selected: ['Khó thở cả khi nghỉ'] } },
      { id: 'h3-4', sender: 'patient', text: 'Khó thở cả khi nghỉ', time: '22:32' },
      { id: 'h3-5', sender: 'ai', text: 'Bạn có kèm theo triệu chứng nào sau đây không?', time: '22:32',
        chips: { options: ['Đau tức ngực', 'Môi / đầu ngón tay tím', 'Chóng mặt', FOLLOW_UP_NONE], multiSelect: true, disabled: true, selected: ['Đau tức ngực', 'Chóng mặt'] } },
      { id: 'h3-6', sender: 'patient', text: 'Tôi bị: Đau tức ngực, Chóng mặt', time: '22:33' },
      { id: 'h3-7', sender: 'system', text: '', time: '22:34',
        urgency: { level: 'red', summary: 'Mức độ: KHẨN CẤP 🔴', recommendation: 'Triệu chứng của bạn có thể nghiêm trọng và cần được xử lý ngay lập tức. Vui lòng kết nối với Bác sĩ ngay hoặc đến cơ sở y tế gần nhất.', specialty: 'Cấp cứu' } },
      { id: 'h3-8', sender: 'patient', text: 'Kết nối Bác sĩ khẩn cấp', time: '22:34' },
      { id: 'h3-9', sender: 'system', text: 'BS. Lê Minh Tuấn đã tham gia cuộc tư vấn', time: '22:35' },
      { id: 'h3-10', sender: 'doctor', text: 'Xin chào bạn, tôi là BS. Lê Minh Tuấn. Đây là tình huống cần xử lý nhanh. Hiện tại bạn đang ngồi hay nằm? Cơn khó thở bắt đầu từ khi nào?', time: '22:36' },
      { id: 'h3-11', sender: 'patient', text: 'Tôi đang ngồi, khó thở bắt đầu khoảng 30 phút trước', time: '22:37' },
      { id: 'h3-12', sender: 'doctor', text: 'Tôi hiểu rồi. Bạn có tiền sử bệnh tim mạch hoặc hen suyễn không?', time: '22:38' },
      { id: 'h3-13', sender: 'patient', text: 'Không có tiền sử bệnh gì ạ', time: '22:39' },
      { id: 'h3-14', sender: 'doctor', text: 'Cảm ơn bạn. Tôi đã ghi nhận và đang liên hệ với đội cấp cứu. Bạn hãy ngồi thẳng, thở chậm và đều. Không di chuyển nhiều. Xe cấp cứu sẽ đến trong 10–15 phút. Tôi sẽ theo dõi cùng bạn.', time: '22:42' },
      { id: 'h3-15', sender: 'system', text: 'BS. Lê Minh Tuấn đã đánh dấu hoàn thành tư vấn', time: '22:47', sessionEndText: 'Cuộc tư vấn đã kết thúc lúc 22:47 — 15/04/2026' },
    ],
  },
];

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function PatientConsultation({
  onNavigateToBooking,
}: {
  onNavigateToBooking?: (ctx: BookingContext) => void;
}) {
  const [sessions, setSessions] = useState<ConsultSession[]>(HISTORY_SESSIONS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find((s) => s.id === activeId) ?? null;
  const isCompleted = activeSession?.status === 'completed';

  /* ── Auto-scroll ── */
  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  useEffect(scrollToBottom, [activeId, isTyping, scrollToBottom]);

  /* ── Toast auto-dismiss ── */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Update session helper ── */
  const updateSession = useCallback((id: string, updater: (s: ConsultSession) => ConsultSession) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
  }, []);

  /* ── Add message with typing delay ── */
  const addBotMessage = useCallback(
    (sessionId: string, msg: Omit<ChatMessage, 'id' | 'time'>, delay = 1200) => {
      setIsTyping(true);
      scrollToBottom();
      setTimeout(() => {
        setIsTyping(false);
        const fullMsg: ChatMessage = { ...msg, id: uid(), time: now() };
        updateSession(sessionId, (s) => ({
          ...s,
          messages: [...s.messages, fullMsg],
          preview: msg.text.slice(0, 60) || s.preview,
        }));
        scrollToBottom();
      }, delay);
    },
    [updateSession, scrollToBottom],
  );

  /* ── Create new session ── */
  const createSession = useCallback(() => {
    const id = `session-${Date.now()}`;
    const session: ConsultSession = {
      id,
      title: 'Phiên tư vấn mới',
      createdAt: now(),
      preview: 'Bắt đầu tư vấn...',
      urgency: 'pending',
      status: 'ai-triage',
      messages: [],
      flow: null,
      step: 0,
      handoff: null,
      doctorReplyIndex: 0,
    };
    setSessions((prev) => [session, ...prev]);
    setActiveId(id);
    setMultiSelected([]);

    // Initial bot message
    const botMsg: ChatMessage = {
      id: uid(),
      sender: 'ai',
      text: INITIAL_BOT_MSG,
      time: now(),
      chips: { options: INITIAL_CHIPS },
    };

    setTimeout(() => {
      setIsTyping(true);
      scrollToBottom();
      setTimeout(() => {
        setIsTyping(false);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, messages: [botMsg], preview: 'Hãy chọn triệu chứng chính...' }
              : s,
          ),
        );
        scrollToBottom();
      }, 1200);
    }, 100);
  }, [scrollToBottom]);

  /* ── Handle chip selection ── */
  const handleChipSelect = useCallback(
    (chip: string, chipConfig: ChipConfig) => {
      if (!activeSession) return;
      const sid = activeSession.id;

      // Disable chips after selection
      updateSession(sid, (s) => {
        const msgs = s.messages.map((m) => {
          if (m.chips && !m.chips.disabled) {
            return { ...m, chips: { ...m.chips, disabled: true, selected: chipConfig.multiSelect ? undefined : [chip] } };
          }
          return m;
        });
        return { ...s, messages: msgs };
      });

      // Add patient response
      const patientMsg: ChatMessage = { id: uid(), sender: 'patient', text: chip, time: now() };
      updateSession(sid, (s) => ({ ...s, messages: [...s.messages, patientMsg] }));
      scrollToBottom();

      // Route to flow
      processChipChoice(sid, chip);
    },
    [activeSession, updateSession, scrollToBottom],
  );

  /* ── Process chip choice → route to flow steps ── */
  const processChipChoice = useCallback(
    (sid: string, chip: string) => {
      const session = sessions.find((s) => s.id === sid);
      if (!session) return;

      const { flow, step } = session;

      /* ── INITIAL: No flow yet ── */
      if (!flow) {
        if (chip.includes('Ho') || chip.includes('Đau họng')) {
          updateSession(sid, (s) => ({ ...s, flow: 'A', step: 1, title: 'Ho / Đau họng' }));
          addBotMessage(sid, {
            sender: 'ai',
            text: 'Bạn bị ho và đau họng từ khi nào?',
            chips: { options: ['Hôm nay', '1–2 ngày', '3–5 ngày', 'Hơn 1 tuần'] },
          });
        } else if (chip.includes('Sốt')) {
          updateSession(sid, (s) => ({ ...s, flow: 'B', step: 1, title: 'Sốt' }));
          addBotMessage(sid, {
            sender: 'ai',
            text: 'Bạn đang bị sốt. Nhiệt độ cơ thể hiện tại của bạn là bao nhiêu?',
            chips: { options: ['Dưới 38°C', '38°C – 39°C', 'Trên 39°C', 'Không đo được'] },
          });
        } else if (chip.includes('Khó thở')) {
          updateSession(sid, (s) => ({ ...s, flow: 'C', step: 1, title: 'Khó thở' }));
          addBotMessage(sid, {
            sender: 'ai',
            text: '⚠️ Khó thở là triệu chứng cần được đánh giá ngay.\nMức độ khó thở của bạn như thế nào?',
            chips: { options: ['Hơi khó thở khi vận động', 'Khó thở cả khi nghỉ', 'Rất khó thở, tức ngực'] },
          });
        } else if (chip.includes('Khác')) {
          // Show free text input — do nothing special, user types
          return;
        } else {
          // Đau đầu, Buồn nôn → go to Flow A from step 2
          updateSession(sid, (s) => ({ ...s, flow: 'A', step: 1, title: chip.replace(/[^\p{L}\s/]/gu, '').trim() }));
          addBotMessage(sid, {
            sender: 'ai',
            text: 'Cảm ơn bạn đã mô tả. Để hỗ trợ tốt hơn, bạn có thể cho biết triệu chứng này xuất hiện từ khi nào?',
            chips: { options: ['Hôm nay', '1–2 ngày', '3–5 ngày', 'Hơn 1 tuần'] },
          });
        }
        return;
      }

      /* ── FLOW A ── */
      if (flow === 'A') {
        if (step === 1) {
          updateSession(sid, (s) => ({ ...s, step: 2 }));
          addBotMessage(sid, {
            sender: 'ai',
            text: 'Bạn có kèm theo triệu chứng nào khác không?',
            chips: { options: ['Sổ mũi', 'Sốt nhẹ', 'Mệt mỏi', FOLLOW_UP_NONE], multiSelect: true },
          });
        } else if (step === 2) {
          updateSession(sid, (s) => ({ ...s, step: 3 }));
          addBotMessage(sid, {
            sender: 'ai',
            text: 'Hiện bạn có đang dùng thuốc gì không?',
            chips: { options: ['Không', 'Có dùng thuốc OTC', 'Có đơn thuốc bác sĩ'] },
          });
        } else if (step === 3) {
          // Triage result GREEN
          updateSession(sid, (s) => ({ ...s, step: 4, urgency: 'green' }));
          addBotMessage(sid, {
            sender: 'system',
            text: '',
            urgency: {
              level: 'green',
              summary: 'Mức độ: BÌNH THƯỜNG 🟢',
              recommendation:
                'Các triệu chứng của bạn phù hợp với viêm họng thông thường. Không có dấu hiệu nguy hiểm. Bạn có thể theo dõi tại nhà hoặc đặt lịch khám trong 1–2 ngày tới.',
              specialty: 'Tai Mũi Họng',
            },
            actions: getUrgencyActions('green'),
          });
        }
        return;
      }

      /* ── FLOW B ── */
      if (flow === 'B') {
        if (step === 1) {
          if (chip.includes('Trên 39°C')) {
            // Jump to Flow C step 2
            updateSession(sid, (s) => ({ ...s, flow: 'C', step: 2, title: 'Sốt cao & Khó thở' }));
            addBotMessage(sid, {
              sender: 'ai',
              text: '⚠️ Sốt trên 39°C là triệu chứng cần theo dõi sát.\nBạn có kèm theo triệu chứng nào sau đây không?',
              chips: { options: ['Đau tức ngực', 'Môi / đầu ngón tay tím', 'Chóng mặt', FOLLOW_UP_NONE], multiSelect: true },
            });
            return;
          }
          updateSession(sid, (s) => ({ ...s, step: 2 }));
          addBotMessage(sid, {
            sender: 'ai',
            text: 'Bạn đã sốt được bao lâu rồi?',
            chips: { options: ['Mới bắt đầu hôm nay', '1–2 ngày', '3–4 ngày', 'Hơn 5 ngày'] },
          });
        } else if (step === 2) {
          updateSession(sid, (s) => ({ ...s, step: 3 }));
          addBotMessage(sid, {
            sender: 'ai',
            text: 'Ngoài sốt, bạn có gặp triệu chứng nào sau đây không?',
            chips: { options: ['Đau đầu', 'Đau cơ', 'Phát ban', 'Buồn nôn', FOLLOW_UP_NONE], multiSelect: true },
          });
        } else if (step === 3) {
          // Triage result YELLOW
          updateSession(sid, (s) => ({ ...s, step: 4, urgency: 'yellow' }));
          addBotMessage(sid, {
            sender: 'system',
            text: '',
            urgency: {
              level: 'yellow',
              summary: 'Mức độ: CẦN THEO DÕI 🟡',
              recommendation:
                'Triệu chứng sốt kéo dài cần được đánh giá bởi bác sĩ. Khuyến nghị kết nối tư vấn trực tiếp để được hỗ trợ kịp thời.',
              specialty: 'Nội khoa',
            },
            actions: getUrgencyActions('yellow'),
          });
        }
        return;
      }

      /* ── FLOW C ── */
      if (flow === 'C') {
        if (step === 1) {
          updateSession(sid, (s) => ({ ...s, step: 2 }));
          addBotMessage(sid, {
            sender: 'ai',
            text: 'Bạn có kèm theo triệu chứng nào sau đây không?',
            chips: { options: ['Đau tức ngực', 'Môi / đầu ngón tay tím', 'Chóng mặt', FOLLOW_UP_NONE], multiSelect: true },
          });
        } else if (step === 2) {
          // Triage result RED
          updateSession(sid, (s) => ({ ...s, step: 3, urgency: 'red' }));
          addBotMessage(sid, {
            sender: 'system',
            text: '',
            urgency: {
              level: 'red',
              summary: 'Mức độ: KHẨN CẤP 🔴',
              recommendation:
                'Triệu chứng của bạn có thể nghiêm trọng và cần được xử lý ngay lập tức. Vui lòng kết nối với Bác sĩ ngay hoặc đến cơ sở y tế gần nhất.',
              specialty: 'Cấp cứu',
            },
            actions: getUrgencyActions('red'),
          });
        }
      }
    },
    [sessions, updateSession, addBotMessage],
  );

  /* ── Handle multi-select confirm ── */
  const handleMultiConfirm = useCallback(
    (chipConfig: ChipConfig) => {
      if (!activeSession || multiSelected.length === 0) return;
      const sid = activeSession.id;

      // Disable chips
      updateSession(sid, (s) => {
        const msgs = s.messages.map((m) => {
          if (m.chips && !m.chips.disabled && m.chips.multiSelect) {
            return { ...m, chips: { ...m.chips, disabled: true, selected: multiSelected } };
          }
          return m;
        });
        return { ...s, messages: msgs };
      });

      // Add patient summary message
      const summary = multiSelected.length === 1 && multiSelected[0].includes('Không')
        ? multiSelected[0]
        : `Tôi bị: ${multiSelected.join(', ')}`;
      const patientMsg: ChatMessage = { id: uid(), sender: 'patient', text: summary, time: now() };
      updateSession(sid, (s) => ({ ...s, messages: [...s.messages, patientMsg] }));
      scrollToBottom();

      setMultiSelected([]);

      // Process next step (use dummy chip to trigger step advance)
      setTimeout(() => processChipChoice(sid, summary), 100);
    },
    [activeSession, multiSelected, updateSession, scrollToBottom, processChipChoice],
  );

  /* ── Handle action button clicks ── */
  const handleAction = useCallback(
    (action: UrgencyAction) => {
      if (!activeSession) return;
      const sid = activeSession.id;

      if (action === 'book') {
        const latestTriage = [...activeSession.messages].reverse().find((message) => message.urgency)?.urgency;
        const bookingSpecialty = getBookingSpecialtyName(latestTriage?.specialty);
        onNavigateToBooking?.({
          isReschedule: false,
          fromAppointment: null,
          prefilledSpecialty: bookingSpecialty,
          prefilledReason: latestTriage
            ? `Tái khám sau tư vấn online: ${activeSession.title}. ${latestTriage.recommendation}`
            : `Tái khám sau tư vấn online: ${activeSession.title}.`,
          startStep: bookingSpecialty ? 2 : 1,
        });
        if (!onNavigateToBooking) {
          setToast('Chuyển đến module Lịch hẹn...');
        }
        return;
      }

      if (action === 'call115') {
        setToast('Đang kết nối 115...');
        return;
      }

      if (action === 'handoff') {
        const latestTriage = [...activeSession.messages].reverse().find((message) => message.urgency)?.urgency;
        const handoffSpecialty = latestTriage?.specialty ?? activeSession.specialty ?? 'Nội khoa';
        const handoffDoctorName = getDoctorNameForSpecialty(handoffSpecialty);
        // Start handoff sequence
        updateSession(sid, (s) => ({ ...s, handoff: 'connecting', status: 'doctor-chat' }));

        // System message: connecting
        const connectMsg: ChatMessage = {
          id: uid(),
          sender: 'system',
          text: 'Đang kết nối với Bác sĩ chuyên khoa...',
          time: now(),
        };
        updateSession(sid, (s) => ({ ...s, messages: [...s.messages, connectMsg] }));
        scrollToBottom();

        // After 2s: doctor joins
        setTimeout(() => {
          const joinMsg: ChatMessage = {
            id: uid(),
            sender: 'system',
            text: `${handoffDoctorName} đã tham gia cuộc tư vấn`,
            time: now(),
          };
          updateSession(sid, (s) => ({
            ...s,
            messages: [...s.messages, joinMsg],
            handoff: 'active',
            doctorName: handoffDoctorName,
            specialty: handoffSpecialty,
          }));
          scrollToBottom();

          // After 1.5s: doctor first message
          const symptomTitle = sessions.find((s) => s.id === sid)?.title || 'triệu chứng';
          setTimeout(() => {
            addBotMessage(
              sid,
              {
                sender: 'doctor',
                text: `Xin chào bạn, tôi là ${handoffDoctorName}.\nTôi đã xem qua thông tin triệu chứng bạn mô tả.\nBạn có thể cho tôi biết thêm về ${symptomTitle.toLowerCase()}?`,
              },
              1200,
            );
          }, 1500);
        }, 2000);
      }
    },
    [activeSession, sessions, onNavigateToBooking, updateSession, addBotMessage, scrollToBottom],
  );

  /* ── Handle free text send ── */
  const handleSend = useCallback(() => {
    if (!activeSession || !inputValue.trim()) return;
    const sid = activeSession.id;
    const text = inputValue.trim();
    setInputValue('');

    // Add patient message
    const patientMsg: ChatMessage = { id: uid(), sender: 'patient', text, time: now() };
    updateSession(sid, (s) => ({ ...s, messages: [...s.messages, patientMsg] }));
    scrollToBottom();

    // If in handoff active → doctor scripted replies
    if (activeSession.handoff === 'active') {
      const replyIdx = activeSession.doctorReplyIndex;
      const isLastReply = replyIdx >= DOCTOR_REPLIES.length - 1;

      addBotMessage(sid, {
        sender: 'doctor',
        text: DOCTOR_REPLIES[replyIdx % DOCTOR_REPLIES.length],
        showComplete: isLastReply,
      });

      updateSession(sid, (s) => ({
        ...s,
        doctorReplyIndex: replyIdx + 1,
      }));
      return;
    }

    // If no flow yet and user typed free text (chose "Khác")
    if (!activeSession.flow) {
      updateSession(sid, (s) => ({ ...s, flow: 'A', step: 1, title: text.slice(0, 30) }));
      addBotMessage(sid, {
        sender: 'ai',
        text: 'Cảm ơn bạn đã mô tả. Để hỗ trợ tốt hơn, bạn có thể cho biết triệu chứng này xuất hiện từ khi nào?',
        chips: { options: ['Hôm nay', '1–2 ngày', '3–5 ngày', 'Hơn 1 tuần'] },
      });
    }
  }, [activeSession, inputValue, updateSession, addBotMessage, scrollToBottom]);

  /* ── Handle end session ── */
  const handleEndSession = useCallback(() => {
    if (!activeSession) return;
    const sid = activeSession.id;
    setShowConfirmEnd(false);

    // Add system message
    const endMsg: ChatMessage = {
      id: uid(),
      sender: 'system',
      text: `${activeSession.doctorName ?? 'Bác sĩ'} đã đánh dấu hoàn thành tư vấn`,
      time: now(),
    };
    updateSession(sid, (s) => ({
      ...s,
      messages: [...s.messages, endMsg],
      status: 'completed',
      handoff: 'ended',
      preview: 'Phiên tư vấn đã kết thúc',
    }));
    scrollToBottom();

    // Auto-create new session
    setTimeout(() => createSession(), 500);
  }, [activeSession, updateSession, scrollToBottom, createSession]);

  /* ── Chat partner for header ── */
  const chatPartner = (() => {
    if (!activeSession) return null;
    if (activeSession.handoff === 'active' || activeSession.handoff === 'ended') {
      return {
        name: activeSession.doctorName ?? 'BS. Nguyễn Văn A',
        type: 'doctor' as const,
        online: activeSession.status === 'doctor-chat',
        specialty: activeSession.specialty,
      };
    }
    return { name: 'Trợ lý AI — TriageAI', type: 'ai' as const, online: true };
  })();

  /* ── Should hide input (chips active and no free input needed) ── */
  const hasActiveChips = activeSession?.messages.some((m) => m.chips && !m.chips.disabled) ?? false;
  const showFreeInput = !isCompleted && !hasActiveChips;
  const isInHandoff = activeSession?.handoff === 'active';

  return (
    <div className="consult-grid">
      {/* Toast */}
      {toast ? (
        <div
          className="fixed right-4 top-4 z-[60] flex min-w-64 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-bold shadow-xl"
          style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 size={16} />
          {toast}
        </div>
      ) : null}

      {/* Confirm dialog */}
      {showConfirmEnd ? (
        <ConfirmDialog
          title="Kết thúc cuộc tư vấn?"
          message="Cuộc tư vấn sẽ được lưu vào lịch sử. Bạn có thể xem lại bất cứ lúc nào."
          cancelText="Hủy bỏ"
          confirmText="Xác nhận kết thúc"
          tone="primary"
          iconless
          onCancel={() => setShowConfirmEnd(false)}
          onConfirm={handleEndSession}
        />
      ) : null}

      {/* ══════════════════════════════════════
         LEFT COLUMN — Session List
         ══════════════════════════════════════ */}
      <aside className="consult-sidebar">
        <div className="consult-sidebar-header">
          <p className="consult-sidebar-title">Phiên tư vấn</p>
          <button type="button" className="consult-new-btn" onClick={createSession}>
            <Plus size={16} />
            Tư vấn mới
          </button>
        </div>

        <div className="consult-session-list">
          {sessions.map((session) => {
            const u = URGENCY_MAP[session.urgency];
            return (
              <button
                key={session.id}
                type="button"
                className={`consult-session-item ${session.id === activeId ? 'consult-session-item--active' : ''}`}
                onClick={() => { setActiveId(session.id); setMultiSelected([]); }}
              >
                <div className="consult-session-top">
                  <span className="consult-session-name">{session.title}</span>
                  <span className={`urgency-badge ${u.cls}`}>{u.label}</span>
                </div>
                <div className="consult-session-top">
                  <span className="consult-session-preview">{session.preview}</span>
                  <span className="consult-session-time">{session.createdAt}</span>
                </div>
              </button>
            );
          })}

          {sessions.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Chưa có phiên tư vấn nào
            </p>
          ) : null}
        </div>
      </aside>

      {/* ══════════════════════════════════════
         RIGHT COLUMN — Chat Window
         ══════════════════════════════════════ */}
      {activeSession ? (
        <div className="consult-chat">
          {/* ── Chat Header ── */}
          <div className="consult-chat-header">
            <div className="consult-chat-header-left">
              <div
                className={`consult-chat-avatar ${
                  chatPartner?.type === 'ai' ? 'consult-chat-avatar--ai' : 'consult-chat-avatar--doctor'
                }`}
              >
                {chatPartner?.type === 'ai' ? <Bot size={18} /> : <Stethoscope size={18} />}
              </div>
              <div className="consult-chat-info">
                <span className="consult-chat-name">{chatPartner?.name}</span>
                <span className="consult-chat-status">
                  <span
                    className={`consult-chat-status-dot ${
                      chatPartner?.online ? '' : 'consult-chat-status-dot--offline'
                    }`}
                  />
                  {chatPartner?.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
                  {chatPartner?.type === 'doctor' && chatPartner.specialty ? (
                    <>
                      <span style={{ color: 'var(--color-text-disabled)' }}>·</span>
                      {chatPartner.specialty}
                    </>
                  ) : null}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeSession.urgency !== 'pending' ? (
                <span className={`urgency-badge ${URGENCY_MAP[activeSession.urgency].cls}`}>
                  {URGENCY_MAP[activeSession.urgency].label}
                </span>
              ) : null}
              {isInHandoff ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold transition"
                  style={{
                    border: '1px solid var(--color-danger)',
                    color: 'var(--color-danger)',
                    background: 'transparent',
                  }}
                  onClick={() => setShowConfirmEnd(true)}
                >
                  Kết thúc tư vấn
                </button>
              ) : null}
            </div>
          </div>

          {/* ── Messages ── */}
          <div className="consult-messages">
            {activeSession.messages.map((msg) => {
              /* Urgency assessment card */
              if (msg.sender === 'system' && msg.urgency) {
                return (
                  <div key={msg.id}>
                    <UrgencyCard urgency={msg.urgency} />
                    {msg.actions && !isCompleted && activeSession.handoff === null ? (
                      <div className="urgency-card-actions" style={{ maxWidth: '85%', margin: '8px auto 0' }}>
                        {msg.actions.map((a) => (
                          <button
                            key={a.action}
                            type="button"
                            className={`urgency-action-btn urgency-action-btn--${a.style}`}
                            onClick={() => handleAction(a.action)}
                          >
                            {a.style === 'danger' ? <Siren size={14} /> : null}
                            {a.action === 'book' ? <CalendarDays size={14} /> : null}
                            {a.action === 'call115' ? <Phone size={14} /> : null}
                            {a.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }

              /* System divider message */
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id}>
                    <div className="chat-system-msg">
                      {msg.text}
                    </div>
                    {msg.sessionEndText ? (
                      <div className="session-end-marker">
                        <span>✓ {msg.sessionEndText}</span>
                      </div>
                    ) : null}
                  </div>
                );
              }

              /* Regular chat bubble */
              const isRight = msg.sender === 'patient';
              return (
                <div key={msg.id}>
                  <div className={`chat-bubble-row ${isRight ? 'chat-bubble-row--right' : ''}`}>
                    <BubbleAvatar sender={msg.sender} />
                    <div className={`chat-bubble chat-bubble--${msg.sender}`}>
                      {msg.text.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < msg.text.split('\n').length - 1 ? <br /> : null}
                        </span>
                      ))}
                      <span className="chat-bubble-time">{msg.time}</span>
                      {msg.showComplete ? (
                        <button
                          type="button"
                          className="chat-bubble-action"
                          onClick={() => setShowConfirmEnd(true)}
                        >
                          <CheckCircle2 size={14} />
                          Hoàn thành tư vấn
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Chips */}
                  {msg.chips ? (
                    <div className="chat-chips" style={{ marginTop: 'var(--spacing-sm)' }}>
                      {msg.chips.options.map((opt) => {
                        const isMulti = msg.chips!.multiSelect;
                        const isDisabled = msg.chips!.disabled;
                        const isSelected = isDisabled
                          ? msg.chips!.selected?.includes(opt)
                          : isMulti
                          ? multiSelected.includes(opt)
                          : false;

                        return (
                          <button
                            key={opt}
                            type="button"
                            className={`chat-chip ${isSelected ? 'chat-chip--selected' : ''} ${isDisabled ? 'chat-chip--disabled' : ''}`}
                            disabled={isDisabled}
                            onClick={() => {
                              if (isDisabled) return;
                              if (isMulti) {
                                setMultiSelected((prev) => getNextMultiSelection(prev, opt));
                              } else {
                                handleChipSelect(opt, msg.chips!);
                              }
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                      {msg.chips.multiSelect && !msg.chips.disabled && multiSelected.length > 0 ? (
                        <button
                          type="button"
                          className="chat-chip-confirm"
                          onClick={() => handleMultiConfirm(msg.chips!)}
                        >
                          <Check size={14} />
                          Xác nhận
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping ? (
              <div className="chat-bubble-row">
                <BubbleAvatar sender={isInHandoff ? 'doctor' : 'ai'} />
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Bar / Ended Banner ── */}
          {isCompleted ? (
            <div className="consult-ended-banner">
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
              Phiên tư vấn đã kết thúc
            </div>
          ) : showFreeInput || isInHandoff ? (
            <div className="consult-input-bar">
              <textarea
                ref={inputRef}
                className="consult-input"
                rows={1}
                placeholder={isInHandoff ? 'Nhập tin nhắn cho bác sĩ...' : 'Mô tả triệu chứng của bạn...'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                type="button"
                className="consult-send-btn"
                disabled={!inputValue.trim() || isTyping}
                aria-label="Gửi tin nhắn"
                onClick={handleSend}
              >
                <Send size={18} />
              </button>
            </div>
          ) : (
            /* Chips are active — hide input */
            <div className="consult-input-bar" style={{ justifyContent: 'center' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Vui lòng chọn một trong các lựa chọn phía trên
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ── Empty State ── */
        <div className="consult-chat">
          <div className="consult-empty">
            <div className="consult-empty-icon">
              <MessageCircle size={28} />
            </div>
            <h2 className="consult-empty-title">Chưa có phiên tư vấn nào</h2>
            <p className="consult-empty-desc">
              Bấm <strong>Tư vấn mới</strong> để bắt đầu mô tả triệu chứng. Trợ lý AI sẽ sàng lọc và kết nối bạn với bác sĩ phù hợp.
            </p>
            <button type="button" className="consult-new-btn" style={{ width: 'auto' }} onClick={createSession}>
              <Plus size={16} />
              Tư vấn mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════ */

function BubbleAvatar({ sender }: { sender: MessageSender }) {
  if (sender === 'ai') {
    return (
      <span className="chat-bubble-avatar" style={{ background: 'linear-gradient(135deg,#c4b5fd,#a78bfa)', color: '#fff' }}>
        <Bot size={14} />
      </span>
    );
  }
  if (sender === 'patient') {
    return (
      <span className="chat-bubble-avatar" style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
        <User size={14} />
      </span>
    );
  }
  if (sender === 'doctor') {
    return (
      <span className="chat-bubble-avatar" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
        <Stethoscope size={14} />
      </span>
    );
  }
  return null;
}

function UrgencyCard({
  urgency,
}: {
  urgency: NonNullable<ChatMessage['urgency']>;
}) {
  const u = URGENCY_MAP[urgency.level];
  const LevelIcon = urgency.level === 'red' ? ShieldAlert : urgency.level === 'yellow' ? AlertTriangle : CheckCircle2;

  return (
    <div className="urgency-card">
      <div className="urgency-card-title">
        <LevelIcon
          size={18}
          style={{
            color:
              urgency.level === 'red'
                ? 'var(--color-danger)'
                : urgency.level === 'yellow'
                ? 'var(--color-warning)'
                : 'var(--color-success)',
          }}
        />
        Kết quả sàng lọc AI
        <span className={`urgency-badge ${u.cls}`}>{urgency.summary}</span>
      </div>
      <p className="urgency-card-detail">{urgency.recommendation}</p>
      {urgency.specialty ? (
        <p className="urgency-card-detail">
          <strong>Chuyên khoa đề xuất:</strong> {urgency.specialty}
          <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '2px' }} />
        </p>
      ) : null}
    </div>
  );
}
