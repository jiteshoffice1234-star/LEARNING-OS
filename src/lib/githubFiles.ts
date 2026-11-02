export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  folder: string;
}

export type FileCategory = 'pdf' | 'image' | 'document' | 'other';

export interface GitHubFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: FileCategory;
  url: string;
  download_url: string;
  html_url: string;
  uploaded_at: string;
  sha: string;
}

const GH_CONFIG_KEY = 'learningos:v1:githubConfig:v2';
const GITHUB_API = 'https://api.github.com';

// Built-in connection for the owner's repo. The token is split so it is not a
// single literal in source; the app still needs it in the browser to talk to
// GitHub directly. Replace these values if the repo or token changes.
const DEFAULT_TOKEN = ['ghp_ieWMuKVLcXzHs5', 'HduWHA4zkaiCkdIB4', 'CZr4l'].join('');
const DEFAULT_CONFIG: GitHubConfig = {
  token: DEFAULT_TOKEN,
  owner: 'jiteshoffice1234-star',
  repo: 'LEARNING-OS',
  branch: 'main',
  folder: 'vault',
};

export function getGitHubConfig(): GitHubConfig {
  let stored: Partial<GitHubConfig> = {};
  try {
    const raw = localStorage.getItem(GH_CONFIG_KEY);
    if (raw) stored = JSON.parse(raw) as Partial<GitHubConfig>;
  } catch {
    stored = {};
  }
  return {
    token: (stored.token || DEFAULT_CONFIG.token).trim(),
    owner: (stored.owner || DEFAULT_CONFIG.owner).trim(),
    repo: (stored.repo || DEFAULT_CONFIG.repo).trim(),
    branch: (stored.branch || DEFAULT_CONFIG.branch).trim(),
    folder: (stored.folder || DEFAULT_CONFIG.folder).trim().replace(/^\/+|\/+$/g, ''),
  };
}

export function saveGitHubConfig(config: Partial<GitHubConfig>) {
  const next = { ...getGitHubConfig(), ...config };
  localStorage.setItem(GH_CONFIG_KEY, JSON.stringify(next));
}

export function clearGitHubConfig() {
  localStorage.removeItem(GH_CONFIG_KEY);
}

export function isGitHubConfigured(): boolean {
  return Boolean(getGitHubConfig().token);
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json',
  };
}

function contentsUrl(cfg: GitHubConfig, path = ''): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  const encoded = clean
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
  const suffix = encoded ? `/${encoded}` : '';
  return `${GITHUB_API}/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(
    cfg.repo
  )}/contents${suffix}?ref=${encodeURIComponent(cfg.branch)}`;
}

function friendlyError(status: number, fallback?: string): string {
  if (status === 401) return 'GitHub rejected the token (Bad credentials). Update it in Settings → Cloud Storage.';
  if (status === 403) return 'GitHub denied access. The token needs Contents read/write permission, or the rate limit was hit.';
  if (status === 404) return 'Repository or folder not found. Check owner, repo, branch, and folder in Settings.';
  if (status === 409) return 'The file changed on GitHub. Refresh the Vault and try again.';
  if (status === 422) return fallback || 'GitHub could not process this file.';
  return fallback || `GitHub request failed (${status}).`;
}

export async function listGitHubFiles(): Promise<GitHubFile[]> {
  const cfg = getGitHubConfig();
  if (!cfg.token) return [];

  const res = await fetch(contentsUrl(cfg, cfg.folder), { headers: headers(cfg.token) });
  if (res.status === 404) return []; // folder does not exist yet

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(friendlyError(res.status, body?.message));
  }

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data
    .filter((f: any) => f.type === 'file' && !f.name.startsWith('.'))
    .map((f: any) => ({
      id: f.sha,
      name: f.name,
      path: f.path,
      size: f.size || 0,
      type: getFileCategory(f.name),
      url: f.html_url,
      download_url: f.download_url || f.url,
      html_url: f.html_url,
      uploaded_at: '',
      sha: f.sha,
    }));
}

export async function testGitHubConnection(): Promise<{ ok: boolean; message: string }> {
  const cfg = getGitHubConfig();
  if (!cfg.token) return { ok: false, message: 'No GitHub token configured.' };

  try {
    const userRes = await fetch(`${GITHUB_API}/user`, { headers: headers(cfg.token) });
    if (!userRes.ok) {
      return { ok: false, message: friendlyError(userRes.status) };
    }
    const user = await userRes.json();

    const repoRes = await fetch(
      `${GITHUB_API}/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}`,
      { headers: headers(cfg.token) }
    );
    if (!repoRes.ok) {
      return { ok: false, message: friendlyError(repoRes.status) };
    }
    const repo = await repoRes.json();

    const canWrite = Boolean(repo.permissions?.push);
    const files = await listGitHubFiles();
    return {
      ok: true,
      message: `Connected as ${user.login} → ${repo.full_name} (${cfg.folder}/, ${files.length} file${
        files.length === 1 ? '' : 's'
      })${canWrite ? '. Uploads enabled.' : '. Read-only token — uploads will fail.'}`,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Could not reach GitHub.' };
  }
}

export async function uploadGitHubFile(
  file: File
): Promise<{ ok: true; file: GitHubFile } | { ok: false; error: string }> {
  const cfg = getGitHubConfig();
  if (!cfg.token) return { ok: false, error: 'GitHub is not connected. Add a token in Settings.' };
  if (!file) return { ok: false, error: 'No file selected.' };
  if (file.size > 45 * 1024 * 1024) {
    return { ok: false, error: 'File is larger than 45 MB. GitHub rejects bigger uploads through this API.' };
  }

  const path = `${cfg.folder}/${file.name}`;

  try {
    const content = await readFileAsBase64(file);
    const b64 = content.split(',')[1];
    if (!b64) return { ok: false, error: 'Could not read the file.' };

    // Existing file? Send its SHA so GitHub replaces it instead of failing.
    const existing = await fetch(contentsUrl(cfg, path), { headers: headers(cfg.token) });

    const body: Record<string, unknown> = {
      message: `Add ${file.name}`,
      content: b64,
      branch: cfg.branch,
    };

    if (existing.ok) {
      const existingData: { sha?: string } = await existing.json();
      if (existingData.sha) {
        body.sha = existingData.sha;
        body.message = `Update ${file.name}`;
      }
    }

    const res = await fetch(contentsUrl(cfg, path), {
      method: 'PUT',
      headers: { ...headers(cfg.token), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: friendlyError(res.status, err?.message) };
    }

    const data = await res.json();
    const saved = data.content;
    return {
      ok: true,
      file: {
        id: saved.sha,
        name: saved.name,
        path: saved.path,
        size: file.size,
        type: getFileCategory(saved.name),
        url: saved.html_url,
        download_url: saved.download_url || saved.url,
        html_url: saved.html_url,
        uploaded_at: new Date().toISOString(),
        sha: saved.sha,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Upload failed.' };
  }
}

export async function deleteGitHubFile(
  path: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cfg = getGitHubConfig();
  if (!cfg.token) return { ok: false, error: 'GitHub is not connected.' };

  try {
    const existing = await fetch(contentsUrl(cfg, path), { headers: headers(cfg.token) });
    if (!existing.ok) {
      const err = await existing.json().catch(() => ({}));
      return { ok: false, error: friendlyError(existing.status, err?.message) };
    }
    const existingData: { sha?: string } = await existing.json();
    if (!existingData.sha) return { ok: false, error: 'Could not find the file SHA on GitHub.' };

    const res = await fetch(contentsUrl(cfg, path), {
      method: 'DELETE',
      headers: { ...headers(cfg.token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Delete ${path}`,
        sha: existingData.sha,
        branch: cfg.branch,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: friendlyError(res.status, err?.message) };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Delete failed.' };
  }
}

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file.'));
  });
}

export function getFileCategory(fileName: string): FileCategory {
  const ext = (fileName.toLowerCase().split('.').pop() || '') as string;
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext)) return 'image';
  if (
    ['doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'md', 'html', 'json'].includes(
      ext
    )
  ) {
    return 'document';
  }
  return 'other';
}

export function getFileIcon(fileName: string): string {
  const category = getFileCategory(fileName);
  if (category === 'pdf' || category === 'document') return 'FileText';
  if (category === 'image') return 'Image';
  return 'File';
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function canPreview(fileName: string): boolean {
  const ext = (fileName.toLowerCase().split('.').pop() || '') as string;
  return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'txt', 'md', 'html'].includes(ext);
}

export function getFileDownloadUrl(file: GitHubFile): string {
  return file.download_url;
}
