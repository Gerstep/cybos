import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Folder,
  User,
  Key,
  GitBranch,
  Settings,
  Sparkles,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

// ===== TYPES =====

interface DepsStatus {
  allInstalled: boolean;
  deps: {
    bun: { installed: boolean; version: string | null; installCmd: string };
    git: { installed: boolean; version: string | null; installCmd: string };
    claude: { installed: boolean; version: string | null; installCmd: string };
  };
}

interface SetupData {
  vaultPath: string;
  user: {
    name: string;
    ownerName: string;
    slug: string;
    aliases: string[];
    description: string;
  };
  apiKeys: Record<string, string>;
  privateGit: { enabled: boolean; repoUrl: string };
  sharedGit: { enabled: boolean; repoUrl: string };
  automations: { dailyReindex: boolean; dailyBrief: boolean };
}

// ===== API FUNCTIONS =====

const API_BASE = '/api/setup';

async function checkDeps(): Promise<DepsStatus> {
  const res = await fetch(`${API_BASE}/deps`);
  return res.json();
}

async function createVault(vaultPath: string) {
  const res = await fetch(`${API_BASE}/vault`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vaultPath })
  });
  return res.json();
}

async function saveIdentity(data: SetupData) {
  const res = await fetch(`${API_BASE}/identity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vaultPath: data.vaultPath,
      name: data.user.name,
      ownerName: data.user.ownerName,
      aliases: data.user.aliases,
      description: data.user.description
    })
  });
  return res.json();
}

async function saveApiKeys(vaultPath: string, keys: Record<string, string>) {
  const res = await fetch(`${API_BASE}/apikeys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vaultPath, keys })
  });
  return res.json();
}

async function completeSetup(data: SetupData) {
  const res = await fetch(`${API_BASE}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vaultPath: data.vaultPath,
      user: data.user,
      privateGit: data.privateGit,
      sharedGit: data.sharedGit,
      automations: data.automations
    })
  });
  return res.json();
}

// ===== COMPONENTS =====

const StepIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="flex items-center gap-2 mb-8">
    {Array.from({ length: total }, (_, i) => (
      <div key={i} className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
            ${i < current ? 'bg-emerald-500 text-white' : i === current ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}
        >
          {i < current ? <Check className="w-4 h-4" /> : i + 1}
        </div>
        {i < total - 1 && (
          <div className={`w-8 h-0.5 ${i < current ? 'bg-emerald-500' : 'bg-gray-100'}`} />
        )}
      </div>
    ))}
  </div>
);

const Button: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  children: React.ReactNode;
}> = ({ onClick, disabled, variant = 'primary', loading, children }) => {
  const base = 'px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    ghost: 'text-gray-500 hover:text-gray-900'
  };

  return (
    <button onClick={onClick} disabled={disabled || loading} className={`${base} ${variants[variant]}`}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

const Input: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}> = ({ label, value, onChange, placeholder, required, type = 'text' }) => (
  <div className="mb-4">
    <label className="block text-sm font-bold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
    />
  </div>
);

// ===== WIZARD STEPS =====

// Step 1: Welcome
const WelcomeStep: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-8">
      <Sparkles className="w-10 h-10 text-white" />
    </div>
    <h1 className="text-4xl font-bold mb-4">Welcome to Cybos</h1>
    <p className="text-xl text-gray-500 mb-8 max-w-md mx-auto">
      Let's set up your personal AI assistant in just a few steps.
    </p>
    <Button onClick={onNext}>
      Get Started <ChevronRight className="w-4 h-4" />
    </Button>
  </div>
);

// Step 2: Check Dependencies
const DepsStep: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const [deps, setDeps] = useState<DepsStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDeps().then(setDeps).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
        <p className="text-gray-500 mt-4">Checking dependencies...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">System Check</h2>
      <p className="text-gray-500 mb-8">Checking required dependencies...</p>

      <div className="space-y-4 mb-8">
        {deps && Object.entries(deps.deps).map(([name, info]) => (
          <div key={name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${info.installed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {info.installed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-bold capitalize">{name}</div>
                {info.version && <div className="text-xs text-gray-500">{info.version}</div>}
              </div>
            </div>
            {!info.installed && (
              <code className="text-xs bg-gray-200 px-2 py-1 rounded">{info.installCmd}</code>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext}>
          {deps?.allInstalled ? 'Continue' : 'Skip for now'} <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Step 3: Vault Location
const VaultStep: React.FC<{
  data: SetupData;
  onChange: (d: Partial<SetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ data, onChange, onNext, onBack }) => {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const result = await createVault(data.vaultPath);
      if (result.error) {
        setError(result.message);
      } else {
        onNext();
      }
    } catch (e) {
      setError('Failed to create vault');
    }
    setCreating(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Folder className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Vault Location</h2>
          <p className="text-gray-500">Where should we store your data?</p>
        </div>
      </div>

      <Input
        label="Vault Path"
        value={data.vaultPath}
        onChange={(v) => onChange({ vaultPath: v })}
        placeholder="~/CybosVault"
      />

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="text-sm font-bold text-gray-700 mb-2">This will create:</div>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>private/ - Your personal data (local only)</li>
          <li>shared/ - Team data (optional GitHub sync)</li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={handleCreate} loading={creating}>
          Create Vault <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Step 4: Identity
const IdentityStep: React.FC<{
  data: SetupData;
  onChange: (d: Partial<SetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ data, onChange, onNext, onBack }) => {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await saveIdentity(data);
      if (!result.error) {
        onChange({
          user: {
            ...data.user,
            slug: result.slug
          }
        });
        onNext();
      }
    } catch (e) {}
    setSaving(false);
  };

  const updateUser = (field: string, value: string | string[]) => {
    onChange({
      user: { ...data.user, [field]: value }
    });
  };

  const isValid = data.user.name && data.user.ownerName;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Your Identity</h2>
          <p className="text-gray-500">Tell Cybos about yourself</p>
        </div>
      </div>

      <Input
        label="Full Name"
        value={data.user.name}
        onChange={(v) => updateUser('name', v)}
        placeholder="John Smith"
        required
      />

      <Input
        label="Short Name (for references)"
        value={data.user.ownerName}
        onChange={(v) => updateUser('ownerName', v)}
        placeholder="John"
        required
      />

      <Input
        label="Aliases (comma-separated)"
        value={data.user.aliases.join(', ')}
        onChange={(v) => updateUser('aliases', v.split(',').map(a => a.trim()).filter(Boolean))}
        placeholder="Me, JS, Johnny"
      />

      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">Brief Description</label>
        <textarea
          value={data.user.description}
          onChange={(e) => updateUser('description', e.target.value)}
          placeholder="2-3 sentences about yourself..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[100px]"
        />
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={handleSave} disabled={!isValid} loading={saving}>
          Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Step 5: API Keys (Optional)
const ApiKeysStep: React.FC<{
  data: SetupData;
  onChange: (d: Partial<SetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ data, onChange, onNext, onBack }) => {
  const [saving, setSaving] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const updateKey = (key: string, value: string) => {
    onChange({
      apiKeys: { ...data.apiKeys, [key]: value }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveApiKeys(data.vaultPath, data.apiKeys);
      onNext();
    } catch (e) {}
    setSaving(false);
  };

  const keyInfo = [
    { key: 'anthropic', label: 'Anthropic API Key', link: 'https://console.anthropic.com/', placeholder: 'sk-ant-...' },
    { key: 'perplexity', label: 'Perplexity API Key', link: 'https://www.perplexity.ai/settings/api', placeholder: 'pplx-...' },
    { key: 'telegram_id', label: 'Telegram API ID', link: 'https://my.telegram.org/apps', placeholder: '12345678' },
    { key: 'telegram_hash', label: 'Telegram API Hash', link: 'https://my.telegram.org/apps', placeholder: 'abc123...' }
  ];

  const moreKeys = [
    { key: 'exa', label: 'Exa API Key', link: 'https://exa.ai/', placeholder: 'exa-...' },
    { key: 'gemini', label: 'Gemini API Key', link: 'https://ai.google.dev/', placeholder: 'AIza...' },
    { key: 'firecrawl', label: 'Firecrawl API Key', link: 'https://firecrawl.dev/', placeholder: 'fc-...' }
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <Key className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">API Keys</h2>
          <p className="text-gray-500">Optional - add these later if you prefer</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {keyInfo.map(({ key, label, link, placeholder }) => (
          <div key={key}>
            <label className="flex items-center justify-between text-sm font-bold text-gray-700 mb-2">
              {label}
              <a href={link} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 flex items-center gap-1 font-normal">
                Get key <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="password"
              value={data.apiKeys[key] || ''}
              onChange={(e) => updateKey(key, e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowMore(!showMore)}
        className="text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        {showMore ? 'Show less' : 'Show more keys...'}
      </button>

      {showMore && (
        <div className="space-y-4 mb-6">
          {moreKeys.map(({ key, label, link, placeholder }) => (
            <div key={key}>
              <label className="flex items-center justify-between text-sm font-bold text-gray-700 mb-2">
                {label}
                <a href={link} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 flex items-center gap-1 font-normal">
                  Get key <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <input
                type="password"
                value={data.apiKeys[key] || ''}
                onChange={(e) => updateKey(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button onClick={onNext} variant="secondary">
            Skip
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save Keys <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step 6: Git Setup (Optional)
const GitStep: React.FC<{
  data: SetupData;
  onChange: (d: Partial<SetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ data, onChange, onNext, onBack }) => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <GitBranch className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Git Backup & Sharing</h2>
          <p className="text-gray-500">Optional - set up later if you prefer</p>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        {/* Personal Backup */}
        <div className="p-4 border border-gray-200 rounded-xl">
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={data.privateGit.enabled}
              onChange={(e) => onChange({ privateGit: { ...data.privateGit, enabled: e.target.checked } })}
              className="w-5 h-5 rounded"
            />
            <span className="font-bold">Back up private data to GitHub</span>
          </label>
          {data.privateGit.enabled && (
            <input
              type="text"
              value={data.privateGit.repoUrl}
              onChange={(e) => onChange({ privateGit: { ...data.privateGit, repoUrl: e.target.value } })}
              placeholder="https://github.com/you/cybos-private"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          )}
        </div>

        {/* Team Sharing */}
        <div className="p-4 border border-gray-200 rounded-xl">
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={data.sharedGit.enabled}
              onChange={(e) => onChange({ sharedGit: { ...data.sharedGit, enabled: e.target.checked } })}
              className="w-5 h-5 rounded"
            />
            <span className="font-bold">Join a team (shared repo)</span>
          </label>
          {data.sharedGit.enabled && (
            <input
              type="text"
              value={data.sharedGit.repoUrl}
              onChange={(e) => onChange({ sharedGit: { ...data.sharedGit, repoUrl: e.target.value } })}
              placeholder="https://github.com/company/cybos-shared"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext}>
          Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Step 7: Automations
const AutomationsStep: React.FC<{
  data: SetupData;
  onChange: (d: Partial<SetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ data, onChange, onNext, onBack }) => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Automations</h2>
          <p className="text-gray-500">Recommended for daily operation</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={data.automations.dailyReindex}
            onChange={(e) => onChange({ automations: { ...data.automations, dailyReindex: e.target.checked } })}
            className="w-5 h-5 rounded"
          />
          <div>
            <div className="font-bold">Daily Reindex (6am)</div>
            <div className="text-sm text-gray-500">Keep your context graph fresh</div>
          </div>
        </label>

        <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={data.automations.dailyBrief}
            onChange={(e) => onChange({ automations: { ...data.automations, dailyBrief: e.target.checked } })}
            className="w-5 h-5 rounded"
          />
          <div>
            <div className="font-bold">Daily Brief (8am)</div>
            <div className="text-sm text-gray-500">Generate morning brief automatically</div>
          </div>
        </label>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-500">
        Note: Automations will only run if required API keys are configured. Missing keys will log warnings but won't cause errors.
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext}>
          Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Step 8: Complete
const CompleteStep: React.FC<{
  data: SetupData;
  onBack: () => void;
}> = ({ data, onBack }) => {
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    setError(null);
    try {
      const result = await completeSetup(data);
      if (result.error) {
        setError(result.message);
      } else {
        setDone(true);
      }
    } catch (e) {
      setError('Failed to complete setup');
    }
    setCompleting(false);
  };

  if (done) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4">You're all set!</h1>
        <p className="text-xl text-gray-500 mb-8 max-w-md mx-auto">
          Cybos is ready. Your vault is at:
        </p>
        <code className="bg-gray-100 px-4 py-2 rounded-lg text-sm mb-8 block max-w-sm mx-auto">
          {data.vaultPath}
        </code>

        <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto mb-8 text-left">
          <h3 className="font-bold mb-3">What's next?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>1. <strong>Open the cyberman folder</strong> in VS Code or Cursor</li>
            <li className="pl-4 text-gray-500">Your vault appears as <code className="bg-gray-200 px-1 rounded">vault/</code> in the sidebar</li>
            <li>2. Run <code className="bg-gray-200 px-1 rounded">claude</code> in the terminal</li>
            <li>3. Try <code className="bg-gray-200 px-1 rounded">/cyber-brief</code> to generate your first brief</li>
          </ul>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 max-w-md mx-auto mb-8 text-left">
          <div className="flex items-start gap-2">
            <Folder className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              A <code className="bg-blue-100 px-1 rounded">vault</code> symlink was created pointing to your data.
              You'll see <code className="bg-blue-100 px-1 rounded">vault/private/</code> and <code className="bg-blue-100 px-1 rounded">vault/shared/</code> in your IDE.
            </div>
          </div>
        </div>

        <Button onClick={() => window.close()}>
          Close Setup
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Review & Complete</h2>
      <p className="text-gray-500 mb-8">Review your setup before finishing</p>

      <div className="space-y-4 mb-8">
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="text-sm font-bold text-gray-500 mb-1">Vault Location</div>
          <div className="font-mono">{data.vaultPath}</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="text-sm font-bold text-gray-500 mb-1">Identity</div>
          <div>{data.user.name} ({data.user.ownerName})</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="text-sm font-bold text-gray-500 mb-1">API Keys</div>
          <div>{Object.keys(data.apiKeys).filter(k => data.apiKeys[k]).length} configured</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="text-sm font-bold text-gray-500 mb-1">Automations</div>
          <div>
            {data.automations.dailyReindex && 'Daily reindex'}
            {data.automations.dailyReindex && data.automations.dailyBrief && ', '}
            {data.automations.dailyBrief && 'Daily brief'}
            {!data.automations.dailyReindex && !data.automations.dailyBrief && 'None'}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={handleComplete} loading={completing}>
          Complete Setup <Check className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// ===== MAIN WIZARD =====

export const SetupWizard: React.FC = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SetupData>({
    vaultPath: '~/CybosVault',
    user: {
      name: '',
      ownerName: '',
      slug: '',
      aliases: ['Me'],
      description: ''
    },
    apiKeys: {},
    privateGit: { enabled: false, repoUrl: '' },
    sharedGit: { enabled: false, repoUrl: '' },
    automations: { dailyReindex: true, dailyBrief: true }
  });

  const updateData = (partial: Partial<SetupData>) => {
    setData(prev => ({ ...prev, ...partial }));
  };

  const steps = [
    <WelcomeStep key="welcome" onNext={() => setStep(1)} />,
    <DepsStep key="deps" onNext={() => setStep(2)} onBack={() => setStep(0)} />,
    <VaultStep key="vault" data={data} onChange={updateData} onNext={() => setStep(3)} onBack={() => setStep(1)} />,
    <IdentityStep key="identity" data={data} onChange={updateData} onNext={() => setStep(4)} onBack={() => setStep(2)} />,
    <ApiKeysStep key="apikeys" data={data} onChange={updateData} onNext={() => setStep(5)} onBack={() => setStep(3)} />,
    <GitStep key="git" data={data} onChange={updateData} onNext={() => setStep(6)} onBack={() => setStep(4)} />,
    <AutomationsStep key="automations" data={data} onChange={updateData} onNext={() => setStep(7)} onBack={() => setStep(5)} />,
    <CompleteStep key="complete" data={data} onBack={() => setStep(6)} />
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        {step > 0 && step < steps.length - 1 && (
          <StepIndicator current={step} total={steps.length - 1} />
        )}
        {steps[step]}
      </div>
    </div>
  );
};
