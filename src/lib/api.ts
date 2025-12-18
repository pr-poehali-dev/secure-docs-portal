const API_URL = 'https://functions.poehali.dev/1019d584-2779-4f3c-b2f7-2e4e5becd755';

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  document_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  title: string;
  description: string;
  project_id: number | null;
  project_name?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'active' | 'archived';
  tags: string[];
  date_created: string;
  date_signed: string | null;
  date_payment: string | null;
  date_deadline: string | null;
  date_expiry: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentData {
  title: string;
  description: string;
  project_id?: number;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'active' | 'archived';
  tags?: string[];
  date_signed?: string;
  date_payment?: string;
  date_deadline?: string;
  date_expiry?: string;
}

export interface UpdateDocumentData extends CreateDocumentData {
  id: number;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: string;
}

export const api = {
  async getDocuments(filters?: { status?: string; project_id?: number }): Promise<Document[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.project_id) params.append('project_id', filters.project_id.toString());
    
    const url = params.toString() ? `${API_URL}?${params}` : API_URL;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  },

  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_URL}?action=projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  async createDocument(data: CreateDocumentData): Promise<Document> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_document', ...data }),
    });
    if (!response.ok) throw new Error('Failed to create document');
    return response.json();
  },

  async updateDocument(data: UpdateDocumentData): Promise<Document> {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update document');
    return response.json();
  },

  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_project', ...data }),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },
};
