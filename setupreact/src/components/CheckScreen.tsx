import React, { useState } from "react";
import CheckinResidentForm from "../features/CheckIn/CheckinResidentForm";
import CheckinOutsiderForm from "../features/CheckIn/CheckinOutsiderForm";

export default function CheckFlow() {
  const [step, setStep] = useState("home");

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-10 p-4 bg-gray-100">

      {/* Bước 1: Chọn Checkin / Checkout */}
      {step === "home" && (
        <div className="flex gap-6">
          <button
            onClick={() => setStep("select-type")}
            className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-semibold shadow"
          >
            Check in
          </button>

          <button
            onClick={() => setStep("select-type")}
            className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-semibold shadow"
          >
            Check out
          </button>
        </div>
      )}

      {/* Bước 2: Chọn loại cư dân */}
      {step === "select-type" && (
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-6">
            <button
              onClick={() => setStep("resident")}
              className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-semibold shadow"
            >
              Cư dân CC
            </button>

            <button
              onClick={() => setStep("outsider")}
              className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-semibold shadow"
            >
              Cư dân ngoài
            </button>
          </div>

          <button
            onClick={() => setStep("manager")}
            className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-semibold shadow"
          >
            Quản lý
          </button>
        </div>
      )}
      {step === "resident" && <CheckinResidentForm />}
      {step === "outsider" && <CheckinOutsiderForm />}
      {step === "manager" && <div>Form quản lý sẽ ở đây</div>}
    </div>
  );
}
