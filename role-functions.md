# Chức năng theo vai trò - TriageAI

Tài liệu này liệt kê các chức năng chính của 2 vai trò đang có trong prototype: **Bác sĩ** và **Quản lý phòng khám**. Nội dung bám theo các module, dữ liệu mẫu và luồng tương tác hiện có trong ứng dụng.

## 1. Role Bác sĩ

### Mục tiêu sử dụng

Bác sĩ dùng hệ thống trong ca trực để nắm nhanh tình hình phòng khám, biết bệnh nhân nào cần xử lý tiếp theo, mở hồ sơ đúng người, khám bệnh, chỉ định cận lâm sàng, kê đơn và theo dõi các cập nhật liên quan đến bệnh nhân.

### 1.1. Tổng quan

- Hiển thị lời chào, khoa làm việc và ca trực hiện tại.
- Hiển thị banner cảnh báo bệnh nhân nguy cơ cao trong hàng chờ.
- Cho phép chuyển nhanh sang nhóm bệnh nhân khẩn cấp/nguy cơ cao.
- Hiển thị thống kê nhanh trong ngày:
  - Tổng lịch khám hôm nay.
  - Số bệnh nhân đang chờ.
  - Số ca đã khám xong.
- Hiển thị danh sách bệnh nhân chờ khám theo ca.
- Hiển thị bệnh nhân tiếp theo hoặc bệnh nhân đang khám.
- Hiển thị kết quả cận lâm sàng mới cần bác sĩ xem.

### 1.2. Quản lý hàng chờ khám

- Xem danh sách bệnh nhân theo khung giờ.
- Xem thông tin bệnh nhân trong từng dòng:
  - Khung giờ khám.
  - Tên bệnh nhân.
  - Tóm tắt triệu chứng.
  - Trạng thái hiện tại.
  - Hành động tương ứng.
- Lọc nhanh danh sách:
  - Tất cả bệnh nhân.
  - Bệnh nhân khẩn cấp/nguy cơ cao.
- Nhận biết bệnh nhân tiếp theo bằng highlight trong bảng.
- Gọi bệnh nhân đang chờ vào khám.
- Chuyển bệnh nhân được gọi sang trạng thái `Đang khám`.
- Tự đưa bệnh nhân đang khám trước đó về trạng thái chờ nếu gọi bệnh nhân mới.
- Với bệnh nhân đã khám, ẩn hành động gọi vào khám và chỉ cho phép xem hồ sơ.

### 1.3. Lịch khám trong ngày

- Xem danh sách lịch khám theo ngày/ca.
- Xem trạng thái từng lịch khám.
- Gọi bệnh nhân từ lịch khám.
- Mở màn khám bệnh từ lịch khám.
- Mở hồ sơ bệnh nhân liên quan đến lịch khám.

### 1.4. Khám bệnh

- Mở phiên khám của bệnh nhân đang được gọi.
- Xem thông tin bệnh nhân đang khám.
- Ghi nhận hoặc theo dõi nội dung khám.
- Hoàn tất phiên khám.
- Khi hoàn tất khám:
  - Cập nhật trạng thái lịch khám thành `Đã khám`.
  - Đưa bác sĩ về màn Tổng quan.
  - Hiển thị thông báo đã lưu vào EMR.
- Có thể kết thúc ca khám hiện tại từ card bệnh nhân đang khám.

### 1.5. Hồ sơ bệnh nhân

- Truy cập danh sách hồ sơ bệnh nhân.
- Mở chi tiết hồ sơ theo mã bệnh nhân.
- Xem thông tin hành chính:
  - Mã bệnh nhân.
  - Họ tên.
  - Tuổi, giới tính.
  - Số điện thoại, địa chỉ.
- Xem thông tin y tế:
  - Chẩn đoán.
  - Dị ứng thuốc.
  - Tiền sử bệnh.
  - Tiền sử gia đình.
  - Thuốc đang dùng.
  - Nhóm máu, chiều cao, cân nặng, BMI.
- Xem lịch sử các lần khám trước.

### 1.6. Chỉ định và kê đơn

- Truy cập module `Chỉ định & Kê đơn`.
- Phục vụ luồng bác sĩ chỉ định xét nghiệm/cận lâm sàng hoặc kê đơn trong quá trình khám.
- Gắn thao tác kê đơn và chỉ định với bệnh nhân đang được chọn.
- Hiển thị phản hồi/thông báo sau thao tác nếu có.

### 1.7. Kết quả cận lâm sàng

- Xem danh sách kết quả cận lâm sàng mới.
- Phân biệt rõ trạng thái:
  - `Mới`.
  - `Đang chờ KQ`.
  - `Đã xem`.
- Xem mô tả kết quả và thời điểm cập nhật.
- Theo dõi kết quả theo bệnh nhân cụ thể.

### 1.8. Tư vấn trực tiếp

- Truy cập module `Tư vấn trực tiếp`.
- Theo dõi yêu cầu tư vấn từ bệnh nhân.
- Xử lý các câu hỏi liên quan đến triệu chứng hoặc sau khám.
- Nhận thông báo khi có yêu cầu tư vấn mới.

### 1.9. Thông báo

- Mở dropdown thông báo từ icon chuông.
- Xem danh sách thông báo theo ngữ cảnh bác sĩ:
  - Kết quả cận lâm sàng mới.
  - Bệnh nhân nguy cơ cao đang chờ.
  - Yêu cầu tư vấn mới.
  - Hồ sơ bệnh nhân vừa cập nhật.
- Đánh dấu tất cả thông báo là đã đọc.
- Đóng dropdown khi click ra ngoài.

### 1.10. Tài khoản

- Truy cập module `Tài khoản`.
- Xem hoặc cập nhật thông tin tài khoản bác sĩ.
- Theo dõi các thông tin cá nhân/ngữ cảnh đăng nhập liên quan đến role.

## 2. Role Quản lý phòng khám

### Mục tiêu sử dụng

Quản lý dùng hệ thống để điều hành hoạt động phòng khám, theo dõi vận hành trong ngày, quản lý lịch khám, hồ sơ, nhân sự, ca trực, thông báo, báo cáo và các cấu hình cơ sở.

### 2.1. Dashboard

- Xem tình trạng vận hành tổng quan của phòng khám.
- Theo dõi phòng khám đang mở cửa hay không.
- Xem ngày hiện tại.
- Theo dõi các chỉ số vận hành chính.
- Xem phân công ca trực trong ngày.
- Theo dõi trạng thái nhân sự:
  - Đang trực.
  - Đi muộn.
  - Vắng mặt.
  - Chưa đến ca.
  - Nghỉ phép.
- Mở nhanh màn lịch trực và điều phối nhân sự.

### 2.2. Quản lý phòng khám

Module này gồm nhiều tab con:

#### Thông tin cơ sở

- Xem và quản lý thông tin phòng khám/cơ sở.
- Quản lý ngữ cảnh thương hiệu/cơ sở như Fakeeh Care Group.
- Cập nhật các thông tin hiển thị cho vận hành phòng khám.

#### Danh mục chuyên khoa

- Quản lý danh sách chuyên khoa.
- Theo dõi các chuyên khoa đang phục vụ.
- Phục vụ phân loại lịch khám, bác sĩ, ca trực và dịch vụ.

#### Dịch vụ khám

- Quản lý danh sách dịch vụ khám.
- Theo dõi dịch vụ theo chuyên khoa.
- Phục vụ cấu hình lịch khám và quy trình đặt lịch.

#### Đánh giá từ bệnh nhân

- Xem phản hồi/đánh giá của bệnh nhân.
- Xử lý các đánh giá cần phản hồi.
- Truy cập trực tiếp từ thông báo `Đánh giá cần phản hồi`.

### 2.3. Quản lý lịch khám

- Xem danh sách lịch khám.
- Xác nhận lịch khám đang chờ.
- Điều phối lịch theo khung giờ.
- Xử lý các lịch khám mới được gửi vào hệ thống.
- Truy cập trực tiếp từ thông báo `Có lịch khám chờ xác nhận`.
- Hiển thị phản hồi sau thao tác quản lý lịch nếu có.

### 2.4. Hồ sơ bệnh nhân

- Xem danh sách hồ sơ bệnh nhân.
- Mở và kiểm tra thông tin hồ sơ.
- Theo dõi các cập nhật trong hồ sơ bệnh nhân.
- Truy cập trực tiếp từ thông báo `Hồ sơ bệnh nhân vừa cập nhật`.
- Phục vụ quản lý dữ liệu bệnh nhân ở cấp phòng khám.

### 2.5. Hồ sơ nhân sự

- Quản lý danh sách nhân sự phòng khám.
- Theo dõi thông tin nhân sự theo vai trò:
  - Bác sĩ.
  - Điều dưỡng.
  - Kỹ thuật viên.
  - Lễ tân.
- Theo dõi chuyên khoa/phòng ban liên quan.
- Phục vụ điều phối ca trực và kiểm soát vận hành.

### 2.6. Lịch trực và điều phối

- Xem danh sách phân công ca trực.
- Lọc nhân sự theo vai trò:
  - Tất cả vai trò.
  - Bác sĩ.
  - Điều dưỡng.
  - Kỹ thuật viên.
  - Lễ tân.
- Theo dõi thông tin từng ca:
  - Tên nhân sự.
  - Vai trò.
  - Chuyên khoa.
  - Ca trực.
  - Phòng/khu vực làm việc.
  - Trạng thái đi làm.
- Xử lý tình huống thiếu nhân sự theo ca.
- Truy cập trực tiếp từ thông báo `Thiếu bác sĩ ca chiều`.

### 2.7. Thông báo và nhắc lịch

- Quản lý thông báo gửi tới bệnh nhân hoặc nhân sự.
- Theo dõi thông báo gửi thất bại.
- Xử lý các nhắc lịch khám.
- Truy cập trực tiếp từ thông báo `Có thông báo gửi thất bại`.
- Hiển thị phản hồi sau khi thao tác với thông báo/nhắc lịch.

### 2.8. Báo cáo và thống kê

- Xem báo cáo hoạt động phòng khám.
- Theo dõi dữ liệu thống kê phục vụ quản lý.
- Mở báo cáo đã sẵn sàng từ thông báo.
- Phục vụ đánh giá hiệu suất vận hành, lịch khám và doanh thu.

### 2.9. Thông báo quản lý

- Mở dropdown thông báo từ icon chuông.
- Xem các thông báo theo ngữ cảnh quản lý:
  - Lịch khám chờ xác nhận.
  - Thiếu nhân sự trong ca.
  - Đánh giá bệnh nhân cần phản hồi.
  - Hồ sơ bệnh nhân cập nhật.
  - Thông báo gửi thất bại.
  - Báo cáo đã sẵn sàng.
- Click vào từng thông báo để điều hướng đến module tương ứng.
- Đánh dấu tất cả là đã đọc.
- Đóng dropdown khi click ra ngoài.

### 2.10. Tài khoản và bảo mật

- Truy cập module `Tài khoản`.
- Quản lý thông tin tài khoản quản lý.
- Quản lý các thiết lập bảo mật tài khoản.
- Đăng xuất khỏi hệ thống qua nút đăng xuất.
- Xác nhận trước khi đăng xuất để tránh thao tác nhầm.

## 3. So sánh nhanh phạm vi 2 role

| Nhóm chức năng | Bác sĩ | Quản lý |
|---|---|---|
| Tổng quan vận hành | Theo dõi ca khám cá nhân, hàng chờ, bệnh nhân tiếp theo | Theo dõi vận hành toàn phòng khám |
| Lịch khám | Xem lịch trong ngày và gọi bệnh nhân | Quản lý/xác nhận/điều phối lịch khám |
| Hồ sơ bệnh nhân | Xem hồ sơ để phục vụ khám và điều trị | Quản lý dữ liệu hồ sơ ở cấp phòng khám |
| Khám bệnh | Có luồng khám, hoàn tất khám, kê đơn/chỉ định | Không trực tiếp khám bệnh |
| Nhân sự | Không quản lý nhân sự | Quản lý hồ sơ nhân sự, lịch trực, điều phối |
| Cận lâm sàng | Theo dõi kết quả phục vụ chẩn đoán | Theo dõi gián tiếp qua vận hành/hồ sơ |
| Thông báo | Thông báo y khoa theo bệnh nhân/ca khám | Thông báo vận hành/phòng khám |
| Báo cáo | Không phải trọng tâm role | Có báo cáo và thống kê quản lý |

