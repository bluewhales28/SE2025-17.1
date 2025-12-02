INSERT INTO templates (name, subject, body_html, body_text, channel, created_at, updated_at) 
VALUES (
    'user_registered', 
    'Welcome to Quiz App', 
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1>Welcome to Quiz App</h1><p>Hello {{index .Metadata "user_name"}},</p><p>Thank you for joining our community. We are excited to have you with us.</p><p>Best regards,<br>The Quiz App Team</p></div>', 
    'Welcome to Quiz App. Thank you for joining our community.', 
    'email', 
    NOW(), 
    NOW()
);
