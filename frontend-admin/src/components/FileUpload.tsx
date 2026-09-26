import React, { useState, useRef } from 'react'
import apiFetch from '../utils/api'

interface FileUploadProps {
  onUploaded: (url: string) => void
  currentUrl?: string
  label?: string
  accept?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploaded,
  currentUrl,
  label = 'Téléverser un fichier / Image',
  accept = 'image/*'
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file) return
    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await apiFetch<{ url: string }>('/upload', {
        method: 'POST',
        body: formData
      })

      onUploaded(res.url)
    } catch (err) {
      console.error('Erreur upload:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du téléversement')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className='flex flex-col gap-2 font-mono'>
      <label className='text-xs font-black uppercase tracking-widest text-gray-500'>
        {label}
      </label>

      <div
        onDragOver={e => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed p-4 text-center cursor-pointer transition-colors bg-bg-main flex flex-col items-center justify-center gap-2 ${
          isDragOver
            ? 'border-secondary bg-secondary/10'
            : 'border-border-subtle hover:border-secondary/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type='file'
          accept={accept}
          onChange={handleInputChange}
          className='hidden'
        />

        {uploading ? (
          <div className='flex items-center gap-2 text-xs text-secondary animate-pulse py-2'>
            <span>⚡ Téléversement en cours...</span>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-1 py-1'>
            <span className='text-xs text-gray-300 font-bold uppercase'>
              Glissez-déposez un fichier ou <span className='text-secondary underline'>parcourir</span>
            </span>
            <span className='text-[10px] text-gray-500'>
              Formats acceptés : WebP, AVIF, PNG, JPEG, SVG (Max 10 Mo)
            </span>
          </div>
        )}
      </div>

      {currentUrl && (
        <div className='flex items-center gap-3 bg-bg-panel border border-border-subtle p-2 mt-1'>
          <img
            src={currentUrl}
            alt='Aperçu'
            className='w-12 h-12 object-cover border border-border-subtle bg-black'
            onError={e => ((e.target as HTMLImageElement).style.display = 'none')}
          />
          <div className='flex flex-col min-w-0 grow'>
            <span className='text-[10px] text-gray-500 uppercase'>URL actuelle :</span>
            <span className='text-xs text-secondary truncate'>{currentUrl}</span>
          </div>
          <button
            type='button'
            onClick={() => onUploaded('')}
            className='text-red-400 hover:text-red-300 text-xs px-2 py-1'
            title='Supprimer'
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className='text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-2'>
          [ERREUR_UPLOAD] : {error}
        </div>
      )}
    </div>
  )
}

export default FileUpload
