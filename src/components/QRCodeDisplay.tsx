import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'

interface QRCodeDisplayProps {
  value: string
  title?: string
  size?: number
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  value, 
  title = 'QR Code',
  size = 256 
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      )}
      <div className="p-4 bg-white rounded border-2 border-gray-200">
        <QRCodeSVG value={value} size={size} level="H" />
      </div>
      <div className="mt-4 w-full">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={value}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <button
            onClick={handleCopy}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            {copied ? 'Đã copy!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}

