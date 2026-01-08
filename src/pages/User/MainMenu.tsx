import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocale } from '../../i18n/LocaleContext'

type MenuStep = 'initial' | 'showOptions'
type Mode = 'checkin' | 'checkout'

export const MainMenu: FC = () => {
  const { locale, setLocale, t } = useLocale()
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
         <div className="absolute top-[5%] right-[5%] z-20 font-bold flex items-center gap-6 text-sm text-gray-500">
          <button
            type="button"
            onClick={() => setLocale('vi')}
            aria-pressed={locale === 'vi'}
            className={`focus:outline-none ${
              locale === 'vi'
                ? 'underline decoration-2 underline-offset-4 text-indigo-700'
                : 'text-gray-400 hover:text-indigo-600'
            }`}
          >
            {t.language.vietnamese}
          </button>
          <span className="text-gray-300 select-none">|</span>
          <button
            type="button"
            onClick={() => setLocale('en')}
            aria-pressed={locale === 'en'}
            className={`focus:outline-none ${
              locale === 'en'
                ? 'underline decoration-2 underline-offset-4 text-indigo-700'
                : 'text-gray-400 hover:text-indigo-600'
            }`}
          >
            {t.language.english}
          </button>
        </div>
      {step === 'initial' && (
        <div className="border border-gray-300 bg-white p-8 rounded-lg w-full max-w-4xl">
          <div className="flex justify-center gap-8">
            <button
              onClick={handleCheckInClick}
              className="bg-yellow-400 text-black px-12 py-6 rounded-lg font-semibold text-lg hover:bg-yellow-500 shadow-md"
            >
              {t.mainMenu.checkIn}
            </button>
            <button
              onClick={handleCheckOutClick}
              className="bg-yellow-400 text-black px-12 py-6 rounded-lg font-semibold text-lg hover:bg-yellow-500 shadow-md"
            >
              {t.mainMenu.checkOut}
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
                {t.mainMenu.resident}
              </button>
             {mode === 'checkin' && (
                <button
                  onClick={() => navigate('/select-service-guest', { state: { mode } })}
                  className="bg-yellow-400 text-black px-12 py-6 rounded-lg font-semibold text-lg hover:bg-yellow-500 shadow-md"
                >
                  {t.mainMenu.outsideResident}
                </button>
              )}
              {mode === 'checkout' && (
                <button
                  onClick={() => navigate('/guest-checkout', { state: { mode } })}
                  className="bg-yellow-400 text-black px-12 py-6 rounded-lg font-semibold text-lg hover:bg-yellow-500 shadow-md"
                >
                  {t.mainMenu.outsideResident}
                </button>
              )}
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="bg-yellow-400 text-black px-12 py-6 rounded-lg font-semibold text-lg hover:bg-yellow-500 shadow-md"
            >
              {t.mainMenu.manage}
            </button>

            <button
              onClick={handleBack}
              className="mt-4 text-gray-600 underline text-sm"
            >
              {t.common.back}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainMenu
