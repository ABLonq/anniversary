import fs from 'fs'
import path from 'path'
import { MemoryCard } from './types'

const DATA_FILE = path.join(process.cwd(), 'data', 'cards.json')

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]))
  }
}

export function getCards(): MemoryCard[] {
  ensureDataFile()
  const raw = fs.readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(raw)
}

export function saveCard(card: MemoryCard): void {
  const cards = getCards()
  cards.push(card)
  fs.writeFileSync(DATA_FILE, JSON.stringify(cards, null, 2))
}

export function deleteCard(id: string): void {
  const cards = getCards().filter(c => c.id !== id)
  fs.writeFileSync(DATA_FILE, JSON.stringify(cards, null, 2))
}
