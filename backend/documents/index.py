import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
from typing import Dict, Any, List, Optional

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для работы с документами и проектами
    Поддерживает GET (список), POST (создание), PUT (обновление), DELETE (удаление)
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            action = params.get('action', 'documents')
            
            if action == 'projects':
                cur.execute('''
                    SELECT p.*, 
                           COUNT(d.id) as document_count
                    FROM projects p
                    LEFT JOIN documents d ON p.id = d.project_id
                    GROUP BY p.id
                    ORDER BY p.created_at DESC
                ''')
                projects = cur.fetchall()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([dict(p) for p in projects], default=str),
                    'isBase64Encoded': False
                }
            
            else:
                status = params.get('status')
                project_id = params.get('project_id')
                
                query = '''
                    SELECT d.*, 
                           p.name as project_name
                    FROM documents d
                    LEFT JOIN projects p ON d.project_id = p.id
                    WHERE 1=1
                '''
                
                if status:
                    query += f" AND d.status = '{status}'"
                if project_id:
                    query += f" AND d.project_id = {project_id}"
                
                query += ' ORDER BY d.created_at DESC'
                
                cur.execute(query)
                documents = cur.fetchall()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([dict(d) for d in documents], default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', 'create_document')
            
            if action == 'create_project':
                cur.execute('''
                    INSERT INTO projects (name, description, status)
                    VALUES (%s, %s, %s)
                    RETURNING *
                ''', (body['name'], body.get('description', ''), body.get('status', 'active')))
                project = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps(dict(project), default=str),
                    'isBase64Encoded': False
                }
            
            else:
                cur.execute('''
                    INSERT INTO documents (
                        title, description, project_id, status, tags,
                        date_signed, date_payment, date_deadline, date_expiry, pdf_url
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING *
                ''', (
                    body['title'],
                    body.get('description', ''),
                    body.get('project_id'),
                    body.get('status', 'pending'),
                    body.get('tags', []),
                    body.get('date_signed'),
                    body.get('date_payment'),
                    body.get('date_deadline'),
                    body.get('date_expiry'),
                    body.get('pdf_url')
                ))
                document = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps(dict(document), default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            doc_id = body.get('id')
            
            if not doc_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Document ID required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                UPDATE documents
                SET title = %s,
                    description = %s,
                    project_id = %s,
                    status = %s,
                    tags = %s,
                    date_signed = %s,
                    date_payment = %s,
                    date_deadline = %s,
                    date_expiry = %s,
                    pdf_url = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *
            ''', (
                body.get('title'),
                body.get('description'),
                body.get('project_id'),
                body.get('status'),
                body.get('tags'),
                body.get('date_signed'),
                body.get('date_payment'),
                body.get('date_deadline'),
                body.get('date_expiry'),
                body.get('pdf_url'),
                doc_id
            ))
            document = cur.fetchone()
            conn.commit()
            
            if not document:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Document not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(dict(document), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            doc_id = params.get('id')
            
            if not doc_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Document ID required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('DELETE FROM documents WHERE id = %s RETURNING id', (doc_id,))
            deleted = cur.fetchone()
            conn.commit()
            
            if not deleted:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Document not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'id': deleted['id']}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()