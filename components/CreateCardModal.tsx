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
    fontSize: '0.9
