'use client'

import { useState, useRef } from 'react'
import { MemoryCard } from '@/lib/types'

// !! Buraya kendi Cloudinary bilgilerini gir
const CLOUDINARY_CLOUD_NAME = 'dfkran2o4'
const CLOUDINARY_UPLOAD_PRESET = 'anniversary_unsigned'

interface Props {
  onClose: () => void
  onCreated: (card: MemoryCard) => void
}

export default function CreateCardModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [meaning, setMeaning] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!title || !date || !meaning || !imageFile) {
      setError('Lütfen tüm alanları doldur 🌸')
      return
    }

    setUploading(true)
    setError('')

    try {
      // 1) Upload to Cloudinary
      const formData = new FormData()
      formData.append('file', imageFile)
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const uploadData = await uploadRes.json()

      if (!uploadData.secure_url) throw new Error('Fotoğraf yüklenemedi')

      // 2) Save card
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          date,
          meaning,
          imageUrl: uploadData.secure_url,
          imagePublicId: uploadData.public_id,
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={onClose}
    >
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
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display" style={{ fontSize: '1.8rem', color: '#5a3e3e', fontWeight: 400 }}>
            Yeni Anı ♡
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none',
              color: '#c9a0a0', fontSize: '1.2rem', cursor: 'pointer',
            }}
          >✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Photo upload */}
          <div>
            <label style={labelStyle}>FOTOĞRAF</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed rgba(201, 168, 76, 0.4)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: imagePreview ? 'transparent' : 'rgba(253, 232, 232, 0.3)',
                overflow: 'hidden',
                minHeight: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.7)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.4)')}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                />
              ) : (
                <div>
                  <p style={{ color: '#c9a84c', fontSize: '2rem', marginBottom: '0.5rem' }}>🌸</p>
                  <p className="font-body" style={{ color: '#a07070', fontSize: '0.85rem' }}>
                    Fotoğraf seçmek için tıkla
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{ display: 'none' }}
            />
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>BAŞLIK</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Bu günün başlığı..."
              style={inputStyle}
            />
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>TARİH</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Meaning */}
          <div>
            <label style={labelStyle}>ANLAM & ÖNEMİ</label>
            <textarea
              value={meaning}
              onChange={e => setMeaning(e.target.value)}
              placeholder="Bu gün senin için ne ifade ediyor? Neden özel?..."
              rows={4}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
            />
          </div>

          {error && (
            <p style={{ color: '#c27070', fontSize: '0.85rem', fontFamily: 'Lato' }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="gold-shimmer font-body"
            style={{
              borderRadius: '12px',
              padding: '14px',
              color: '#fff',
              fontSize: '0.9rem',
              letterSpacing: '0.1em',
              fontWeight: 700,
              cursor: uploading ? 'not-allowed' : 'pointer',
              border: 'none',
              opacity: uploading ? 0.7 : 1,
              marginTop: '0.5rem',
            }}
          >
            {uploading ? '💫 Yükleniyor...' : '✦ ANI KAYDET'}
          </button>
        </div>
      </div>
    </div>
  )
}
