import { useRef, useEffect, useState } from 'react'
import jsQR from 'jsqr'

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
  title?: string
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, title = 'Quét QR Code' }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    let animationFrameId: number

    const startScanning = async () => {
      try {
        setError(null)
        setScanning(true)

        // Yêu cầu quyền camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // Ưu tiên camera sau (mobile) hoặc camera mặc định (laptop)
        })

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }

        const scan = () => {
          if (videoRef.current && canvasRef.current) {
            if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              const canvas = canvasRef.current
              const video = videoRef.current

              canvas.height = video.videoHeight
              canvas.width = video.videoWidth

              const ctx = canvas.getContext('2d')
              if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

                const code = jsQR(imageData.data, imageData.width, imageData.height)

                if (code) {
                  // Tìm thấy QR code
                  onScan(code.data)
                  stopScanning()
                  return
                }
              }
            }
          }
          animationFrameId = requestAnimationFrame(scan)
        }

        scan()
      } catch (err: any) {
        console.error('Lỗi khi truy cập camera:', err)
        setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.')
        setScanning(false)
      }
    }

    startScanning()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      stopScanning()
    }
  }, [onScan])

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
              <div className="border-4 border-blue-500 rounded-lg w-64 h-64"></div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black bg-opacity-50 px-4 py-2 rounded">
              Đưa QR code vào khung hình
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleClose}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

