import { useRef, useEffect, useState } from 'react'
import * as faceapi from 'face-api.js'
import { loadFaceModels } from '../utils/faceApi'

interface FaceIDScannerProps {
  onScan: (descriptor: number[]) => void
  onClose: () => void
  title?: string
}

/**
 * Xin quyền camera trước (UX chuẩn)
 */
const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch {
    return false
  }
}

export const FaceIDScanner: React.FC<FaceIDScannerProps> = ({
  onScan,
  onClose,
  title = 'Quét Face ID',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [capturing, setCapturing] = useState(false)

  /**
   * Bắt đầu camera
   */
  const startCamera = async () => {
    try {
      setError(null)
      setLoading(true)

      // 1️⃣ Load model FaceAPI
      await loadFaceModels()

      // 2️⃣ Xin quyền camera
      const granted = await requestCameraPermission()
      if (!granted) {
        setError('Bạn cần cho phép truy cập camera')
        setLoading(false)
        return
      }

      // 3️⃣ Mở camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setLoading(false)
    } catch (err: any) {
      console.error(err)

      if (err.name === 'NotAllowedError') {
        setError('Bạn đã từ chối quyền camera')
      } else if (err.name === 'NotFoundError') {
        setError('Không tìm thấy camera')
      } else {
        setError('Không thể truy cập camera')
      }

      setLoading(false)
    }
  }

  /**
   * Dừng camera
   */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  /**
   * Chụp & lấy Face Descriptor
   */
  const captureFace = async () => {
  if (!videoRef.current || capturing) return

  setCapturing(true)
  setError(null)

  try {
    const detection = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!detection) {
      setError('Không phát hiện khuôn mặt')
      setCapturing(false)
      return
    }

    const descriptor = Array.from(detection.descriptor)

    stopCamera()
    onScan(descriptor)
  } catch {
    setError('Lỗi khi xử lý khuôn mặt')
  } finally {
    setCapturing(false)
  }
}


  /**
   * Đóng modal
   */
  const handleClose = () => {
    stopCamera()
    onClose()
  }

  /**
   * Lifecycle
   */
  useEffect(() => {
    startCamera()
    return stopCamera
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={handleClose} className="text-2xl text-gray-500">
            ×
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Video */}
        {!error && (
          <div className="relative">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Đang khởi động camera...
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full rounded-lg"
                  autoPlay
                  muted
                  playsInline
                />

                {/* Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 rounded-full border-4 border-blue-500"></div>
                </div>

                <div className="absolute bottom-2 left-0 right-0 text-center text-white bg-black bg-opacity-50 py-2 rounded">
                  Đưa khuôn mặt vào khung
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="bg-gray-500 text-white px-6 py-2 rounded"
          >
            Hủy
          </button>

          {!error && !loading && (
            <button
              onClick={captureFace}
              disabled={capturing}
              className="bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-400"
            >
              {capturing ? 'Đang xử lý...' : 'Chụp ảnh'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
