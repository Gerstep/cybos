import type { BriefData, BriefListResponse, ApiError } from './types'

const API_BASE = '/api'

/**
 * Fetch brief for a specific day
 */
export async function fetchBrief(day: string): Promise<BriefData> {
  const res = await fetch(`${API_BASE}/brief/${day}`)
  const data = await res.json()

  if (!res.ok) {
    const error = data as ApiError
    throw new Error(error.message || error.error || 'Failed to fetch brief')
  }

  return data as BriefData
}

/**
 * List available briefs
 */
export async function fetchBriefList(): Promise<BriefListResponse> {
  const res = await fetch(`${API_BASE}/briefs`)
  const data = await res.json()

  if (!res.ok) {
    const error = data as ApiError
    throw new Error(error.message || error.error || 'Failed to list briefs')
  }

  return data as BriefListResponse
}

/**
 * Check server health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`)
    return res.ok
  } catch {
    return false
  }
}
