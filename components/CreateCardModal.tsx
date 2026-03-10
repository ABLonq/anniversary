'use client'

import { useState, useRef } from 'react'
import { MemoryCard } from '@/lib/types'

const CLOUDINARY_CLOUD_NAME = 'dfkran2o4'
const CLOUDINARY_UPLOAD_PRESET = 'anniversary_unsigned'

interface Props {
  onClose: () => void
  onCreated: (card: MemoryCard) => void
}

async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST', body: formData
  })
  const data = await res.json()
  if (!data.secure_url) throw new Error('Fotoğraf yüklenemedi')
  return { url: data.secure_url, publicId: data.public_id }
}

export default function CreateCardModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [meaning, setMeaning] = useState('')
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 3 - photos.length
    const toAdd = files.slice(0, remaining)
    toAdd.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        setPhotos(prev => [...prev, { file, preview: reader.result as string }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!title || !date || !meaning || photos.length === 0) {
      setError('Lütfen tüm alanları doldur ve en az 1 fotoğraf ekle 🌸')
      return
    }
    setUploading(true)
    setError('')
    try {
      const uploaded = await Promise.all(photos.map(p => uploadToCloudinary(p.file)))
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, date, meaning,
          imageUrl: uploaded[0].url,
          imagePublicId: uploaded[0].publicId,
          photos: uploaded.map(u => u.url),
        }),
      })
      if (!res.ok) throw new Error('Kart kaydedilemedi')
      const card: MemoryCard = await res.json()
      onCreated(card)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(253, 232, 232, 0.4)',
    border: '1px solid rgba(201, 168, 76, 0.3)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#5a3e3e',
    fontSize: '0.95rem',
    fontFamily: 'Lato, sans-serif',
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    color: '#c9a84c',
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    fontFamily: 'Lato, sans-serif',
    fontWeight: 700,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={onClose}>
      <div
        className="w-full max-w-md fade-in"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(253, 246, 236, 0.97)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(201, 168, 76, 0.3)',
          padding: '2rem',
          boxShadow: '0 30px 80px rgba(90, 62, 62, 0.25)',
          maxHeight: '90vh',
          overflowY: 'scroll',
          scrollbarWidth: 'none' as const,
          overflowY: 'auto',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display" style={{ fontSize: '1.8rem', color: '#5a3e3e', fontWeight: 400 }}>
            Yeni Anı ♡
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#c9a0a0', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={labelStyle}>FOTOĞRAFLAR ({photos.length}/3)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
              {photos.map((p, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden' }}>
                  <img src={p.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => removePhoto(i)}
                    style={{
                      position: 'absolute', top: '4px', right: '4px',
                      background: 'rgba(90,62,62,0.7)', border: 'none',
                      borderRadius: '50%', width: '22px', height: '22px',
                      color: '#fff', fontSize: '0.7rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >✕</button>
                </div>
              ))}
              {photos.length < 3 && (
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    aspectRatio: '1',
                    border: '2px dashed rgba(201, 168, 76, 0.4)',
                    borderRadius: '10px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', background: 'rgba(253, 232, 232, 0.3)',
                    color: '#c9a84c', fontSize: '1.5rem',
                  }}
                >
                  <span>+</span>
                  <span style={{ fontSize: '0.65rem', marginTop: '2px', letterSpacing: '0.05em' }}>EKLE</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
          </div>

          <div>
            <label style={labelStyle}>BAŞLIK</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Bu günün başlığı..." style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>TARİH</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>ANLAM & ÖNEMİ</label>
            <textarea value={meaning} onChange={e => setMeaning(e.target.value)} placeholder="Bu gün senin için ne ifade ediyor?..." rows={4} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
          </div>

          {error && <p style={{ color: '#c27070', fontSize: '0.85rem', fontFamily: 'Lato' }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="gold-shimmer font-body"
            style={{
              borderRadius: '12px', padding: '14px', color: '#fff',
              fontSize: '0.9rem', letterSpacing: '0.1em', fontWeight: 700,
              cursor: uploading ? 'not-allowed' : 'pointer', border: 'none',
              opacity: uploading ? 0.7 : 1, marginTop: '0.5rem',
            }}
          >
            {uploading ? '💫 Yükleniyor...' : '✦ ANI KAYDET'}
          </button>
        </div>
      </div>
    </div>
  )
}
