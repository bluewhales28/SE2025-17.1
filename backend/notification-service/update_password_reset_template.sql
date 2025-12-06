-- Update password reset template with styled HTML
UPDATE templates 
SET body_html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .header {
            background-color: #dc3545;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: white;
            padding: 20px;
            border-radius: 0 0 5px 5px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #dc3545;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 20px;
            padding: 10px;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Yêu cầu Đặt lại Mật khẩu</h1>
        </div>
        <div class="content">
            <p>Xin chào <strong>{{.user_name}}</strong>,</p>
            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn. Nếu đây không phải là bạn, vui lòng bỏ qua email này.</p>
            <p>Để đặt lại mật khẩu của bạn, vui lòng nhấp vào liên kết bên dưới. Liên kết này sẽ hết hạn trong <strong>1 giờ</strong>:</p>
            <center>
                <a href="{{.reset_url}}" class="button">Đặt Lại Mật Khẩu</a>
            </center>
            <p>Hoặc sao chép và dán URL này vào trình duyệt của bạn:</p>
            <p style="background-color: #f0f0f0; padding: 10px; word-break: break-all;">{{.reset_url}}</p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng không nhấp vào liên kết trên và <strong>không chia sẻ email này với bất kỳ ai</strong>.</p>
            <p>Với trân trọng,<br>Đội ngũ Quiz Platform</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Quiz Platform. Tất cả quyền được bảo lưu.</p>
        </div>
    </div>
</body>
</html>'
WHERE name = 'password_reset';
