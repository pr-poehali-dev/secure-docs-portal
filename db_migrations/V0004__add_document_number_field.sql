-- Добавление поля document_number в таблицу documents
ALTER TABLE t_p90981422_secure_docs_portal.documents 
ADD COLUMN document_number VARCHAR(100) NULL;