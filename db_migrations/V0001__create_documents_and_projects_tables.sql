CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_id INTEGER REFERENCES projects(id),
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    tags TEXT[],
    
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_signed DATE,
    date_payment DATE,
    date_deadline DATE,
    date_expiry DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_priority ON documents(priority);
CREATE INDEX IF NOT EXISTS idx_documents_date_deadline ON documents(date_deadline);

INSERT INTO projects (name, description, status) VALUES
('Редизайн корпоративного сайта', 'Обновление дизайна и структуры основного сайта компании', 'active'),
('Внедрение CRM системы', 'Интеграция новой CRM для улучшения работы с клиентами', 'active'),
('Маркетинговая кампания Q1 2025', 'Запуск новой маркетинговой кампании на первый квартал', 'planning');

INSERT INTO documents (title, description, project_id, priority, status, tags, date_signed, date_payment, date_deadline, date_expiry) VALUES
('Договор на разработку дизайна', 'Договор с дизайн-студией на создание нового дизайна сайта', 1, 'high', 'active', ARRAY['договор', 'дизайн', 'срочно'], '2024-12-01', '2024-12-15', '2025-01-15', '2025-12-01'),
('Техническое задание на сайт', 'Подробное ТЗ для разработчиков с требованиями и сроками', 1, 'high', 'active', ARRAY['тз', 'разработка'], NULL, NULL, '2024-12-20', NULL),
('Договор поставки CRM', 'Контракт с поставщиком CRM системы', 2, 'medium', 'active', ARRAY['договор', 'crm'], '2024-11-15', '2024-12-01', '2025-02-01', '2026-11-15'),
('Медиаплан на Q1 2025', 'План размещения рекламы в различных каналах', 3, 'low', 'pending', ARRAY['маркетинг', 'реклама'], NULL, NULL, '2025-01-05', NULL),
('Лицензионное соглашение ПО', 'Продление лицензий на корпоративное ПО', NULL, 'medium', 'archived', ARRAY['лицензия', 'по'], '2023-12-01', '2023-12-15', '2024-12-01', '2024-12-01');