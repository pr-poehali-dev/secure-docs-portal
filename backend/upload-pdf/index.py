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
    
    # Upload to Reg.ru S3
    s3 = boto3.client('s3',
        endpoint_url=os.environ['REGRU_S3_ENDPOINT'],
        aws_access_key_id=os.environ['REGRU_S3_ACCESS_KEY'],
        aws_secret_access_key=os.environ['REGRU_S3_SECRET_KEY']
    )
    
    bucket_name = os.environ['REGRU_S3_BUCKET']
    
    # Generate unique key
    import time
    key = f"documents/{int(time.time())}_{filename}"
    
    s3.put_object(
        Bucket=bucket_name,
        Key=key,
        Body=file_data,
        ContentType='application/pdf',
        ACL='public-read'
    )
    
    # Generate public URL (Reg.ru format)
    file_url = f"{os.environ['REGRU_S3_ENDPOINT']}/{bucket_name}/{key}"
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'url': file_url}),
        'isBase64Encoded': False
    }