import React, { useEffect, useState, useCallback } from 'react'
import type { ContactMessage, ContactMessagesResponse } from '../types'
import apiFetch from '../utils/api'

interface ContactInboxProps {
  onUnreadCountChange?: (count: number) => void
}

const ContactInbox: React.FC<ContactInboxProps> = ({ onUnreadCountChange }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [counts, setCounts] = useState({ total: 0, unread: 0, archived: 0 })
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('unread')
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const fetchMessages = useCallback(async (currentFilter: 'all' | 'unread' | 'archived') => {
    try {
      const data = await apiFetch<ContactMessagesResponse>(`/contact/messages?status=${currentFilter}`)
      setMessages(data.messages)
      setCounts(data.counts)
      if (onUnreadCountChange) {
        onUnreadCountChange(data.counts.unread)
      }
    } catch (err) {
      console.error('Erreur chargement messages:', err)
    } finally {
      setLoading(false)
    }
  }, [onUnreadCountChange])

  useEffect(() => {
    fetchMessages(filter)
  }, [filter, fetchMessages])

  const handleToggleRead = async (msg: ContactMessage) => {
    try {
      const newReadState = !msg.is_read
      await apiFetch(`/contact/messages/${msg.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_read: newReadState })
      })
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...selectedMessage, is_read: newReadState })
      }
      fetchMessages(filter)
    } catch (err) {
      console.error('Erreur mise à jour statut lu:', err)
    }
  }

  const handleToggleArchive = async (msg: ContactMessage) => {
    try {
      const newArchivedState = !msg.is_archived
      await apiFetch(`/contact/messages/${msg.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_archived: newArchivedState })
      })
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage(null)
      }
      fetchMessages(filter)
    } catch (err) {
      console.error('Erreur archivage:', err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer définitivement ce message ?')) return
    try {
      await apiFetch(`/contact/messages/${id}`, { method: 'DELETE' })
      if (selectedMessage?.id === id) {
        setSelectedMessage(null)
      }
      fetchMessages(filter)
    } catch (err) {
      console.error('Erreur suppression:', err)
    }
  }

  const handleSelect = (msg: ContactMessage) => {
    setSelectedMessage(msg)
    if (!msg.is_read) {
      handleToggleRead(msg)
    }
  }

  const formatDate = (ts: string) => {
    try {
      const date = new Date(ts)
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return ts
    }
  }

  if (loading) {
    return (
      <div className='bg-bg-panel border-2 border-border-subtle p-8 text-center text-text-muted font-mono animate-pulse uppercase'>
        &gt; CHARGEMENT_DE_LA_MESSAGERIE...
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-8 text-text-main font-mono'>
      {/* Header & Filter Controls */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-panel border-2 border-border-subtle p-6 shadow-xl'>
        <div>
          <div className='flex items-center gap-3'>
            <span className='w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse'></span>
            <h2 className='text-lg font-black uppercase tracking-widest text-white'>
              Contact_Inbox.sys ({counts.total} messages)
            </h2>
          </div>
          <p className='text-xs text-text-muted mt-1'>
            Messages reçus via le formulaire de contact du portfolio
          </p>
        </div>

        {/* Filter Tabs */}
        <div className='flex gap-2 bg-bg-main border border-border-subtle p-1 text-xs'>
          <button
            type='button'
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'unread' ? 'bg-secondary text-bg-main font-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Non lus</span>
            {counts.unread > 0 && (
              <span className='bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full'>
                {counts.unread}
              </span>
            )}
          </button>
          <button
            type='button'
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 font-bold uppercase transition-all cursor-pointer ${
              filter === 'all' ? 'bg-secondary text-bg-main font-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Tous ({counts.total})
          </button>
          <button
            type='button'
            onClick={() => setFilter('archived')}
            className={`px-3 py-1.5 font-bold uppercase transition-all cursor-pointer ${
              filter === 'archived' ? 'bg-secondary text-bg-main font-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Archivés ({counts.archived})
          </button>
        </div>
      </div>

      {/* Main Container: List + Detail View */}
      <div className='grid grid-cols-1 lg:grid-cols-5 gap-8'>
        {/* Messages List */}
        <div className='lg:col-span-2 flex flex-col gap-3 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar'>
          {messages.map(msg => (
            <div
              key={msg.id}
              onClick={() => handleSelect(msg)}
              className={`p-4 border transition-all cursor-pointer flex flex-col gap-2 rounded-sm ${
                selectedMessage?.id === msg.id
                  ? 'border-secondary bg-secondary/10'
                  : !msg.is_read
                  ? 'border-emerald-500/50 bg-bg-panel hover:border-emerald-400'
                  : 'border-border-subtle bg-bg-main/60 hover:border-gray-500 opacity-80'
              }`}
            >
              <div className='flex justify-between items-start gap-2'>
                <div className='flex items-center gap-2 min-w-0'>
                  {!msg.is_read && (
                    <span className='w-2 h-2 rounded-full bg-emerald-400 shrink-0' title='Non lu'></span>
                  )}
                  <span className='text-sm font-bold text-white truncate'>{msg.name}</span>
                </div>
                <span className='text-[10px] text-gray-400 shrink-0'>{formatDate(msg.created_at)}</span>
              </div>

              <div className='text-xs text-secondary font-bold truncate'>
                {msg.subject || 'Nouveau message'}
              </div>

              <p className='text-xs font-sans text-gray-400 truncate line-clamp-2'>
                {msg.message}
              </p>
            </div>
          ))}

          {messages.length === 0 && (
            <div className='bg-bg-panel border border-dashed border-border-subtle p-8 text-center text-xs text-gray-500 italic'>
              AUCUN_MESSAGE_DANS_CETTE_CATÉGORIE
            </div>
          )}
        </div>

        {/* Message Detail View */}
        <div className='lg:col-span-3 bg-bg-panel border-2 border-border-subtle p-6 shadow-2xl flex flex-col justify-between min-h-[400px]'>
          {selectedMessage ? (
            <div className='flex flex-col gap-6'>
              {/* Header */}
              <div className='flex flex-col gap-3 border-b border-border-subtle pb-4'>
                <div className='flex justify-between items-start gap-4'>
                  <div>
                    <h3 className='text-lg font-black text-white'>
                      {selectedMessage.subject || 'Message sans objet'}
                    </h3>
                    <div className='flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1'>
                      <span>De : <strong className='text-white'>{selectedMessage.name}</strong></span>
                      <span>&lt;{selectedMessage.email}&gt;</span>
                    </div>
                  </div>
                  <span className='text-xs text-secondary shrink-0 bg-secondary/10 px-2 py-1 border border-secondary/20'>
                    {formatDate(selectedMessage.created_at)}
                  </span>
                </div>

                {selectedMessage.ip && (
                  <span className='text-[10px] text-gray-500'>
                    IP Expéditeur : <code>{selectedMessage.ip}</code>
                  </span>
                )}
              </div>

              {/* Message Body */}
              <div className='bg-bg-main border border-border-subtle p-6 rounded text-sm font-sans text-gray-200 leading-relaxed whitespace-pre-wrap min-h-48'>
                {selectedMessage.message}
              </div>

              {/* Action Buttons */}
              <div className='flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border-subtle'>
                <div className='flex items-center gap-3'>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Votre message')}`}
                    className='bg-primary text-bg-main px-4 py-2.5 uppercase font-bold text-xs hover:brightness-110 transition-all flex items-center gap-2'
                  >
                    <span>✉ Répondre par Email</span>
                  </a>

                  <button
                    type='button'
                    onClick={() => handleToggleRead(selectedMessage)}
                    className='border border-border-subtle px-3 py-2 text-xs text-gray-300 hover:text-white hover:border-gray-400 uppercase font-bold'
                  >
                    {selectedMessage.is_read ? 'Marquer Non Lu' : 'Marquer Lu'}
                  </button>

                  <button
                    type='button'
                    onClick={() => handleToggleArchive(selectedMessage)}
                    className='border border-border-subtle px-3 py-2 text-xs text-gray-300 hover:text-white hover:border-gray-400 uppercase font-bold'
                  >
                    {selectedMessage.is_archived ? 'Désarchiver' : 'Archiver'}
                  </button>
                </div>

                <button
                  type='button'
                  onClick={() => handleDelete(selectedMessage.id)}
                  className='text-red-400 hover:text-red-300 text-xs uppercase font-bold px-3 py-2'
                >
                  [ Supprimer ]
                </button>
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center h-full text-center text-gray-500 py-20 italic'>
              <span>Sélectionnez un message à gauche pour afficher son contenu</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactInbox
