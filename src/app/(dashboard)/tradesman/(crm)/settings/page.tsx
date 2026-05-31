'use client'

import { useState } from 'react'
import { useOrg } from '@/hooks/useOrg'
import { useJobTypes, useCreateJobType, useDeleteJobType } from '@/hooks/useJobTypes'
import { useClientTags, useCreateClientTag, useDeleteClientTag } from '@/hooks/useClientTags'
import { useJoinRequests } from '@/hooks/useJoinRequests'
import { approveJoinRequest, rejectJoinRequest } from '@/lib/crm/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Tag, Briefcase, Mail, Plus, Trash2, Check, X, CheckCircle2, ExternalLink, UserCheck, UserX } from 'lucide-react'

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280',
]

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRESET_COLORS.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${value === c ? 'ring-2 ring-offset-1 ring-slate-700 scale-110' : ''}`}
          style={{ backgroundColor: c }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-6 h-6 rounded-full cursor-pointer border border-slate-200 p-0"
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
        <p className="text-sm text-slate-500">Job type categories appear on job cards and help filter your pipeline.</p>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add type
        </Button>
      </div>

      {showForm && (
        <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
          <div className="space-y-1.5">
            <Label htmlFor="jt-name">Name</Label>
            <Input
              id="jt-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Drain Cleaning"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setName('') }}>Cancel</Button>
            <Button size="sm" disabled={!name.trim() || createJobType.isPending} onClick={handleCreate}>
              {createJobType.isPending ? 'Saving…' : 'Add'}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : jobTypes.length === 0 ? (
        <p className="text-sm text-slate-400">No job types yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
          {jobTypes.map(jt => (
            <li key={jt.id} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 transition-colors">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: jt.color }} />
              <span className="text-sm font-medium text-slate-900 flex-1">{jt.name}</span>
              {deletingId === jt.id ? (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500 mr-1">Delete?</span>
                  <button
                    onClick={async () => { await deleteJobType.mutateAsync(jt.id); setDeletingId(null) }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeletingId(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeletingId(jt.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
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
        <p className="text-sm text-slate-500">Tags let you segment your client list for filtering and marketing.</p>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add tag
        </Button>
      </div>

      {showForm && (
        <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
          <div className="space-y-1.5">
            <Label htmlFor="tag-name">Name</Label>
            <Input
              id="tag-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. VIP"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setName('') }}>Cancel</Button>
            <Button size="sm" disabled={!name.trim() || createTag.isPending} onClick={handleCreate}>
              {createTag.isPending ? 'Saving…' : 'Add'}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : tags.length === 0 ? (
        <p className="text-sm text-slate-400">No tags yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
          {tags.map(tag => (
            <li key={tag.id} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 transition-colors">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
              <span className="text-sm font-medium text-slate-900 flex-1">{tag.name}</span>
              {deletingId === tag.id ? (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500 mr-1">Delete?</span>
                  <button
                    onClick={async () => { await deleteTag.mutateAsync(tag.id); setDeletingId(null) }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeletingId(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeletingId(tag.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
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
    return <p className="text-sm text-slate-500">Only the org owner can manage team access.</p>
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">Approve or reject requests from technicians wanting to join your company.</p>
      {isLoading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-slate-400">No pending join requests.</p>
      ) : (
        <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
          {requests.map(req => (
            <li key={req.id} className="flex items-center gap-3 px-4 py-3 bg-white">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{req.name}</p>
                <p className="text-xs text-slate-500">{req.email}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button
                  size="sm"
                  className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                  disabled={loadingId === req.id}
                  onClick={() => handleApprove(req.id)}
                >
                  <UserCheck className="h-3.5 w-3.5" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
                  disabled={loadingId === req.id}
                  onClick={() => handleReject(req.id)}
                >
                  <UserX className="h-3.5 w-3.5" /> Reject
                </Button>
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
    { id: 'org', label: 'Organization', icon: Building2 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'job-types', label: 'Job Types', icon: Briefcase },
    { id: 'tags', label: 'Client Tags', icon: Tag },
    { id: 'gmail', label: 'Gmail', icon: Mail },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your organization and CRM settings</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
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
      {tab === 'team' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamTab />
          </CardContent>
        </Card>
      )}

      {tab === 'org' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-1">Company name</p>
                <p className="font-medium text-slate-900">{org?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Business phone</p>
                <p className="font-medium text-slate-900">{org?.phone ?? '—'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Business email</p>
                <p className="font-medium text-slate-900">{org?.email ?? '—'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Your role</p>
                <Badge variant="secondary" className="capitalize">{member?.role ?? '—'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'job-types' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Job Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <JobTypesTab />
          </CardContent>
        </Card>
      )}

      {tab === 'tags' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4" /> Client Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ClientTagsTab />
          </CardContent>
        </Card>
      )}

      {tab === 'gmail' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" /> Gmail Sync
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">
              Connect your Gmail account to automatically log inbound and outbound emails as activity on matching clients.
              Emails from unknown senders appear in the Unmatched Emails tab so you can link them manually.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">How it works</p>
              <ul className="text-sm text-slate-500 space-y-1 list-disc list-inside">
                <li>We sync every 2 minutes using Gmail's History API</li>
                <li>Emails are matched to clients by sender/recipient email address</li>
                <li>Matched emails create activity log entries automatically</li>
                <li>No emails are sent on your behalf — read-only access</li>
              </ul>
            </div>
            <a href="/api/auth/gmail">
              <Button className="gap-2">
                <Mail className="h-4 w-4" />
                Connect Gmail account
                <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-60" />
              </Button>
            </a>
            <p className="text-xs text-slate-400">
              You will be redirected to Google to authorize read-only Gmail access.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
