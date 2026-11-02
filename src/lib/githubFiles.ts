import { readValue, writeValue, removeValue } from './storage';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  folder: string;
}

export interface GitHubFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  url: string;
  download_url: string;
  html_url: string;
  uploaded_at: string;
  sha: string;
}

const GH_CONFIG_KEY = 'githubConfig';
const GITHUB_API = 'https://api.github.com';

export function getGitHubConfig(): GitHubConfig | null {
  try {
    const raw = localStorage.getItem(GH_CONFIG_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GitHubConfig;
  } catch {
    return null;
  }
}

export function saveGitHubConfig(config: GitHubConfig) {
  localStorage.setItem(GH_CONFIG_KEY, JSON.stringify(config));
}

export function clearGitHubConfig() {
  localStorage.removeItem(GH_CONFIG_KEY);
}

export function isGitHubConfigured(): boolean {
  return getGitHubConfig() !== null;
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
  };
}

export async function listGitHubFiles(): Promise<GitHubFile[]> {
  const cfg = getGitHubConfig();
  if (!cfg) return [];

  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.folder}?ref=${cfg.branch}`,
      { headers: headers(cfg.token) }
    );
    if (!responseOk(res)) {
      if (res.status === 404) return []; // folder doesn't exist yet
      throw new Error(`GitHub API: ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data
      .filter((f: any) => f.type === 'file')
      .map((f: any) => ({
        id: f.sha,
        name: f.name,
        path: f.path,
        size: f.size || 0,
        type: f.type,
        url: f.html_url,
        download_url: f.download_url || f.url,
        html_url: f.html_url,
        uploaded_at: new Date().toISOString(),
        sha: f.sha,
      }));
  } catch (e) {
    console.error('GitHub list error:', e);
    return [];
  }
}

export async function uploadGitHubFile(file: File): Promise<{ ok: true; file: GitHubFile } | { ok: false; error: string }> {
  const cfg = getGitHubConfig();
  if (!cfg) return { ok: false, error: 'GitHub not configured. Go to Settings → Cloud Storage.' };
  if (!file) return { ok: false, error: 'No file provided' };

  const path = `${cfg.folder}/${file.name}`;
  const content = await readFileAsBase64(file);
  const b64 = content.split(',')[1];

  try {
    // Check if file exists to get SHA for update
    const existing = await fetch(
      `${GITHUB_API}/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${cfg.branch}`,
      { headers: headers(cfg.token) }
    );

    const body: any = {
      message: `Add ${file.name}`,
      content: b64,
      branch: cfg.branch,
    };

    if (existingResponse.ok) {
      const existing = await existingResponse.json();
      body.sha = existing.sha;
      body.message = `Update ${file.name}`;
    }

    const res = await fetch(
      `${GITHUB_API}/repos/${cfg.owner}/${cfg.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(cfg.token),
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.message || `Upload failed: ${res.status}` };
    }

    const data = await res.json();
    return {
      ok: true,
      file: {
        id: data.content.sha,
        name: data.content.name,
        path: data.content.path,
        size: file.size,
        type: file.type,
        url: data.content.html_url,
        download_url: data.content.download_url,
        html_url: data.content.html_url,
        uploaded_at: new Date().toISOString(),
        sha: data.content.sha,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Upload failed' };
  }
}

export async function deleteGitHubFile(path: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const cfg = getGitHubConfig();
  if (!cfg) return { ok: false, error: 'GitHub not configured' };

  try {
    const existing = await fetch(
      `${GITHUB_API}/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${cfg.branch}`,
      { headers: headers(cfg.token) }
    );
    if (!existing.ok) return { ok: false, error: 'File not found on GitHub' };
    const existingData: { sha: string } = await existing.json();

    const res = await fetch(
      `${GITHUB_API}/repos/${cfg.owner}/${cfg.repo}/contents/${path}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(cfg.token),
        body: JSON.stringify({
          message: `Delete ${path}`,
          sha: existingData.sha,
          branch: cfg.branch,
        }),
      }
    );
    if (!res.ok) return { ok: false, error: `Delete failed: ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Delete failed' };
  }
}

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

function responseOk(res: Response): boolean {
  return res.ok;
}

function getAuthHeaders(token: string): HeadersInit {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
  };
}

export function getFileIcon(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  if (ext === 'pdf') return 'FileText';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'Image';
  if (['doc', 'docx', 'txt'].includes(ext)) return 'FileText';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'FileText';
  if (['ppt', 'pptx'].includes(ext)) return 'FileText';
  return 'File';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function canPreview(fileName: string): boolean {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'txt', 'md', 'html'].includes(ext);
}

export function getFileDownloadUrl(file: GitHubFile): string {
  return file.download_url;
}