import { useRef, useState } from 'react';
import { usePersistentState, clearAll, isDataWiped, store } from '../lib/storage';
import { uploadFile } from '../lib/files';
import { User, Camera, MapPin, Globe, Briefcase, GraduationCap, Target, Edit3, Save, X } from 'lucide-react';

export default function Profile() {
  const wiped = isDataWiped();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const defaultProfile = wiped
    ? {
        name: '',
        education: '',
        focus: '',
        situation: '',
        goal: '',
        dailyTime: '',
        institution: '',
        qualification: '',
        country: '',
        language: '',
        introduction: '',
        careerObjective: '',
        avatarUrl: '',
      }
    : {
        name: 'Arjun Kumar',
        education: 'Undergraduate',
        focus: 'Computer Science',
        situation: 'Student',
        goal: 'Skill Mastery',
        dailyTime: '4 hours',
        institution: 'IIT Delhi',
        qualification: 'B.Tech Computer Science',
        country: 'India',
        language: 'English',
        introduction: 'Passionate about building systems that scale. Currently focused on machine learning and distributed systems.',
        careerObjective: 'Become a senior ML engineer at a top tech company within 3 years.',
        avatarUrl: '',
      };

  const [profile, setProfile] = usePersistentState('profile', defaultProfile);

  /** Upload an avatar image and persist its URL onto the profile. */
  const handleAvatar = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file.');
      return;
    }
    setAvatarBusy(true);
    setAvatarError(null);
    const result = await uploadFile(file);
    setAvatarBusy(false);
    if (result.ok) {
      setProfile({ ...profile, avatarUrl: result.file.url });
    } else {
      setAvatarError(result.error);
    }
  };

  // Derive stats from actual stored data
  const tasks = store.get<{ id: string }[]>('tasks', []);
  const skills = store.get<{ id: string }[]>('skills', []);
  const tests = store.get<{ id: string; date: string }[]>('tests', []);
  const courses = store.get<{ id: string }[]>('courses', []);
  const qualifications = store.get<{ id: string }[]>('qualifications', []);

  // Calculate streak from test dates (consecutive days with activity)
  let streak = 0;
  if (tests.length > 0 && !wiped) {
    const sorted = tests.map(t => t.date).sort().reverse();
    const today = new Date().toISOString().slice(0, 10);
    let checkDate = new Date(today);
    let foundToday = false;
    for (let i = 0; i < sorted.length; i++) {
      const d = sorted[i];
      if (!foundToday && d === today) {
        streak++;
        foundToday = true;
        checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (foundToday) {
        const expected = new Date(checkDate);
        expected.setDate(expected.getDate() - 1);
        if (d === expected.toISOString().slice(0, 10)) {
          streak++;
          checkDate = expected;
        } else {
          break;
        }
      }
    }
    if (!foundToday && sorted.length > 0) {
      // Check if yesterday is in dates
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      if (sorted.includes(yesterdayStr)) {
        streak = 1;
        checkDate = new Date(yesterdayStr);
        checkDate.setDate(checkDate.getDate() - 1);
        for (let i = 1; i < sorted.length; i++) {
          const expected = new Date(checkDate);
          expected.setDate(expected.getDate() - 1);
          if (sorted[i] === expected.toISOString().slice(0, 10)) {
            streak++;
            checkDate = expected;
          } else {
            break;
          }
        }
      }
    }
  }

  const stats = {
    totalHours: tests.reduce((acc, t) => acc + (t as any).timeTaken || 0, 0) / 60,
    streak,
    courses: courses.length,
    skills: skills.length,
    certificates: qualifications.length,
    tests: tests.length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text">Profile</h1>
            <p className="text-sm text-muted mt-1">Your personal learning identity</p>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isEditing ? 'bg-success text-white hover:bg-success/90' : 'bg-elevated text-text hover:bg-elevated/80'}`}
          >
            {isEditing ? (
              <><Save className="w-4 h-4" /> Save Changes</>
            ) : (
              <><Edit3 className="w-4 h-4" /> Edit Profile</>
            )}
          </button>
        </div>

        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleAvatar(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.name}'s avatar`}
                  className="w-24 h-24 rounded-2xl object-cover shadow-lg shadow-primary/25"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary/25">
                  {profile.name ? profile.name.split(' ').map((n) => n[0]).join('') : 'LU'}
                </div>
              )}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarBusy}
                aria-label="Change profile photo"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-elevated border border-border flex items-center justify-center hover:bg-primary/20 disabled:opacity-50 transition-colors"
              >
                <Camera className="w-4 h-4 text-muted" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="text-xl font-bold text-text bg-elevated border border-border rounded-lg px-3 py-1.5 w-full sm:w-auto focus:outline-none focus:border-primary"
                />
              ) : (
                <h2 className="text-xl font-bold text-text">{profile.name || 'Learner'}</h2>
              )}
              <p className="text-sm text-muted mt-1">{profile.situation} • {profile.education}</p>
              {avatarError && (
                <p className="text-[11px] text-danger mt-1">{avatarError}</p>
              )}
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-muted">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.country}</span>
                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {profile.language}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Hours', value: Math.round(stats.totalHours), color: 'text-primary' },
            { label: 'Streak', value: `${stats.streak}d`, color: 'text-warning' },
            { label: 'Courses', value: stats.courses, color: 'text-success' },
            { label: 'Skills', value: stats.skills, color: 'text-accent' },
            { label: 'Certificates', value: stats.certificates, color: 'text-primary' },
            { label: 'Tests', value: stats.tests, color: 'text-success' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-3 text-center">
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="glass-card rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-text mb-4">Details</h3>
          <div className="space-y-4">
            <ProfileField icon={GraduationCap} label="Education Level" value={profile.education} editing={isEditing} onChange={(v) => setProfile({ ...profile, education: v })} options={['High School', 'Undergraduate', 'Postgraduate', 'Professional', 'Self-taught']} />
            <ProfileField icon={Target} label="Current Focus" value={profile.focus} editing={isEditing} onChange={(v) => setProfile({ ...profile, focus: v })} options={['Computer Science', 'Data Science', 'Business', 'Design', 'Engineering', 'Medicine']} />
            <ProfileField icon={Briefcase} label="Situation" value={profile.situation} editing={isEditing} onChange={(v) => setProfile({ ...profile, situation: v })} options={['Student', 'Working Professional', 'Freelancer', 'Job Seeker', 'Entrepreneur']} />
            <ProfileField icon={Target} label="Main Goal" value={profile.goal} editing={isEditing} onChange={(v) => setProfile({ ...profile, goal: v })} options={['Academic Excellence', 'Career Advancement', 'Skill Mastery', 'Certification', 'Personal Growth']} />
            <ProfileField icon={User} label="Daily Learning Time" value={profile.dailyTime} editing={isEditing} onChange={(v) => setProfile({ ...profile, dailyTime: v })} options={['30 minutes', '1 hour', '2 hours', '3 hours', '4+ hours']} />
          </div>
        </div>

        {/* Optional Details */}
        <div className="glass-card rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-text mb-4">Additional Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Institution</label>
              {isEditing ? (
                <input type="text" value={profile.institution} onChange={(e) => setProfile({ ...profile, institution: e.target.value })} className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
              ) : (
                <p className="text-sm text-text">{profile.institution}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Current Qualification</label>
              {isEditing ? (
                <input type="text" value={profile.qualification} onChange={(e) => setProfile({ ...profile, qualification: e.target.value })} className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
              ) : (
                <p className="text-sm text-text">{profile.qualification}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Personal Introduction</label>
              {isEditing ? (
                <textarea value={profile.introduction} onChange={(e) => setProfile({ ...profile, introduction: e.target.value })} rows={3} className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary resize-none" />
              ) : (
                <p className="text-sm text-text">{profile.introduction}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Career Objective</label>
              {isEditing ? (
                <textarea value={profile.careerObjective} onChange={(e) => setProfile({ ...profile, careerObjective: e.target.value })} rows={2} className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary resize-none" />
              ) : (
                <p className="text-sm text-text">{profile.careerObjective}</p>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-card rounded-xl p-5 border border-danger/20">
          <h3 className="text-sm font-semibold text-danger mb-2">Danger Zone</h3>
          <p className="text-xs text-muted mb-4">These actions cannot be undone.</p>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => {
                try { localStorage.removeItem('learningos:v1:onboardingComplete'); } catch { /* ignore */ }
                window.location.reload();
              }}
              className="px-4 py-2 rounded-lg bg-danger/15 text-danger text-xs font-medium hover:bg-danger/25 transition-colors"
            >
              Reset Onboarding
            </button>
            <button 
              onClick={() => {
                if (!confirmDelete) {
                  setConfirmDelete(true);
                  window.setTimeout(() => setConfirmDelete(false), 5000);
                  return;
                }
                clearAll();
                window.location.reload();
              }}
              className="px-4 py-2 rounded-lg bg-danger/15 text-danger text-xs font-medium hover:bg-danger/25 transition-colors"
            >
              {confirmDelete ? 'Click again to confirm delete' : 'Delete All Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfileFieldProps {
  icon: React.ElementType;
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  options: string[];
}

function ProfileField({ icon: Icon, label, value, editing, onChange, options }: ProfileFieldProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted">{label}</p>
        {editing ? (
          <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-0.5 w-full bg-elevated border border-border rounded-lg px-2 py-1.5 text-sm text-text focus:outline-none focus:border-primary">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <p className="text-sm text-text">{value}</p>
        )}
      </div>
    </div>
  );
}
