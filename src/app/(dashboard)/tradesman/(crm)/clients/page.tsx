'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCRMClients, useCreateClient } from '@/hooks/useCRMClients'
import { Users, Plus, Phone, Mail, MapPin, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

function AddClientModal({ onClose }: { onClose: () => void }) {
  const createClient = useCreateClient()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    try {
      await createClient.mutateAsync({
        name: fd.get('name') as string,
        phone: (fd.get('phone') as string) || null,
        email: (fd.get('email') as string) || null,
        service_address: (fd.get('service_address') as string) || null,
        billing_address: null,
        notes: (fd.get('notes') as string) || null,
      })
      onClose()
    } catch {
      setError('Failed to create client')
    }
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/50 transition-all duration-200"
  const labelCls = "block text-xs font-medium text-stone-400 mb-1.5"

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-2xl" style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="font-display font-bold text-white">Add client</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Name <span className="text-amber-600">*</span></label>
            <input name="name" required placeholder="Maria Torres" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Phone</label>
              <input name="phone" type="tel" placeholder="(415) 555-0100" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input name="email" type="email" placeholder="client@email.com" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Service address</label>
            <input name="service_address" placeholder="123 Main St, San Francisco" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea name="notes" rows={2} placeholder="Any notes about this client…" className={inputCls + ' resize-none'} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-stone-400 border border-white/10 hover:bg-white/5 transition-all duration-200">
              Cancel
            </button>
            <button type="submit" disabled={createClient.isPending} className="flex-1 py-2.5 rounded-xl text-sm text-white font-medium bg-amber-600 hover:bg-amber-500 disabled:opacity-60 transition-all duration-200">
              {createClient.isPending ? 'Adding…' : 'Add client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const { data: clients = [], isLoading } = useCRMClients(search || undefined)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Clients</h1>
          <p className="text-stone-400 text-sm mt-1">{clients.length} total</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4" /> Add client
        </button>
      </div>

      <input
        placeholder="Search by name, email, or phone…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/50 transition-all duration-200"
      />

      <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1714', border: '1px solid rgba(255,255,255,0.06)' }}>
        {isLoading ? (
          <div className="py-12 text-center text-stone-500 text-sm">Loading…</div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center px-6">
            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-stone-500" />
            </div>
            <p className="text-sm font-medium text-stone-300">
              {search ? 'No clients match your search' : 'No clients yet'}
            </p>
            {!search && (
              <p className="text-xs text-stone-500 mt-1.5">Add a client or claim a marketplace job to get started.</p>
            )}
          </div>
        ) : (
          <ul>
            {clients.map((client, i) => (
              <li key={client.id} style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.05)' } : {}}>
                <Link
                  href={`/tradesman/clients/${client.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/4 transition-colors duration-150"
                >
                  <div className="h-9 w-9 rounded-full bg-amber-600/20 border border-amber-600/20 flex items-center justify-center text-amber-400 font-semibold text-sm shrink-0">
                    {client.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white text-sm">{client.name}</p>
                      {client.tags && client.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {client.tags.map(tag => (
                            <span
                              key={tag.id}
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: tag.color + '28', color: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-stone-500">
                      {client.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {client.phone}
                        </span>
                      )}
                      {client.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {client.email}
                        </span>
                      )}
                      {client.service_address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {client.service_address.split(',')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-stone-600 shrink-0">
                    {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
