import { useState, useEffect } from 'react';
import { GitBranch, CheckCircle2, XCircle, Loader2, Send, LogOut, FolderGit2 } from 'lucide-react';

interface GitHubPanelProps {
  isOpen: boolean;
  onClose: () => void;
  exportHtml: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
}

type AuthState = 'idle' | 'polling' | 'authenticated' | 'error';
type PushState = 'idle' | 'pushing' | 'success' | 'error';

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';

async function getDeviceCode(): Promise<{ device_code: string; user_code: string; verification_uri: string; interval: number }> {
  const res = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, scope: 'repo' }),
  });
  return res.json();
}

async function pollForToken(deviceCode: string, interval: number): Promise<string | null> {
  return new Promise(resolve => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: CLIENT_ID,
            device_code: deviceCode,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          }),
        });
        const data = await res.json();
        if (data.access_token) {
          clearInterval(poll);
          resolve(data.access_token);
        } else if (data.error === 'access_denied' || data.error === 'expired_token') {
          clearInterval(poll);
          resolve(null);
        }
        // 'authorization_pending' or 'slow_down' → keep polling
      } catch {
        clearInterval(poll);
        resolve(null);
      }
    }, interval * 1000);
  });
}

export default function GitHubPanel({ isOpen, onClose, exportHtml }: GitHubPanelProps) {
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [pushState, setPushState] = useState<PushState>('idle');
  const [token, setToken] = useState<string>(() => sessionStorage.getItem('gh_token') || '');
  const [userCode, setUserCode] = useState('');
  const [verifyUrl, setVerifyUrl] = useState('');
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [commitPath, setCommitPath] = useState('devcanvas-export.html');
  const [commitMsg, setCommitMsg] = useState('chore: update DevCanvas export');
  const [pushMsg, setPushMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Restore session on mount
  useEffect(() => {
    if (token) {
      setAuthState('authenticated');
      fetchUser(token);
      fetchRepos(token);
    }
  }, []);

  async function fetchUser(t: string) {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${t}` },
    });
    const data = await res.json();
    setUsername(data.login || '');
  }

  async function fetchRepos(t: string) {
    const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
      headers: { Authorization: `Bearer ${t}` },
    });
    const data: GitHubRepo[] = await res.json();
    if (Array.isArray(data)) setRepos(data);
  }

  async function handleConnect() {
    if (!CLIENT_ID) {
      setErrorMsg('VITE_GITHUB_CLIENT_ID is not set in your .env file.');
      setAuthState('error');
      return;
    }
    setAuthState('polling');
    setErrorMsg('');
    try {
      const deviceData = await getDeviceCode();
      setUserCode(deviceData.user_code);
      setVerifyUrl(deviceData.verification_uri);
      window.open(deviceData.verification_uri, '_blank');

      const accessToken = await pollForToken(deviceData.device_code, deviceData.interval || 5);
      if (!accessToken) {
        setAuthState('error');
        setErrorMsg('Authorization failed or timed out. Please try again.');
        return;
      }
      sessionStorage.setItem('gh_token', accessToken);
      setToken(accessToken);
      setAuthState('authenticated');
      await fetchUser(accessToken);
      await fetchRepos(accessToken);
    } catch (err: any) {
      setAuthState('error');
      setErrorMsg(err.message || 'Connection failed.');
    }
  }

  function handleDisconnect() {
    sessionStorage.removeItem('gh_token');
    setToken('');
    setAuthState('idle');
    setUsername('');
    setRepos([]);
    setSelectedRepo('');
  }

  async function handlePush() {
    if (!selectedRepo || !token) return;
    setPushState('pushing');
    setPushMsg('');
    try {
      const repo = repos.find(r => r.full_name === selectedRepo);
      if (!repo) throw new Error('Repository not found.');

      // Check if file exists to get its SHA (needed for updates)
      let sha: string | undefined;
      const checkRes = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${commitPath}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (checkRes.ok) {
        const existing = await checkRes.json();
        sha = existing.sha;
      }

      // Commit the file
      const body: any = {
        message: commitMsg,
        content: btoa(unescape(encodeURIComponent(exportHtml))),
        branch: repo.default_branch,
      };
      if (sha) body.sha = sha;

      const pushRes = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${commitPath}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!pushRes.ok) {
        const err = await pushRes.json();
        throw new Error(err.message || `HTTP ${pushRes.status}`);
      }

      setPushState('success');
      setPushMsg(`✓ Pushed to ${repo.full_name}/${commitPath} on branch "${repo.default_branch}"`);
    } catch (err: any) {
      setPushState('error');
      setPushMsg(`✗ Error: ${err.message}`);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[440px] bg-[#0f0f0f] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <GitBranch className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-sm font-bold text-white">GitHub Integration</h2>
              <p className="text-[10px] text-zinc-500">Commit your export directly to a repository</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-lg transition-colors cursor-pointer leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 inspector-scroll">
          {/* Auth state: idle */}
          {authState === 'idle' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <GitBranch className="w-8 h-8 text-zinc-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-zinc-200">Connect Your GitHub Account</p>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-[280px] leading-relaxed">
                  Uses GitHub Device Flow OAuth — no server required. You'll be prompted to enter a code at github.com.
                </p>
              </div>
              {errorMsg && (
                <div className="text-[11px] text-rose-400 bg-rose-950/30 border border-rose-900/40 rounded-lg p-3 text-center">
                  {errorMsg}
                </div>
              )}
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <GitBranch className="w-4 h-4" />
                Connect GitHub
              </button>
            </div>
          )}

          {/* Auth state: polling */}
          {authState === 'polling' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-semibold text-zinc-200">Waiting for Authorization</p>
                <p className="text-[11px] text-zinc-500 mt-1">Enter this code at GitHub:</p>
              </div>
              <div className="px-6 py-3 bg-zinc-900 border border-zinc-700 rounded-xl font-mono text-2xl font-bold text-white tracking-widest">
                {userCode}
              </div>
              <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-violet-400 hover:text-violet-300 underline">
                Open {verifyUrl}
              </a>
              <p className="text-[10px] text-zinc-600">Polling for approval... (expires in 15 minutes)</p>
            </div>
          )}

          {/* Auth state: error */}
          {authState === 'error' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <XCircle className="w-10 h-10 text-rose-500" />
              <p className="text-sm text-rose-400 font-semibold">Connection Failed</p>
              <p className="text-[11px] text-zinc-500 text-center">{errorMsg}</p>
              <button onClick={() => setAuthState('idle')} className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors cursor-pointer">
                Try Again
              </button>
            </div>
          )}

          {/* Auth state: authenticated */}
          {authState === 'authenticated' && (
            <div className="space-y-4">
              {/* User badge */}
              <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-xs font-semibold text-white">@{username}</p>
                    <p className="text-[10px] text-zinc-500">GitHub account connected</p>
                  </div>
                </div>
                <button onClick={handleDisconnect} className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer">
                  <LogOut className="w-3 h-3" />
                  Disconnect
                </button>
              </div>

              {/* Repo selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-violet-400" />
                  Target Repository
                </label>
                <select
                  value={selectedRepo}
                  onChange={e => setSelectedRepo(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="">— Select a repository —</option>
                  {repos.map(r => (
                    <option key={r.id} value={r.full_name}>
                      {r.private ? '🔒 ' : '🌐 '}{r.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* File path */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">File Path</label>
                <input
                  type="text"
                  value={commitPath}
                  onChange={e => setCommitPath(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              {/* Commit message */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Commit Message</label>
                <input
                  type="text"
                  value={commitMsg}
                  onChange={e => setCommitMsg(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Push result */}
              {pushMsg && (
                <div className={`p-3 rounded-lg text-[11px] font-mono border ${
                  pushState === 'success'
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400'
                    : 'bg-rose-950/30 border-rose-800/40 text-rose-400'
                }`}>
                  {pushMsg}
                </div>
              )}

              {/* Push button */}
              <button
                onClick={handlePush}
                disabled={!selectedRepo || pushState === 'pushing'}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors cursor-pointer shadow-lg shadow-violet-600/20"
              >
                {pushState === 'pushing' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Committing...</>
                ) : (
                  <><Send className="w-4 h-4" />Push to GitHub</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
