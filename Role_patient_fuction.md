1. Nhóm Xác thực & Định danh (Authentication)
Đăng nhập / Đăng ký tài khoản:

Làm gì: Cho phép người dùng tạo tài khoản mới bằng Số điện thoại/Email và đăng nhập vào hệ thống qua mật khẩu.

Nhiệm vụ: Định danh người dùng. Đảm bảo mọi dữ liệu sức khỏe, lịch sử khám bệnh đều được bảo mật và gắn chính xác với một cá nhân duy nhất.

Đăng nhập nhanh (SSO):

Làm gì: Cho phép người dùng sử dụng tài khoản Google, Facebook hoặc Apple hiện có để đăng nhập mà không cần tạo mật khẩu mới.

Nhiệm vụ: Giảm thiểu rào cản thao tác, giúp người dùng mới vào app nhanh nhất có thể (tăng tỷ lệ chuyển đổi user).

Quên/Khôi phục mật khẩu:

Làm gì: Gửi mã xác thực (OTP) về SĐT/Email để người dùng thiết lập lại mật khẩu mới.

Nhiệm vụ: Xử lý tình huống ngoại lệ, đảm bảo người dùng không bị mất tài khoản và dữ liệu bệnh án khi quên thông tin đăng nhập.

2. Nhóm Trang chủ (Dashboard)
Lời chào & Cá nhân hóa (Greeting & Profile Snippet):

Làm gì: Hiển thị lời chào theo thời gian thực (Chào buổi sáng/chiều) kèm tên bệnh nhân. Góc phải có Avatar để truy cập nhanh vào trang Hồ sơ cá nhân.

Nhiệm vụ: Tạo cảm giác thân thiện, được quan tâm và xác nhận nhanh người dùng đang đăng nhập đúng tài khoản của mình.

Thẻ nhắc việc "Lịch hẹn sắp tới" (Upcoming Appointment):

Làm gì: Tự động trích xuất và hiển thị thông tin ca khám gần nhất (Ngày giờ, Tên Bác sĩ, Chuyên khoa). Có tích hợp mã QR hoặc nút "Hướng dẫn chỉ đường". Thẻ này chỉ xuất hiện khi có lịch hẹn chưa khám.

Nhiệm vụ: Đóng vai trò như một trợ lý nhắc việc. Giúp bệnh nhân không quên lịch hẹn (giảm tỷ lệ No-show) và check-in tại quầy nhanh chóng hơn.

Điều hướng nhanh (Quick Actions):

Làm gì: Cung cấp các nút bấm lớn (Icon + Text) dẫn đến các luồng chính: Hỏi đáp AI Chatbot, Khám Chuyên khoa, và Hồ sơ bệnh án.

Nhiệm vụ: Đóng vai trò là trạm trung chuyển (Hub). Giúp người bệnh đi thẳng đến giải pháp họ cần với 1 cú chạm (1-tap).

Khối "Chuyên khoa phổ biến" & "Cẩm nang y tế":

Làm gì: Trưng bày các chuyên khoa top đầu dưới dạng lưới và các bài viết tư vấn sức khỏe dưới dạng thẻ vuốt ngang.

Nhiệm vụ: Rút ngắn phễu tìm kiếm để chốt lịch nhanh và giáo dục cộng đồng, tăng tỷ lệ mở app ngay cả khi không ốm.

3. Nhóm Tư vấn Y tế (AI Chatbot & Telehealth)
Khởi tạo & Thu thập triệu chứng (AI Triage):

Làm gì: Bot chủ động đặt các câu hỏi logic để hỏi bệnh sử. Ưu tiên hiển thị các gợi ý dạng nút bấm (Chips/Pills) để người dùng chọn. AI sẽ tổng hợp và trả về cảnh báo mức độ khẩn cấp (Đỏ/Vàng/Xanh).

Nhiệm vụ: Số hóa bước sàng lọc ban đầu. Giúp bệnh nhân mô tả đúng bệnh tình nhanh chóng và ngăn chặn rủi ro chủ quan với các triệu chứng nguy hiểm.

Tư vấn trực tiếp với Bác sĩ (Human-in-the-loop):

Làm gì: Nối tiếp luồng AI Triage, hệ thống cho phép kết nối và nhắn tin trực tiếp (text, gửi ảnh) với Bác sĩ chuyên khoa để giải đáp các thắc mắc chuyên sâu.

Nhiệm vụ: Cung cấp kênh liên lạc chính thống giữa người bệnh và bác sĩ, xử lý các tình huống y khoa phức tạp mà AI không thể tự quyết định, đồng bộ với module Tư vấn trực tiếp của role Bác sĩ.

4. Nhóm Quản lý Lịch hẹn (Booking & Management)
Tra cứu & Đặt lịch khám mới:

Làm gì: Cung cấp luồng chọn Chuyên khoa -> Xem danh sách Bác sĩ (kèm giá, học hàm) -> Chọn giờ trống -> Tự động điền Form xác nhận (Autofill dữ liệu từ AI Chatbot nếu có).

Nhiệm vụ: Tối ưu hóa trải nghiệm ra quyết định và cắt giảm tối đa thao tác nhập liệu thủ công để chốt lịch hẹn.

Danh sách "Lịch hẹn của tôi":

Làm gì: Hiển thị toàn bộ lịch khám chia làm 3 tab trạng thái: Sắp tới (kèm nút Hủy/Dời lịch), Chờ xác nhận, và Lịch sử khám.

Nhiệm vụ: Cung cấp công cụ chủ động quản lý thời gian cho người bệnh. Khi người bệnh Hủy/Dời lịch ở đây, thông tin sẽ bắn thẳng về luồng điều phối của role Quản lý.

5. Nhóm Hồ sơ Sức khỏe (Personal EMR)
Sổ khám bệnh (Lịch sử khám):

Làm gì: Nơi lưu trữ toàn bộ lịch sử khám bệnh, chẩn đoán của các lần khám.

Nhiệm vụ: Trở thành "Sổ y bạ điện tử" trọn đời của cá nhân người dùng.

Kết quả Cận lâm sàng:

Làm gì: Lưu trữ và hiển thị các file kết quả Xét nghiệm, X-Quang, Siêu âm từ phòng Lab trả về (hỗ trợ Export PDF).

Nhiệm vụ: Khớp nối trực tiếp với luồng Kết quả cận lâm sàng của Bác sĩ. Bệnh nhân nhận file số hóa nhanh chóng mà không cần chờ đợi giấy tờ vật lý.

Quản lý Đơn thuốc & Chỉ số cơ thể:

Làm gì: Lưu toa thuốc điện tử kèm nút Báo thức nhắc uống thuốc. Khai báo Tiền sử dị ứng, chiều cao, cân nặng, nhóm máu.

Nhiệm vụ: Tạo thói quen tuân thủ điều trị. Dữ liệu tiền sử dị ứng sẽ liên kết để tạo Cảnh báo đỏ trên màn hình khi Bác sĩ kê đơn.

6. Nhóm Tài khoản & Phản hồi (Account & Feedback)
Cài đặt thông tin cá nhân:

Làm gì: Cập nhật thông tin liên lạc, đổi mật khẩu và thiết lập tài khoản.

Nhiệm vụ: Duy trì tính chính xác của dữ liệu định danh.

Đánh giá & Phản hồi sau khám:

Làm gì: Form chấm điểm sao (Rating) và viết nhận xét về Bác sĩ/Phòng khám.

Nhiệm vụ: Khép kín vòng đời khách hàng. Khi bệnh nhân viết đánh giá, dữ liệu này sẽ đẩy thẳng vào tab Đánh giá từ bệnh nhân của role Quản lý để xử lý.

7. Nhóm Thông báo (Notifications)
Trung tâm Quản lý Thông báo:

Làm gì: Icon hình Quả chuông đặt ở Top-bar. Hiển thị danh sách thông báo theo thứ tự thời gian. Hỗ trợ Deep-link (chạm vào thông báo nhảy thẳng đến chức năng tương ứng).

Nhiệm vụ: Nơi lưu trữ tập trung giúp bệnh nhân dễ dàng quản lý, lướt đọc và tra cứu mà không lo trôi thông tin.

Hệ thống Thông báo đẩy tự động (Push Notifications):

Làm gì: Bắn thông báo nổi ra ngoài màn hình ở các sự kiện: Xác nhận đặt lịch, Nhắc trước giờ khám, Có kết quả cận lâm sàng, Nhắc uống thuốc, và Yêu cầu đánh giá sau khi Bác sĩ ấn "Hoàn tất khám".

Nhiệm vụ: Tự động hóa trải nghiệm chăm sóc khách hàng, giữ kết nối liên tục với bệnh nhân.