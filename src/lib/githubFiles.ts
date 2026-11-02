import { usePersistentState, isDataWiped, store } from './storage';

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

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  folder: string;
}

export interface GitHubConfigState {
  configured: boolean;
  config: GitHubConfig | null;
  error: string | null;
}

const GITHUB_CONFIG_KEY = 'githubConfig';
const GITHUB_FILES_KEY = 'githubFiles';

export function getGitHubConfig(): GitHubConfig | null {
  try {
    const raw = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GitHubConfig;
  } catch {
    return null;
  }
}

export function saveGitHubConfig(config: GitHubConfig) {
  localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
}

export function clearGitHubConfig() {
  localStorage.removeItem(GITHUB_CONFIG_KEY);
}

export function isGitHubConfigured(): boolean {
  return getGitHubConfig() !== null;
}

/**
 * Get GitHub API headers with auth
 */
function getAuthHeaders(token: string): HeadersInit {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

/**
 * List all files in the GitHub folder
 */
export async function listGitHubFiles(): Promise<GitHubFile[]> {
  const config = getGitHubConfig();
  if (!config) return [];

  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.folder}?ref=${config.branch}`,
      {
        headers: getAuthHeaders(config.token),
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error('Invalid GitHub token');
      if (response.status === 404) throw new Error('Repository or folder not found');
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data: Array<{
      name: string;
      path: string;
      size: number;
      type: string;
      url: string;
      download_url: string | null;
      html_url: string;
      sha: string;
    }> = await response.json();

    return data
      .filter((item) => item.type === 'file')
      .map((item) => ({
        id: item.sha,
        name: item.name,
        path: item.path,
        size: item.size,
        type: item.type,
        url: item.url,
        download_url: item.download_url!,
        html_url: item.html_url,
        uploaded_at: new Date().toISOString(),
        sha: item.sha,
      }))
      .sort((a, b) => (a.name < b.name ? -1 : 1));
  } catch (error) {
    console.error('GitHub list error:', error);
    return [];
  }
}

/**
 * Upload a file to GitHub
 */
export async function uploadGitHubFile(
  file: File,
  onProgress?: (loaded: number, total: number) => void
): Promise<{ ok: true; file: GitHubFile } | { ok: false; error: string }> {
  const config = getGitHubConfig();
  if (!config) {
    return { ok: false, error: 'GitHub not configured. Please add your GitHub token in Settings.' };
  }

  if (!file) {
    return { ok: false, error: 'No file provided' };
  }

  // Read file as base64
  const fileContent = await readFileAsBase64(file);
  const content = fileContent.split(',')[1]; // Remove data URL prefix

  const path = `${config.folder}/${file.name}`;
  const message = `Add ${file.name}`;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(config.token),
        body: JSON.stringify({
          message,
          content,
          branch: config.branch,
        }),
      }
    );

    if (response.status === 409) {
      // File already exists, we need to get SHA and update
      const existingResponse = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`,
        {
          headers: getAuthHeaders(config.token),
        }
      );

      if (!existingResponse.ok) {
        return { ok: false, error: 'File already exists and could not be updated' };
      }

      const existingData: { sha: string } = await existingResponse.json();

      const updateResponse = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(config.token),
          body: JSON.stringify({
            message: `Update ${file.name}`,
            content,
            sha: existingData.sha,
            branch: config.branch,
          }),
        }
      );

      if (!updateResponse.ok) {
        return { ok: false, error: `Failed to update file: ${updateResponse.status}` };
      }

      const result = await updateResponse.json();
      return {
        ok: true,
        file: {
          id: result.content.sha,
          name: result.content.name,
          path: result.content.path,
          size: file.size,
          type: file.type,
          url: result.content.url,
          download_url: result.content.download_url,
          html_url: result.content.html_url,
          uploaded_at: new Date().toISOString(),
          sha: result.content.sha,
        },
      };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { ok: false, error: errorData.message || `Upload failed: ${response.status}` };
    }

    const result = await response.json();
    return {
      ok: true,
      file: {
        id: result.content.sha,
        name: result.content.name,
        path: result.content.path,
        size: file.size,
        type: file.type,
        url: result.content.url,
        download_url: result.content.download_url,
        html_url: result.content.html_url,
        uploaded_at: new Date().toISOString(),
        sha: result.content.sha,
      },
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

/**
 * Delete a file from GitHub
 */
export async function deleteGitHubFile(fileId: string, filePath: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const config = getGitHubConfig();
  if (!config) {
    return { ok: false, error: 'GitHub not configured' };
  }

  // First get the current SHA of the file
  try {
    const existingResponse = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`,
      {
        headers: getAuthHeaders(config.token),
      }
    );

    if (!existingResponse.ok) {
      return { ok: false, error: 'File not found on GitHub' };
    }

    const existingData: { sha: string } = await existingResponse.json();

    const deleteResponse = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(config.token),
        body: JSON.stringify({
          message: `Delete ${filePath}`,
          sha: existingData.sha,
          branch: config.branch,
        }),
      }
    );

    if (!deleteResponse.ok) {
      return { ok: false, error: `Delete failed: ${deleteResponse.status}` };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Delete failed' };
  }
}

/**
 * Read file as base64 data URL
 */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Get file type category
 */
export function getFileCategory(fileName: string): 'pdf' | 'image' | 'document' | 'other' {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
  if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) return 'document';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'document';
  if (['ppt', 'pptx'].includes(ext)) return 'document';
  return 'other';
}

/**
 * Get file icon
 */
export function getFileIcon(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  if (ext === 'pdf') return 'FileText';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'Image';
  if (['doc', 'docx', 'txt'].includes(ext)) return 'FileText';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'FileText';
  if (['ppt', 'pptx'].includes(ext)) return 'FileText';
  return 'File';
}

/**
 * Get display size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Check if a file can be previewed inline
 */
export function canPreview(fileName: string): boolean {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'txt', 'md', 'html'].includes(ext);
}

/**
 * Get a download URL for a file
 */
export function getFileDownloadUrl(file: GitHubFile): string {
  return file.download_url;
}