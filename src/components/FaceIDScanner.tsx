import { useRef, useEffect, useState } from 'react'
import * as faceapi from 'face-api.js'
import { loadFaceModels } from '../utils/faceApi'

interface FaceIDScannerProps {
  onScan: (descriptor: number[]) => void
  onClose: () => void
  title?: string
}

export const FaceIDScanner: React.FC<FaceIDScannerProps> = ({ onScan, onClose, title = 'Quét Face ID' }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    const startScanning = async () => {
      try {
        setError(null)
        setScanning(true)

        await loadFaceModels()

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        })

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (err) {
        console.error(err)
        setError('Không thể truy cập camera')
      }
    }

    startScanning()
    return stopScanning
  }, [])


  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }

 const captureFace = async () => {
  if (!videoRef.current || capturing) return

  setCapturing(true)

  const video = videoRef.current

  const detection = await faceapi
    .detectSingleFace(
      video,
      new faceapi.TinyFaceDetectorOptions()
    )
    .withFaceLandmarks()
    .withFaceDescriptor()

  if (!detection) {
    setError('Không phát hiện khuôn mặt')
    setCapturing(false)
    return
  }

  const descriptor = Array.from(detection.descriptor) // Float32Array → number[]

  console.log('🧠 Face descriptor (128):', descriptor)

  onScan(descriptor)
  stopScanning()
  onClose()
}


  const handleClose = () => {
    stopScanning()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full rounded-lg"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlay hướng dẫn */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-4 border-blue-500 rounded-full w-48 h-48"></div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black bg-opacity-50 px-4 py-2 rounded">
              Đưa khuôn mặt vào khung hình
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Hủy
          </button>
          {!error && (
            <button
              onClick={captureFace}
              disabled={capturing}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {capturing ? 'Đang xử lý...' : 'Chụp ảnh'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

