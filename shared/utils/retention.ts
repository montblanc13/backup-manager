// Conversion du volume de rétention saisi (M / G) en octets, et inversement.
// Convention binaire : 1 M = 1024 * 1024 octets, 1 G = 1024 * 1024 * 1024 octets.

export type VolumeUnit = 'M' | 'G'

export const VOLUME_UNITS: Record<VolumeUnit, number> = {
  M: 1024 ** 2,
  G: 1024 ** 3
}

/**
 * Convertit une valeur saisie (décimales acceptées, ex. 1,5) et son unité en octets.
 * Retourne null si la saisie est vide, NaN si elle est invalide (non numérique ou <= 0).
 */
export function volumeToBytes(input: string | number | null | undefined, unit: VolumeUnit): number | null {
  if (input === null || input === undefined) return null
  const text = String(input).trim().replace(',', '.')
  if (text === '') return null
  const value = Number(text)
  if (!Number.isFinite(value) || value <= 0) return Number.NaN
  const bytes = Math.round(value * VOLUME_UNITS[unit])
  return bytes >= 1 ? bytes : Number.NaN
}

/** Représente un nombre d'octets en valeur + unité (G si multiple exact d'un Go, sinon M) */
export function bytesToVolume(bytes: number | null | undefined): { value: string, unit: VolumeUnit } {
  if (!bytes || bytes <= 0) return { value: '', unit: 'G' }
  if (bytes % VOLUME_UNITS.G === 0) return { value: String(bytes / VOLUME_UNITS.G), unit: 'G' }
  // Arrondi à 2 décimales pour l'affichage (perte possible si la valeur vient d'un appel API direct)
  const mega = Math.round((bytes / VOLUME_UNITS.M) * 100) / 100
  return { value: String(mega), unit: 'M' }
}
