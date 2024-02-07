-- Import data into auth.users table
INSERT INTO auth.users(instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, confirmed_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at) VALUES
('00000000-0000-0000-0000-000000000000', '733efbe3-0c9f-4a15-b234-92dce5918ba6', 'authenticated', 'authenticated', 'test@test.com', '$2a$10$TdYPwO5uAKFQ6QYlOoI2OeIW00nIbCUOo/yzWfkjUSsfo9NOD2.Xq', '2024-01-29 15:38:41.565454+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-01-30 16:26:02.860651+00', '{"provider":"email","providers":["email"]}', '{}', NULL, '2024-01-29 15:38:41.559604+00', '2024-01-30 16:26:02.861824+00', NULL, NULL, NULL, NULL, NULL, '2024-01-29 15:38:41.565454+00', NULL, 0, NULL, NULL, NULL, NULL, 'false', NULL);

-- Import data into projects table
INSERT INTO projects(id, created_at, title, updated_at, "userId", description, emoji, "sortingOrder") VALUES
('8bdf0255-7f95-4f72-abbd-85596b57fe83', '2024-01-29 15:50:48.661687', 'test', '2024-01-29 15:50:48.661687', '733efbe3-0c9f-4a15-b234-92dce5918ba6', NULL, NULL, NULL);

-- Import data into documents table
INSERT INTO documents(created_at, text, type, "userId", title, id, "projectId", updated_at) VALUES
('2024-01-29 15:50:48.753251', '{...}', 'text_document', '733efbe3-0c9f-4a15-b234-92dce5918ba6', 'Main Document', '66f6df91-6ef0-4e0f-a049-4ff169f787fd', '8bdf0255-7f95-4f72-abbd-85596b57fe83', '2024-01-29 15:50:48.753251');

-- Import data into notes table
INSERT INTO notes(id, "projectId", text, created_at, updated_at) VALUES
('60a1907a-331a-43ae-bc62-a08a5410be6f', '8bdf0255-7f95-4f72-abbd-85596b57fe83', '{...}', '2024-01-30 16:13:08.336926', '2024-01-30 16:13:08.336926');
