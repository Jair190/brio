'use client'

import { useState } from 'react'
import { useOrg } from '@/hooks/useOrg'
import { useJobTypes, useCreateJobType, useDeleteJobType } from '@/hooks/useJobTypes'
import { useClientTags, useCreateClientTag, useDeleteClientTag } from '@/hooks/useClientTags'
import { useJoinRequests } from '@/hooks/useJoinRequests'
import { approveJoinRequest, rejectJoinRequest } from '@/lib/crm/actions'
import { Building2, Users, Tag, Briefcase, Mail, Plus, Trash2, Check, X, ExternalLink, UserCheck, UserX } from 'lucide-react'

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280',
]

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/50 transition-all duration-200'

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_COLORS.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${value === c ? 'ring-2 ring-offset-2 ring-offset-[#1C1A17] ring-white/30 scale-110' : ''}`}
          style={{ backgroundColor: c }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0 p-0"
        title="Custom color"
      />
    </div>
  )
}

function JobTypesTab() {
  const { data: jobTypes = [], isLoading } = useJobTypes()
  const createJobType = useCreateJobType()
  const deleteJobType = useDeleteJobType()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleCreate() {
    if (!name.trim()) return
    await createJobType.mutateAsync({ name: name.trim(), color })
    setName('')
    setColor('#3B82F6')
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-400">Job type categories appear on job cards and help filter your pipeline.</p>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add type
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-300">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Drain Cleaning"
              className={inputCls}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-300">Color</label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setShowForm(false); setName('') }}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-stone-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!name.trim() || createJobType.isPending}
              onClick={handleCreate}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white transition-colors"
            >
              {createJobType.isPending ? 'Saving…' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : jobTypes.length === 0 ? (
        <p className="text-sm text-stone-500">No job types yet.</p>
      ) : (
        <ul className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {jobTypes.map((jt, i) => (
            <li
              key={jt.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.05)' } : {}}
            >
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: jt.color }} />
              <span className="text-sm font-medium text-white flex-1">{jt.name}</span>
              {deletingId === jt.id ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-500 mr-1">Delete?</span>
                  <button
                    onClick={async () => { await deleteJobType.mutateAsync(jt.id); setDeletingId(null) }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeletingId(null)} className="text-stone-500 hover:text-stone-300 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeletingId(jt.id)}
                  className="text-stone-700 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ClientTagsTab() {
  const { data: tags = [], isLoading } = useClientTags()
  const createTag = useCreateClientTag()
  const deleteTag = useDeleteClientTag()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#10B981')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleCreate() {
    if (!name.trim()) return
    await createTag.mutateAsync({ name: name.trim(), color })
    setName('')
    setColor('#10B981')
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-400">Tags let you segment your client list for filtering and marketing.</p>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add tag
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-300">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. VIP"
              className={inputCls}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-300">Color</label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setShowForm(false); setName('') }}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-stone-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!name.trim() || createTag.isPending}
              onClick={handleCreate}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white transition-colors"
            >
              {createTag.isPending ? 'Saving…' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : tags.length === 0 ? (
        <p className="text-sm text-stone-500">No tags yet.</p>
      ) : (
        <ul className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {tags.map((tag, i) => (
            <li
              key={tag.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.05)' } : {}}
            >
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
              <span className="text-sm font-medium text-white flex-1">{tag.name}</span>
              {deletingId === tag.id ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-500 mr-1">Delete?</span>
                  <button
                    onClick={async () => { await deleteTag.mutateAsync(tag.id); setDeletingId(null) }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeletingId(null)} className="text-stone-500 hover:text-stone-300 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeletingId(tag.id)}
                  className="text-stone-700 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function TeamTab() {
  const { data: requests = [], isLoading, refetch } = useJoinRequests()
  const { member } = useOrg()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const isOwner = member?.role === 'owner'

  async function handleApprove(id: string) {
    setLoadingId(id)
    await approveJoinRequest(id)
    refetch()
    setLoadingId(null)
  }

  async function handleReject(id: string) {
    setLoadingId(id)
    await rejectJoinRequest(id)
    refetch()
    setLoadingId(null)
  }

  if (!isOwner) {
    return <p className="text-sm text-stone-400">Only the org owner can manage team access.</p>
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-400">Approve or reject requests from technicians wanting to join your company.</p>
      {isLoading ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-stone-500">No pending join requests.</p>
      ) : (
        <ul className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {requests.map((req, i) => (
            <li
              key={req.id}
              className="flex items-center gap-3 px-4 py-3"
              style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.05)' } : {}}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{req.name}</p>
                <p className="text-xs text-stone-500">{req.email}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  disabled={loadingId === req.id}
                  onClick={() => handleApprove(req.id)}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-green-900/30 text-green-400 hover:bg-green-900/50 disabled:opacity-50 transition-colors"
                >
                  <UserCheck className="h-3.5 w-3.5" /> Approve
                </button>
                <button
                  disabled={loadingId === req.id}
                  onClick={() => handleReject(req.id)}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/40 disabled:opacity-50 transition-colors"
                >
                  <UserX className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type Tab = 'org' | 'team' | 'job-types' | 'tags' | 'gmail'

export default function SettingsPage() {
  const { org, member } = useOrg()
  const [tab, setTab] = useState<Tab>('org')
  const { data: joinRequests = [] } = useJoinRequests()

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'org',       label: 'Organization', icon: Building2 },
    { id: 'team',      label: 'Team',         icon: Users },
    { id: 'job-types', label: 'Job Types',    icon: Briefcase },
    { id: 'tags',      label: 'Client Tags',  icon: Tag },
    { id: 'gmail',     label: 'Gmail',        icon: Mail },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
        <p className="text-stone-500 text-sm mt-1">Manage your organization and CRM settings</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              tab === id
                ? 'border-amber-600 text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-300'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
            {id === 'team' && joinRequests.length > 0 && (
              <span className="ml-1 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                {joinRequests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl p-6" style={{ background: '#1A1714', border: '1px solid rgba(255,255,255,0.06)' }}>
        {tab === 'org' && (
          <div className="space-y-5">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-stone-400" /> Organization
            </p>
            <div className="grid grid-cols-2 gap-5">
              {[
                { label: 'Company name', value: org?.name },
                { label: 'Business phone', value: org?.phone },
                { label: 'Business email', value: org?.email },
                { label: 'Your role', value: member?.role },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-stone-500 mb-1">{label}</p>
                  <p className="text-sm font-medium text-white capitalize">{value ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'team' && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-stone-400" /> Team
            </p>
            <TeamTab />
          </div>
        )}

        {tab === 'job-types' && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-stone-400" /> Job Types
            </p>
            <JobTypesTab />
          </div>
        )}

        {tab === 'tags' && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Tag className="h-4 w-4 text-stone-400" /> Client Tags
            </p>
            <ClientTagsTab />
          </div>
        )}

        {tab === 'gmail' && (
          <div className="space-y-5">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Mail className="h-4 w-4 text-stone-400" /> Gmail Sync
            </p>
            <p className="text-sm text-stone-400 leading-relaxed">
              Connect your Gmail account to automatically log inbound and outbound emails as activity on matching clients.
              Emails from unknown senders appear in the Unmatched Emails tab so you can link them manually.
            </p>
            <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">How it works</p>
              <ul className="text-sm text-stone-500 space-y-1.5 list-disc list-inside">
                <li>We sync every 2 minutes using Gmail&apos;s History API</li>
                <li>Emails are matched to clients by sender/recipient email address</li>
                <li>Matched emails create activity log entries automatically</li>
                <li>No emails are sent on your behalf — read-only access</li>
              </ul>
            </div>
            <a
              href="/api/auth/gmail"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <Mail className="h-4 w-4" />
              Connect Gmail account
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
            <p className="text-xs text-stone-600">
              You will be redirected to Google to authorize read-only Gmail access.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
