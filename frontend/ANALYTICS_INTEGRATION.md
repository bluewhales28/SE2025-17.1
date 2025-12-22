# Tích Hợp Analytics-Statistic Service vào Frontend

## ✅ Đã Hoàn Thành

### 1. Services & Store
- ✅ `src/services/analytics.service.ts` - API client cho analytics endpoints
- ✅ `src/store/useAnalyticsStore.ts` - Zustand store quản lý state

### 2. Components
- ✅ `src/components/analytics/ScoreHistogram.tsx` - Biểu đồ histogram điểm số
- ✅ `src/components/analytics/TopicPerformanceChart.tsx` - Biểu đồ hiệu suất theo chủ đề
- ✅ `src/components/analytics/ProgressTrendChart.tsx` - Biểu đồ xu hướng tiến bộ
- ✅ `src/components/analytics/StatCard.tsx` - Card hiển thị thống kê
- ✅ `src/components/common/Sidebar.tsx` - Sidebar navigation với link Analytics

### 3. Pages
- ✅ `src/app/analytics/page.tsx` - Trang chủ Analytics với menu các loại báo cáo
- ✅ `src/app/analytics/quiz/[id]/page.tsx` - Báo cáo chi tiết quiz
- ✅ `src/app/analytics/student/[id]/page.tsx` - Báo cáo học sinh
- ✅ `src/app/analytics/class/[id]/page.tsx` - Báo cáo lớp học
- ✅ `src/app/analytics/question/[id]/page.tsx` - Phân tích câu hỏi

### 4. Features
- ✅ Xem báo cáo quiz với histogram, percentiles, topic performance
- ✅ Xem báo cáo học sinh với weak topics, progress trend
- ✅ Xem báo cáo lớp học với top students table
- ✅ Phân tích câu hỏi với difficulty và quality assessment
- ✅ Export PDF và CSV từ các trang báo cáo
- ✅ Tích hợp vào navigation sidebar

## 📦 Dependencies Đã Thêm

```json
{
  "recharts": "^latest"
}
```

## 🎯 Cách Sử Dụng

### 1. Truy cập Analytics
- Vào sidebar → Click "Analytics & Reports"
- Hoặc truy cập trực tiếp: `/analytics`

### 2. Xem Báo Cáo Quiz
```
/analytics/quiz/[quiz_id]
```
Hiển thị:
- Stats cards (attempts, avg score, max/min, std dev)
- Percentiles (P25, P50, P75, P90)
- Histogram phân bố điểm số
- Topic performance chart
- Difficulty performance chart

### 3. Xem Báo Cáo Học Sinh
```
/analytics/student/[student_id]
```
Hiển thị:
- Stats cards (completed quizzes, avg score, completion rate)
- Weak topics (cần cải thiện)
- Progress trend chart
- Topic performance chart

### 4. Xem Báo Cáo Lớp Học
```
/analytics/class/[class_id]
```
Hiển thị:
- Stats cards (total students, avg score, completion rate)
- Top students table với ranking
- Topic performance chart

### 5. Phân Tích Câu Hỏi
```
/analytics/question/[question_id]
```
Hiển thị:
- Stats cards (total attempts, correct rate, difficulty, discrimination)
- Difficulty assessment
- Quality assessment
- Recommendations

### 6. Export Reports
- Click nút "PDF" hoặc "CSV" trên bất kỳ trang báo cáo nào
- File sẽ tự động download

## 🔗 API Endpoints Sử Dụng

- `GET /api/v1/report/quiz/{id}` - Quiz report
- `GET /api/v1/report/student/{id}` - Student report
- `GET /api/v1/report/class/{id}` - Class report
- `GET /api/v1/report/question/{id}` - Question analysis
- `GET /api/v1/report/compare/{student_id}?class_id={id}` - Cross comparison
- `GET /api/v1/report/export/csv?quiz_id=&class_id=&user_id=&start_date=&end_date=` - Export CSV
- `GET /api/v1/report/export/pdf?quiz_id=&class_id=&report_type=` - Export PDF

## 🎨 UI Components

### Charts
- **Recharts** được sử dụng cho tất cả biểu đồ
- Responsive và interactive
- Tooltips và legends

### Stat Cards
- Hiển thị metrics quan trọng
- Icons từ lucide-react
- Trend indicators (nếu có)

### Tables
- Top students table với ranking
- Avatar và badges
- Responsive design

## 🔐 Authentication

Tất cả requests đều tự động include JWT token từ:
- `localStorage.getItem("accessToken")`
- Hoặc cookies

## 📝 Notes

1. **Error Handling**: Tất cả errors được hiển thị qua toast notifications
2. **Loading States**: Loading spinners khi fetch data
3. **Empty States**: Hiển thị message khi không có data
4. **Responsive**: Tất cả pages đều responsive trên mobile

## 🚀 Next Steps (Optional)

1. Thêm filters cho reports (date range, etc.)
2. Thêm comparison view (so sánh nhiều quizzes/students)
3. Thêm real-time updates
4. Thêm notifications khi có alerts
5. Thêm certificate generation UI

