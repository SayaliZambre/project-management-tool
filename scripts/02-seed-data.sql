-- Insert sample users (passwords are hashed for 'password123')
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@example.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQq', 'Admin User', 'Admin'),
('manager@example.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQq', 'Manager User', 'Manager'),
('dev1@example.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQq', 'Developer One', 'Developer'),
('dev2@example.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQq', 'Developer Two', 'Developer')
ON CONFLICT (email) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (name, description, status, start_date, end_date, created_by) VALUES
('E-commerce Platform', 'Build a modern e-commerce platform with React and Node.js', 'Active', '2024-01-01', '2024-06-30', 1),
('Mobile App Development', 'Create a cross-platform mobile app using React Native', 'Active', '2024-02-01', '2024-08-31', 2),
('Data Analytics Dashboard', 'Develop a comprehensive analytics dashboard', 'On Hold', '2024-03-01', '2024-09-30', 1)
ON CONFLICT DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (title, description, status, priority, project_id, assigned_to, created_by, due_date) VALUES
('Setup project structure', 'Initialize the project with proper folder structure and dependencies', 'Done', 'High', 1, 3, 1, '2024-01-15'),
('Design user authentication', 'Create login/signup forms and authentication flow', 'In Progress', 'High', 1, 3, 1, '2024-01-30'),
('Implement product catalog', 'Build product listing and detail pages', 'To Do', 'Medium', 1, 4, 1, '2024-02-15'),
('Setup React Native project', 'Initialize mobile app project structure', 'Done', 'High', 2, 4, 2, '2024-02-10'),
('Design app wireframes', 'Create wireframes for all app screens', 'In Progress', 'Medium', 2, 3, 2, '2024-02-25')
ON CONFLICT DO NOTHING;

-- Insert project members
INSERT INTO project_members (project_id, user_id, role) VALUES
(1, 1, 'Owner'),
(1, 3, 'Member'),
(1, 4, 'Member'),
(2, 2, 'Owner'),
(2, 3, 'Member'),
(2, 4, 'Member'),
(3, 1, 'Owner')
ON CONFLICT (project_id, user_id) DO NOTHING;
