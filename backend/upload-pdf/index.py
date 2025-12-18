import json
import boto3
import base64
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Загрузка PDF файлов документов в облачное хранилище
    Args: event - запрос с base64-encoded PDF файлом
          context - контекст выполнения функции
    Returns: URL загруженного файла
    '''
    method: str = event.get('httpMethod', 'POST')
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    # Parse request
    body_data = json.loads(event.get('body', '{}'))
    file_base64: str = body_data.get('file', '')
    filename: str = body_data.get('filename', 'document.pdf')
    
    if not file_base64:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'No file provided'}),
            'isBase64Encoded': False
        }
    
    # Decode base64
    file_data = base64.b64decode(file_base64)
    
    # Upload to S3
    s3 = boto3.client('s3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )
    
    # Generate unique key
    import time
    key = f"documents/{int(time.time())}_{filename}"
    
    s3.put_object(
        Bucket='files',
        Key=key,
        Body=file_data,
        ContentType='application/pdf'
    )
    
    # Generate CDN URL
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'url': cdn_url}),
        'isBase64Encoded': False
    }
