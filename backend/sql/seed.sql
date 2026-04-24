-- Run after schema.sql
-- Default admin password: Admin@123
INSERT INTO users (name, email, password_hash, address, role)
VALUES (
  'Default System Administrator User',
  'admin@store-ratings.com',
  '$2b$10$67zimOYjXXTJRUbRzuNJpemaZh9dKOR6VdKhcOIzj8zY3A.6lpsIS',
  'Head Office, Main Street, City',
  'ADMIN'
)
ON CONFLICT (email) DO NOTHING;
