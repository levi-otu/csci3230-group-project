import { ref } from 'vue'

const API_URL = 'http://localhost:3000'

export interface DrawingMeta {
  id: number
  userId: number
  sessionId: number | null
  imageMimeType: string
  createdAt: string
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function useDrawings() {
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const drawings = ref<DrawingMeta[]>([])

  async function saveCanvas(sessionId: number | null, canvas: HTMLCanvasElement): Promise<boolean> {
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          error.value = 'Failed to read canvas'
          resolve(false)
          return
        }

        const formData = new FormData()
        formData.append('image', blob, 'figure.png')
        if (sessionId !== null) {
          formData.append('sessionId', String(sessionId))
        }

        error.value = null
        isLoading.value = true
        try {
          const res = await fetch(`${API_URL}/drawings`, {
            method: 'POST',
            headers: authHeaders(),
            body: formData,
          })

          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            error.value = data.error || 'Failed to save canvas'
            resolve(false)
          } else {
            resolve(true)
          }
        } catch {
          error.value = 'Unable to connect to server'
          resolve(false)
        } finally {
          isLoading.value = false
        }
      }, 'image/png')
    })
  }

  async function listDrawings(): Promise<DrawingMeta[]> {
    error.value = null
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/drawings`, { headers: authHeaders() })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || 'Failed to load drawings'
        return []
      }
      drawings.value = data.drawings
      return data.drawings
    } catch {
      error.value = 'Unable to connect to server'
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function downloadDrawing(id: number, filename: string) {
    const res = await fetch(`${API_URL}/drawings/${id}/download`, { headers: authHeaders() })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return { error, isLoading, drawings, saveCanvas, listDrawings, downloadDrawing }
}
