import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'

type MenuStep = 'initial' | 'showOptions'
type Mode = 'checkin' | 'checkout'

export const MainMenu: FC = () => {
  const [step, setStep] = useState<MenuStep>('initial')
  const [mode, setMode] = useState<Mode>('checkin')
  const navigate = useNavigate()

  const handleCheckInClick = () => {
    setMode('checkin')
    setStep('showOptions')
  }

  const handleCheckOutClick = () => {
    setMode('checkout')
    setStep('showOptions')
  }

  const handleBack = () => {
    setStep('initial')
  }

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col items-center justify-center gap-8">
      {step === 'initial' && (
        <div className="border border-gray-300 bg-white p-8 rounded-lg w-full max-w-4xl">
          <div className="flex justify-center gap-8">
            <button
              onClick={handleCheckInClick}
              className="bg-yellow-400 text-black px-12 py-6 rounded-lg font-semibold text-lg hover:bg-yellow-500 shadow-md"
            >
              Check in
            </button>
            <button
              onClick={handleCheckOutClick}
              className="bg-yellow-400 text-black px-12 py-6 rounded-lg font-semibold text-lg hover:bg-yellow-500 shadow-md"
            >
              Check out
            </button>
          </div>
        </div>
      )}

      {step === 'showOptions' && (
        <div className="border border-gray-300 bg-white p-8 rounded-lg w-full max-w-4xl">
          <div className="flex flex-col items-center gap-8">
            <div className="flex justify-center gap-8">
              <button
                onClick={() => navigate('/screen-checkin', { state: { mode } })}
                className="bg-yellow-400 text-black px-12 py-6 rounded-lg font-semibold text-lg hover:bg-yellow-500 shadow-md"
              >
                Cư dân CC
              </button>
              <button
                onClick={() => navigate('/select-service-guest')}
                className="bg-yellow-400 text-black px-12 py-6 rounded-lg font-semibold text-lg hover:bg-yellow-500 shadow-md"
              >
                Cư dân ngoài
              </button>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="bg-yellow-400 text-black px-12 py-6 rounded-lg font-semibold text-lg hover:bg-yellow-500 shadow-md"
            >
              Quản lý
            </button>

            <button
              onClick={handleBack}
              className="mt-4 text-gray-600 underline text-sm"
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
