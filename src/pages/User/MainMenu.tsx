import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'

type MenuStep = 'initial' | 'showOptions'

export const MainMenu: FC = () => {
  const [step, setStep] = useState<MenuStep>('initial')
  const navigate = useNavigate()

  const handleCheckInClick = () => {
    setStep('showOptions')
  }

  const handleCheckOutClick = () => {
    setStep('showOptions')
  }

  const handleBack = () => {
    setStep('initial')
  }

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col items-center justify-center gap-8">
      {/* Section 1: Check in / Check out (chỉ hiển thị ở bước đầu) */}
      {step === 'initial' && (
        <div className="border border-gray-300 bg-white p-8 rounded-lg w-full max-w-4xl">
          <div className="flex justify-center gap-8">
            <button
              onClick={handleCheckInClick}
              className="bg-yellow-400 text-black px-12 py-6 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-colors shadow-md"
            >
              Check in
            </button>
            <button
              onClick={handleCheckOutClick}
              className="bg-yellow-400 text-black px-12 py-6 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-colors shadow-md"
            >
              Check out
            </button>
          </div>
        </div>
      )}

      {/* Section 2: Options (chỉ hiển thị khi đã click Check in/Check out) */}
      {step === 'showOptions' && (
        <div className="border border-gray-300 bg-white p-8 rounded-lg w-full max-w-4xl">
          <div className="flex flex-col items-center gap-8">
            {/* Hàng trên: Cư dân CC và Cư dân ngoài */}
            <div className="flex justify-center gap-8">
              <button
                onClick={() => {
                  navigate('/screen-checkin')
                }}
                className="bg-yellow-400 text-black px-12 py-6 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-colors shadow-md"
              >
                Cư dân CC
              </button>
              <button
                onClick={() => {
                  navigate('/checkinoutside')
                }}
                className="bg-yellow-400 text-black px-12 py-6 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-colors shadow-md"
              >
                Cư dân ngoài
              </button>
            </div>

            {/* Hàng dưới: Quản lý */}
            <button
              onClick={() => {
                // TODO: Navigate to manager page
                console.log('Quản lý clicked')
              }}
              className="bg-yellow-400 text-black px-12 py-6 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-colors shadow-md"
            >
              Quản lý
            </button>

            {/* Nút quay lại */}
            <button
              onClick={handleBack}
              className="mt-4 text-gray-600 hover:text-gray-800 underline text-sm"
            >
              Quay lại
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainMenu

