import {
  LayoutDashboard,
  MessageCircle,
  CalendarDays,
  FolderHeart,
  UserRound,
  Heart,
  Baby,
  Ear,
  Newspaper,
  Stethoscope,
  BookOpen,
} from 'lucide-react';
import type { HealthArticle, PatientMenuItem, Specialty, UpcomingAppointment, AppointmentData, SpecialtyOption, DoctorOption, DoctorSchedule } from './types';
import type { NotificationItem } from '../../components/common/NotificationBell';

/* ── Sidebar Menu ── */
export const patientMenu: PatientMenuItem[] = [
  { id: 'dashboard', label: 'Trang chủ', icon: LayoutDashboard },
  { id: 'consultation', label: 'Tư vấn Y tế', icon: MessageCircle },
  { id: 'appointments', label: 'Lịch hẹn của tôi', icon: CalendarDays },
  { id: 'health-records', label: 'Hồ sơ sức khỏe', icon: FolderHeart },
  { id: 'articles', label: 'Cẩm nang y tế', icon: BookOpen },
  { id: 'account', label: 'Tài khoản', icon: UserRound },
];

/* ── Upcoming Appointment ── */
export const upcomingAppointment: UpcomingAppointment = {
  date: 'Thứ Năm, 05/06/2026',
  time: '09:00 – 09:30',
  doctor: 'BS. Nguyễn Văn A',
  specialty: 'Tai Mũi Họng',
  location: 'Fakeeh Care Group — Phòng 203, Tầng 2',
};

/* ── Popular Specialties ── */
export const popularSpecialties: Specialty[] = [
  { id: 'sp-cardio', name: 'Tim mạch', icon: Heart, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  { id: 'sp-pediatrics', name: 'Nhi khoa', icon: Baby, color: 'text-sky-600', bgColor: 'bg-sky-50' },
  { id: 'sp-ent', name: 'Tai Mũi Họng', icon: Ear, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { id: 'sp-gastro', name: 'Tiêu hóa', icon: Stethoscope, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
];

/* ── Health Articles ── */
export const healthArticles: HealthArticle[] = [
  {
    id: 'art-1',
    title: '5 dấu hiệu cảnh báo bệnh tim mà bạn không nên bỏ qua',
    category: 'Tim mạch',
    imageUrl: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800&h=450&fit=crop',
    author: 'PGS.TS. Lê Minh Tuấn',
    readTime: '5 phút',
    publishedAt: '28/05/2026',
    content: [
      'Bệnh tim mạch là một trong những nguyên nhân hàng đầu gây tử vong trên toàn thế giới, diễn tiến thầm lặng nhưng để lại hậu quả vô cùng nghiêm trọng. Nhiều người thường chủ quan bỏ qua các dấu hiệu cảnh báo ban đầu, chỉ đến khi bệnh trở nặng mới đi khám. Việc nhận biết sớm các triệu chứng bất thường là chìa khóa vàng giúp bảo vệ trái tim của bạn và gia đình.',
      'Dấu hiệu đầu tiên và phổ biến nhất chính là cảm giác đau tức ngực hoặc khó thở khi vận động nhẹ. Cơn đau thường xuất hiện ở vùng ngực trái, có cảm giác như bị đè nén, thắt chặt và có thể lan rộng ra cánh tay, vai, cổ hoặc hàm. Triệu chứng này đôi khi bị nhầm lẫn với đau dạ dày hoặc mỏi cơ, dẫn đến sự chậm trễ trong việc cấp cứu.',
      'Bên cạnh đó, hiện tượng mệt mỏi kéo dài không rõ nguyên nhân, hoa mắt, chóng mặt hoặc thường xuyên hồi hộp, đánh trống ngực cũng là những dấu hiệu không thể coi thường. Khi tim hoạt động không hiệu quả, lượng máu cung cấp cho các cơ quan quan trọng bị suy giảm, đặc biệt là brain/não bộ, dẫn đến cảm giác kiệt sức ngay cả khi bạn không làm việc nặng.',
      'Cuối cùng, hiện tượng phù nề ở chân, mắt cá chân hoặc bàn chân cũng cảnh báo tình trạng suy tim đang tiến triển. Khi sức co bóp của cơ tim yếu đi, máu và chất lỏng sẽ bị ứ đọng lại ở các bộ phận thấp của cơ thể do lực hấp dẫn. Nếu phát hiện một hoặc nhiều dấu hiệu trên, hãy chủ động liên hệ bác sĩ chuyên khoa tim mạch để được chẩn đoán và điều trị kịp thời.'
    ]
  },
  {
    id: 'art-2',
    title: 'Hướng dẫn chăm sóc trẻ bị sốt tại nhà an toàn và hiệu quả',
    category: 'Nhi khoa',
    imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=450&fit=crop',
    author: 'BS.CKII. Trần Đăng Khoa',
    readTime: '6 phút',
    publishedAt: '30/05/2026',
    content: [
      'Sốt là một phản ứng tự nhiên của cơ thể trẻ để chống lại các tác nhân gây bệnh như vi khuẩn hay vi-rút. Tuy nhiên, việc trẻ đột ngột sốt cao thường khiến các bậc phụ huynh vô cùng lo lắng và lúng túng. Hiểu rõ nguyên tắc chăm sóc trẻ bị sốt tại nhà không chỉ giúp trẻ dễ chịu hơn mà còn phòng tránh được các biến chứng nguy hiểm như co giật do sốt cao.',
      'Trước hết, cha mẹ cần thường xuyên theo dõi nhiệt độ của trẻ bằng nhiệt kế chính xác ở nách hoặc tai. Khi nhiệt độ dưới 38.5°C, hãy ưu tiên các biện pháp vật lý như cho trẻ mặc quần áo mỏng, rộng rãi, thoáng mát và lau người bằng nước ấm (khoảng 35.5 - 36°C) ở các vùng nách, bẹn, trán. Tránh tuyệt đối việc chườm lạnh bằng đá hoặc dán miếng hạ sốt quá nhiều vì có thể gây co mạch ngoại vi.',
      'Nếu trẻ sốt từ 38.5°C trở lên, phụ huynh có thể cho trẻ uống thuốc hạ sốt phổ biến như Paracetamol với liều lượng từ 10 - 15mg cho mỗi kg cân nặng của trẻ, cách mỗi 4 - 6 giờ nếu trẻ vẫn còn sốt. Bên cạnh đó, việc bổ sung nước và chất điện giải là vô cùng cần thiết. Hãy khuyến khích trẻ uống nhiều nước ấm, nước oresol pha đúng tỷ lệ, nước trái cây hoặc tăng cường bú mẹ đối với trẻ nhỏ để bù lại lượng nước mất đi qua da.',
      'Đặc biệt, cha mẹ cần đưa trẻ đến bệnh viện ngay lập tức nếu thấy các dấu hiệu nguy kịch như: trẻ dưới 3 tháng tuổi sốt cao, sốt kéo dài quá 3 ngày không giảm, trẻ li bì, khó đánh thức, nôn mửa liên tục, co giật, thở nhanh, thở rút lõm lồng ngực hoặc xuất hiện các nốt phát ban lạ trên da.'
    ]
  },
  {
    id: 'art-3',
    title: 'Viêm xoang mãn tính: Nguyên nhân và phương pháp điều trị mới',
    category: 'Tai Mũi Họng',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=450&fit=crop',
    author: 'TS.BS. Nguyễn Văn A',
    readTime: '5 phút',
    publishedAt: '25/05/2026',
    content: [
      'Viêm xoang mãn tính là tình trạng các hốc quanh mũi bị viêm và sưng nề kéo dài trên 12 tuần, bất chấp việc người bệnh đã áp dụng nhiều biện pháp điều trị nội khoa thông thường. Căn bệnh này gây ra những phiền toái dai dẳng như nghẹt mũi, chảy dịch mũi sau, giảm khứu giác, đau nhức vùng mặt và đau đầu ê ẩm, làm ảnh hưởng nghiêm trọng đến năng suất làm việc cũng như chất lượng cuộc sống.',
      'Nguyên nhân gây viêm xoang mãn tính rất đa dạng, bao gồm nhiễm trùng đường hô hấp tái đi tái lại, sự phát triển của polyp mũi làm cản trước đường dẫn lưu, lệch vách ngăn mũi hoặc do các yếu tố dị ứng với thời tiết, phấn hoa, bụi bẩn. Ngoài ra, môi trường sống ô nhiễm hoặc hệ thống miễn dịch suy yếu cũng góp phần làm cho các triệu chứng viêm nhiễm trở nên khó kiểm soát hơn.',
      'Hiện nay, y học đã phát triển nhiều phương pháp điều trị mới, mang lại hiệu quả cao và giảm thiểu đau đớn cho người bệnh. Bên cạnh việc sử dụng các thuốc xịt mũi corticosteroid thế hệ mới, thuốc kháng histamine và rửa mũi bằng nước muối sinh lý đúng cách, kỹ thuật phẫu thuật nội soi mũi xoang chức năng (FESS) đã trở thành giải pháp tối ưu cho những trường hợp nặng, giúp giải phóng tắc nghẽn và phục hồi sự lưu thông tự nhiên của xoang.',
      'Để phòng ngừa bệnh tái phát, người bệnh nên chủ động giữ ấm cơ thể khi thời tiết thay đổi đột ngột, đeo khẩu trang khi ra đường để tránh hít phải khói bụi độc hại, vệ sinh mũi họng hàng ngày và duy trì chế độ dinh dưỡng giàu vitamin để tăng cường sức đề kháng cho cơ thể.'
    ]
  },
  {
    id: 'art-4',
    title: 'Chế độ ăn uống lành mạnh cho người bệnh dạ dày trào ngược',
    category: 'Tiêu hóa',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop',
    author: 'TS.BS. Phạm Văn Nam',
    readTime: '4 phút',
    publishedAt: '20/05/2026',
    content: [
      'Trào ngược dạ dày thực quản (GERD) là tình trạng dịch dạ dày bao gồm cả axit và thức ăn trào ngược lên vùng thực quản, gây ra các cảm giác vô cùng khó chịu như ợ chua, ợ nóng, đau rát vùng thượng vị. Chế độ ăn uống hàng ngày đóng vai trò quyết định trong việc kiểm soát tần suất xuất hiện và mức độ nghiêm trọng của các cơn trào ngược dạ dày này.',
      'Người bệnh nên ưu tiên bổ sung các nhóm thực phẩm có tính kiềm, có khả năng trung hòa axit dịch vị hoặc dễ tiêu hóa. Các loại rau xanh như súp lơ, bắp cải, rau cải và các loại quả ít axit như chuối, đu đủ, táo là lựa chọn tuyệt vời. Ngoài ra, các loại ngũ cốc nguyên hạt, yến mạch và bánh mì gối cũng có khả năng hút bớt lượng axit dư thừa trong dạ dày, bảo vệ niêm mạc thực quản.',
      'Ngược lại, cần hạn chế tối đa các thực phẩm kích thích tăng tiết axit dạ dày hoặc làm giãn cơ thắt thực quản dưới. Đó là các món ăn nhiều dầu mỡ, đồ chiên rán, đồ chua có tính axit cao (cam, chanh, bưởi), thực phẩm cay nóng chứa nhiều ớt, tiêu, tỏi và đặc biệt là đồ uống có gas, cà phê, trà đặc và rượu bia.',
      'Một nguyên tắc ăn uống cực kỳ quan trọng khác là không nên ăn quá no trong một bữa, hãy chia nhỏ khẩu phần ăn thành 5 - 6 bữa trong ngày để dạ dày không bị quá tải. Sau khi ăn, tuyệt đối không được nằm ngay hoặc vận động mạnh trong vòng 2 - 3 tiếng đầu, mà nên ngồi nghỉ ngơi thư giãn hoặc đi bộ nhẹ nhàng để hỗ trợ quá trình tiêu hóa tốt hơn.'
    ]
  },
  {
    id: 'art-5',
    title: 'Tầm quan trọng của giấc ngủ đối với sức khỏe tinh thần và thể chất',
    category: 'Đời sống',
    imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=450&fit=crop',
    author: 'BS. Nguyễn Thị Vân',
    readTime: '5 phút',
    publishedAt: '01/06/2026',
    content: [
      'Trong nhịp sống hiện đại hối hả, nhiều người thường có xu hướng cắt giảm thời gian ngủ để dành cho công việc, học tập hoặc giải trí. Họ coi giấc ngủ là một hoạt động thụ động và không thực sự cần thiết. Tuy nhiên, các nghiên cứu khoa học đã chứng minh giấc ngủ chất lượng là nền tảng cốt lõi giúp tái tạo năng lượng cho cả thể chất lẫn tinh thần sau một ngày dài làm việc.',
      'Về mặt thể chất, trong lúc ngủ, cơ thể sẽ giải phóng các hormone tăng trưởng quan trọng, giúp sửa chữa các mô tế bào bị tổn thương, phục hồi cơ bắp và củng cố hệ thống miễn dịch phòng ngừa bệnh tật. Việc thiếu ngủ mãn tính làm tăng đáng kể nguy cơ mắc các bệnh lý nguy hiểm như tăng huyết áp, tiểu đường type 2, béo phì và các tai biến mạch máu não.',
      'Về mặt tinh thần, giấc ngủ đóng vai trò như một bộ lọc thông tin kỳ diệu cho não bộ. Khi ngủ sâu, não sẽ tiến hành sắp xếp, lưu trữ các thông tin hữu ích và đào thải các độc tố tích tụ trong ngày. Thiếu ngủ kéo dài sẽ dẫn đến suy giảm trí nhớ, kém tập trung, giảm khả năng đưa ra quyết định chính xác và dễ rơi vào trạng thái căng thẳng, lo âu, thậm chí là trầm cảm.',
      'Để cải thiện chất lượng giấc ngủ, mỗi người nên cố gắng duy trì một khung giờ ngủ và thức dậy cố định hàng ngày, kể cả vào những ngày cuối tuần. Hãy tạo một không gian phòng ngủ yên tĩnh, tối và thoáng mát, đồng thời hạn chế sử dụng các thiết bị điện tử như điện thoại, máy tính ít nhất 1 giờ trước khi đi ngủ để tránh ảnh hưởng từ ánh sáng xanh.'
    ]
  },
  {
    id: 'art-6',
    title: 'Làm thế nào để phòng tránh đột quỵ trong thời tiết nắng nóng?',
    category: 'Tim mạch',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=450&fit=crop',
    author: 'PGS.TS. Lê Minh Tuấn',
    readTime: '6 phút',
    publishedAt: '03/06/2026',
    content: [
      'Những đợt nắng nóng gay gắt kéo dài của mùa hè không chỉ gây cảm giác mệt mỏi, khó chịu mà còn là tác nhân hàng đầu làm gia tăng số ca nhập viện vì đột quỵ, đặc biệt ở người cao tuổi và những người có bệnh lý nền về tim mạch, huyết áp. Nhiệt độ ngoài trời tăng cao khiến cơ thể phải hoạt động hết công suất để điều hòa thân nhiệt, dẫn đến việc mất nước và muối qua mồ hôi.',
      'Khi cơ thể bị mất nước nghiêm trọng mà không được bù đắp kịp thời, thể tích tuần hoàn máu sẽ suy giảm, làm máu trở nên đậm đặc hơn, dễ hình thành các cục máu đông gây tắc nghẽn mạch máu não. Đồng thời, sự thay đổi nhiệt độ đột ngột giữa phòng điều hòa lạnh và ngoài trời nóng có thể gây co mạch đột ngột, làm huyết áp tăng vọt dẫn đến xuất huyết não.',
      'Để chủ động phòng ngừa đột quỵ trong ngày hè, nguyên tắc quan trọng nhất là uống đủ nước hàng ngày (từ 2 - 2.5 lít nước ấm hoặc nước trái cây), chia nhỏ lượng nước uống đều đặn trong ngày và không đợi đến khi thấy khát mới uống. Hạn chế tối đa việc đi ra ngoài trời nắng vào những khung giờ cao điểm từ 11 giờ trưa đến 3 giờ chiều.',
      'Ngoài ra, khi sử dụng điều hòa, tuyệt đối không nên đặt nhiệt độ trong phòng quá chênh lệch so với bên ngoài (mức nhiệt khuyến cáo là 26 - 28°C). Trước khi bước ra khỏi phòng điều hòa hoặc xe ô tô, hãy tắt điều hòa hoặc đứng ở khu vực trung gian vài phút để cơ thể thích nghi dần với nhiệt độ môi trường, tránh hiện tượng sốc nhiệt nguy hiểm.'
    ]
  }
];

/* ── Notifications for Patient ── */
export const patientNotifications: NotificationItem[] = [
  {
    id: 'patient-appointment-confirmed',
    title: 'Lịch hẹn đã được xác nhận',
    description: 'Lịch khám ngày 05/06/2026 lúc 09:00 với BS. Nguyễn Văn A đã được phòng khám xác nhận.',
    time: '2 giờ trước',
    tone: 'bg-emerald-100 text-emerald-600',
    targetLabel: 'Đặt lịch khám',
  },
  {
    id: 'patient-appointment-reminder',
    title: 'Nhắc lịch khám ngày mai',
    description: 'Bạn có lịch hẹn vào 09:00 ngày 05/06 tại Fakeeh Care Group. Hãy đến trước 15 phút.',
    time: '5 giờ trước',
    tone: 'bg-amber-100 text-amber-600',
    targetLabel: 'Đặt lịch khám',
  },
  {
    id: 'patient-lab-result',
    title: 'Kết quả xét nghiệm đã có',
    description: 'Kết quả xét nghiệm máu ngày 28/05 đã được cập nhật vào hồ sơ sức khỏe.',
    time: '1 ngày trước',
    tone: 'bg-sky-100 text-sky-600',
    targetLabel: 'Hồ sơ sức khỏe',
  },
  {
    id: 'patient-medication-reminder',
    title: 'Nhắc uống thuốc',
    description: 'Đã đến giờ uống Amoxicillin 500mg (1 viên sau bữa ăn sáng).',
    time: '30 phút trước',
    tone: 'bg-violet-100 text-violet-600',
    targetLabel: 'Hồ sơ sức khỏe',
  },
];

/* ══════════════════════════════════════════════════════════
   APPOINTMENT MODULE — MOCK DATA
   ══════════════════════════════════════════════════════════ */

/* ── Appointments ── */
export const initialAppointments: AppointmentData[] = [
  /* TAB 1 — Sắp tới */
  {
    id: 'appt-1',
    date: '10/06/2026',
    time: '09:00 – 09:30',
    doctor: 'TS.BS. Nguyễn Văn A',
    specialty: 'Tai Mũi Họng',
    location: 'Phòng khám 201 – Tầng 2',
    reason: 'Tái khám sau tư vấn online',
    status: 'upcoming',
  },
  {
    id: 'appt-2',
    date: '15/06/2026',
    time: '14:00 – 14:30',
    doctor: 'BS.CKI. Trần Thị Bình',
    specialty: 'Nội tổng quát',
    location: 'Phòng khám 105 – Tầng 1',
    reason: 'Kiểm tra kết quả xét nghiệm máu',
    status: 'upcoming',
  },
  /* TAB 2 — Chờ xác nhận */
  {
    id: 'appt-3',
    date: '12/06/2026',
    time: '10:30 – 11:00',
    doctor: 'PGS.TS. Lê Minh Tuấn',
    specialty: 'Tim mạch',
    location: 'Phòng khám 301 – Tầng 3',
    reason: 'Khó thở, tức ngực tái phát',
    status: 'pending',
  },
  {
    id: 'appt-4',
    date: '18/06/2026',
    time: '08:00 – 08:30',
    doctor: 'BS.CKI. Phạm Anh Khoa',
    specialty: 'Da liễu',
    location: 'Phòng khám 203 – Tầng 2',
    reason: 'Nổi mẩn đỏ vùng cánh tay',
    status: 'pending',
  },
  /* TAB 3 — Lịch sử khám */
  {
    id: 'appt-5',
    date: '20/05/2026',
    time: '14:00 – 14:30',
    doctor: 'TS.BS. Nguyễn Văn A',
    specialty: 'Tai Mũi Họng',
    location: 'Phòng khám 201 – Tầng 2',
    reason: 'Ho, đau họng kéo dài',
    status: 'completed',
  },
  {
    id: 'appt-6',
    date: '08/05/2026',
    time: '09:15 – 09:45',
    doctor: 'BS.CKI. Trần Thị Bình',
    specialty: 'Nội tổng quát',
    location: 'Phòng khám 105 – Tầng 1',
    reason: 'Sốt kéo dài, nghi sốt xuất huyết',
    status: 'completed',
  },
  {
    id: 'appt-7',
    date: '01/04/2026',
    time: '11:00 – 11:30',
    doctor: 'PGS.TS. Lê Minh Tuấn',
    specialty: 'Tim mạch',
    location: 'Phòng khám 301 – Tầng 3',
    reason: 'Khó thở, tức ngực',
    status: 'cancelled',
  },
];

/* ── Specialty Options (Wizard Step 1) ── */
export const specialtyOptions: SpecialtyOption[] = [
  { id: 'sp-general', icon: '🏥', name: 'Nội tổng quát', doctorCount: 2 },
  { id: 'sp-ent', icon: '👂', name: 'Tai Mũi Họng', doctorCount: 3 },
  { id: 'sp-cardio', icon: '❤️', name: 'Tim mạch', doctorCount: 2 },
  { id: 'sp-pediatrics', icon: '👶', name: 'Nhi khoa', doctorCount: 2 },
  { id: 'sp-gastro', icon: '🫁', name: 'Tiêu hóa', doctorCount: 1 },
  { id: 'sp-dental', icon: '🦷', name: 'Răng Hàm Mặt', doctorCount: 1 },
  { id: 'sp-derma', icon: '🧴', name: 'Da liễu', doctorCount: 1 },
  { id: 'sp-ortho', icon: '🦴', name: 'Cơ xương khớp', doctorCount: 1 },
  { id: 'sp-eyes', icon: '👁️', name: 'Chuyên khoa Mắt', doctorCount: 1 },
  { id: 'sp-pulmo', icon: '🫁', name: 'Hô hấp - Phổi', doctorCount: 1 },
  { id: 'sp-neuro', icon: '🧠', name: 'Thần kinh', doctorCount: 1 },
];

/* ── Doctor Options (Wizard Step 2) ── */
export const doctorOptions: DoctorOption[] = [
  {
    id: 'doc-1',
    name: 'TS.BS. Nguyễn Văn A',
    specialty: 'Tai Mũi Họng',
    experience: '12 năm kinh nghiệm',
    tags: ['Viêm xoang', 'Ung thư vòm họng', 'Nội soi TMH'],
    price: '350.000đ / lượt',
    rating: '4.9',
    ratingCount: 128,
    location: 'Phòng khám 201 – Tầng 2',
  },
  {
    id: 'doc-2',
    name: 'BS.CKI. Hoàng Thị Mai',
    specialty: 'Tai Mũi Họng',
    experience: '7 năm kinh nghiệm',
    tags: ['Dị ứng mũi', 'Viêm tai giữa', 'Khàn giọng'],
    price: '250.000đ / lượt',
    rating: '4.7',
    ratingCount: 84,
    location: 'Phòng khám 105 – Tầng 1',
  },
  {
    id: 'doc-3',
    name: 'BS. Trần Quốc Bảo',
    specialty: 'Tai Mũi Họng',
    experience: '4 năm kinh nghiệm',
    tags: ['Viêm họng', 'Amidan', 'Trẻ em'],
    price: '180.000đ / lượt',
    rating: '4.5',
    ratingCount: 41,
    location: 'Phòng khám 302 – Tầng 3',
  },
  {
    id: 'doc-4',
    name: 'TS.BS. Lê Nguyễn Công Minh',
    specialty: 'Nội tổng quát',
    experience: '10 năm kinh nghiệm',
    tags: ['Sốt kéo dài', 'Nội tổng hợp', 'Tầm soát sức khỏe'],
    price: '320.000đ / lượt',
    rating: '4.8',
    ratingCount: 112,
    location: 'Phòng khám 204 – Tầng 2',
  },
  {
    id: 'doc-5',
    name: 'BS.CKI. Nguyễn Thu Hương',
    specialty: 'Nội tổng quát',
    experience: '8 năm kinh nghiệm',
    tags: ['Hô hấp', 'Tiêu hóa', 'Bệnh lý nền'],
    price: '280.000đ / lượt',
    rating: '4.7',
    ratingCount: 96,
    location: 'Phòng khám 206 – Tầng 2',
  },
  {
    id: 'doc-6',
    name: 'PGS.TS. Lê Minh Tuấn',
    specialty: 'Tim mạch',
    experience: '20 năm kinh nghiệm',
    tags: ['Suy tim', 'Bệnh mạch vành', 'Tăng huyết áp'],
    price: '500.000đ / lượt',
    rating: '5.0',
    ratingCount: 245,
    location: 'Phòng khám 301 – Tầng 3',
  },
  {
    id: 'doc-7',
    name: 'BS. Nguyễn Thị Vân',
    specialty: 'Tim mạch',
    experience: '6 năm kinh nghiệm',
    tags: ['Rối loạn nhịp tim', 'Điện tâm đồ', 'Siêu âm tim'],
    price: '250.000đ / lượt',
    rating: '4.6',
    ratingCount: 68,
    location: 'Phòng khám 303 – Tầng 3',
  },
  {
    id: 'doc-8',
    name: 'BS.CKII. Trần Đăng Khoa',
    specialty: 'Nhi khoa',
    experience: '15 năm kinh nghiệm',
    tags: ['Sơ sinh', 'Dinh dưỡng trẻ em', 'Tiêm chủng'],
    price: '300.000đ / lượt',
    rating: '4.9',
    ratingCount: 189,
    location: 'Phòng khám 102 – Tầng 1',
  },
  {
    id: 'doc-9',
    name: 'ThS.BS. Lê Thị Hồng',
    specialty: 'Nhi khoa',
    experience: '8 năm kinh nghiệm',
    tags: ['Hô hấp nhi', 'Tiêu hóa nhi', 'Dị ứng ở trẻ'],
    price: '220.000đ / lượt',
    rating: '4.8',
    ratingCount: 104,
    location: 'Phòng khám 104 – Tầng 1',
  },
  {
    id: 'doc-10',
    name: 'TS.BS. Phạm Văn Nam',
    specialty: 'Tiêu hóa',
    experience: '14 năm kinh nghiệm',
    tags: ['Dạ dày', 'Đại tràng', 'Nội soi tiêu hóa'],
    price: '350.000đ / lượt',
    rating: '4.8',
    ratingCount: 156,
    location: 'Phòng khám 208 – Tầng 2',
  },
  {
    id: 'doc-11',
    name: 'ThS.BS. Nguyễn Minh Đức',
    specialty: 'Răng Hàm Mặt',
    experience: '9 năm kinh nghiệm',
    tags: ['Nhổ răng khôn', 'Niềng răng', 'Trồng răng Implant'],
    price: '400.000đ / lượt',
    rating: '4.9',
    ratingCount: 122,
    location: 'Phòng khám 112 – Tầng 1',
  },
  {
    id: 'doc-12',
    name: 'BS.CKI. Phạm Anh Khoa',
    specialty: 'Da liễu',
    experience: '8 năm kinh nghiệm',
    tags: ['Mụn trứng cá', 'Chàm - Eczema', 'Nám da - Tàn nhang'],
    price: '300.000đ / lượt',
    rating: '4.7',
    ratingCount: 88,
    location: 'Phòng khám 203 – Tầng 2',
  },
  {
    id: 'doc-13',
    name: 'TS.BS. Hoàng Ngọc Sơn',
    specialty: 'Cơ xương khớp',
    experience: '18 năm kinh nghiệm',
    tags: ['Thoái hóa khớp', 'Thoát vị đĩa đệm', 'Loãng xương'],
    price: '400.000đ / lượt',
    rating: '4.9',
    ratingCount: 177,
    location: 'Phòng khám 305 – Tầng 3',
  },
  {
    id: 'doc-14',
    name: 'BS.CKII. Lê Hoàng Nam',
    specialty: 'Chuyên khoa Mắt',
    experience: '16 năm kinh nghiệm',
    tags: ['Đo thị lực', 'Đục thủy tinh thể', 'Tật khúc xạ'],
    price: '300.000đ / lượt',
    rating: '4.8',
    ratingCount: 143,
    location: 'Phòng khám 215 – Tầng 2',
  },
  {
    id: 'doc-15',
    name: 'ThS.BS. Vũ Văn Thành',
    specialty: 'Hô hấp - Phổi',
    experience: '11 năm kinh nghiệm',
    tags: ['Hen suyễn', 'COPD', 'Viêm phổi'],
    price: '280.000đ / lượt',
    rating: '4.7',
    ratingCount: 92,
    location: 'Phòng khám 209 – Tầng 2',
  },
  {
    id: 'doc-16',
    name: 'PGS.TS. Nguyễn Văn Liệu',
    specialty: 'Thần kinh',
    experience: '22 năm kinh nghiệm',
    tags: ['Đau nửa đầu', 'Rối loạn tiền đình', 'Mất ngủ kéo dài'],
    price: '450.000đ / lượt',
    rating: '4.9',
    ratingCount: 310,
    location: 'Phòng khám 308 – Tầng 3',
  },
];

// Programmatic Generator for schedules to prevent code bloat and truncation
function generateScheduleForDoctor(doctorId: string, name: string): DoctorSchedule {
  const dates = [
    { label: 'Thứ 4 – 03/06', value: '03/06/2026', dayOfWeek: 'T4', dayMonth: '03/06' },
    { label: 'Thứ 5 – 04/06', value: '04/06/2026', dayOfWeek: 'T5', dayMonth: '04/06' },
    { label: 'Thứ 6 – 05/06', value: '05/06/2026', dayOfWeek: 'T6', dayMonth: '05/06' },
    { label: 'Thứ 7 – 06/06', value: '06/06/2026', dayOfWeek: 'T7', dayMonth: '06/06' },
    { label: 'CN – 07/06', value: '07/06/2026', dayOfWeek: 'CN', dayMonth: '07/06' },
    { label: 'Thứ 2 – 08/06', value: '08/06/2026', dayOfWeek: 'T2', dayMonth: '08/06' },
    { label: 'Thứ 3 – 09/06', value: '09/06/2026', dayOfWeek: 'T3', dayMonth: '09/06' },
  ];

  // Derive a stable seed from the doctor's name length and ID
  const seed = doctorId.charCodeAt(doctorId.length - 1) + name.length;

  return {
    doctorId,
    dates: dates.map((d, dIdx) => {
      // Sundays (dIdx = 4) and Saturdays (dIdx = 3) might have no slots for some doctors
      const isOff = (dIdx === 4 && (seed % 2 === 0)) || (dIdx === 3 && (seed % 3 === 0));
      if (isOff) {
        return { ...d, slots: [] };
      }

      // Base time slots
      const baseSlots = [
        '08:00 – 08:30',
        '08:30 – 09:00',
        '09:00 – 09:30',
        '09:30 – 10:00',
        '10:00 – 10:30',
        '10:30 – 11:00',
        '14:00 – 14:30',
        '14:30 – 15:00',
        '15:00 – 15:30',
        '15:30 – 16:00'
      ];

      // Select a subset of slots based on seed and day index
      const startIdx = (seed + dIdx) % 3;
      const count = 4 + ((seed * dIdx) % 4);
      const activeSlots = baseSlots.slice(startIdx, startIdx + count);

      const slots = activeSlots.map((time, sIdx) => ({
        time,
        // book some slots to simulate a busy clinic
        status: (sIdx === (seed + dIdx) % activeSlots.length) ? 'booked' as const : 'available' as const,
      }));

      return {
        ...d,
        slots,
      };
    }),
  };
}

export const doctorSchedules: DoctorSchedule[] = doctorOptions.map(doc => 
  generateScheduleForDoctor(doc.id, doc.name)
);
