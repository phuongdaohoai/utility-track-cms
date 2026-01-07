import React, { useEffect, useMemo, useState } from "react";
import { CheckInItem } from "../services/checkInService";
import { useLocale } from "../i18n/LocaleContext";

type MemberState = {
  id: string;
  name: string;
  checked: boolean;
  isRepresentative?: boolean;
};

interface CheckoutDetailModalProps {
  visible: boolean;
  item?: CheckInItem;
  onClose: () => void;
  onSavePartial: (id: number, guests: string[]) => Promise<void>;
  onCheckoutAll: (id: number) => Promise<void>;
  loading?: boolean;
}

const formatDateTime = (iso?: string) => {
  if (!iso) return "--";
  const date = new Date(iso);
  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const day = date.toLocaleDateString("vi-VN");
  return `${day} ${time}`;
};

const buildMembers = (item?: CheckInItem): MemberState[] => {
  if (!item) return [];

  // Đại diện (không được checkout riêng lẻ)
  const representativeName = item.displayName || item.representative || "Chưa có tên";
  const representative: MemberState = {
    id: "rep",
    name: representativeName,
    checked: false,
    isRepresentative: true,
  };

  // Khách đi kèm
  const guests: string[] = Array.isArray(item.additionalGuests)
    ? item.additionalGuests
    : typeof item.additionalGuests === "string"
      ? (item.additionalGuests as string).split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

  const guestMembers = guests.map((name, idx) => ({
    id: `${idx}`,
    name: name || "Chưa có tên",
    checked: false,
  }));

  return [representative, ...guestMembers];
};

const CheckoutDetailModal: React.FC<CheckoutDetailModalProps> = ({
  visible,
  item,
  onClose,
  onSavePartial,
  onCheckoutAll,
  loading = false,
}) => {
  const { t } = useLocale()
  const [members, setMembers] = useState<MemberState[]>([]);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    setMembers(buildMembers(item));
  }, [item]);

  const selectableMembers = useMemo(
    () => members.filter((m) => !m.isRepresentative),
    [members]
  );

  const checkedCount = useMemo(
    () => selectableMembers.filter((m) => m.checked).length,
    [selectableMembers]
  );

  if (!visible || !item) return null;

  const toggleMember = (id: string, checked: boolean) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, checked: m.isRepresentative ? false : checked }
          : m
      )
    );
  };

  const handleSave = async () => {
    if (checkedCount === 0) {
      alert(t.checkoutDetail.selectAtLeastOneGuest);
      return;
    }
    const guestsToCheckout = selectableMembers
      .filter((m) => m.checked)
      .map((m) => m.name);

    setLocalLoading(true);
    try {
      await onSavePartial(item.id, guestsToCheckout);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCheckoutAll = async () => {
    setLocalLoading(true);
    // Đánh dấu toàn bộ đã checkout để vô hiệu hóa nút trước khi đóng
    setMembers((prev) => prev.map((m) => ({ ...m, checked: true })));
    try {
      await onCheckoutAll(item.id);
    } finally {
      setLocalLoading(false);
    }
  };

  const disabled = loading || localLoading;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/50 px-4 overflow-y-auto py-6">
      <div className="w-full max-w-5xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-sm text-gray-500">{t.checkoutDetail.title}</p>
            <p className="text-xl font-semibold text-gray-800">
              {item.displayName || item.representative || t.checkoutDetail.checkoutInfo}
            </p>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            disabled={disabled}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-6 py-5 max-h-[78vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              {t.checkoutDetail.representative}
              <input
                disabled
                value={item.representative || item.displayName || "--"}
                className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              {t.checkoutDetail.phone}
              <input
                disabled
                value={item.phoneNumber || item.phone || "--"}
                className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              {t.checkoutDetail.service}
              <input
                disabled
                value={item.serviceName}
                className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 font-semibold"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              {t.checkoutDetail.checkinMethod}
              <input
                disabled
                value={item.method || t.checkoutDetail.manual}
                className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              {t.checkoutDetail.checkInTime}
              <input
                disabled
                value={formatDateTime(item.checkInTime)}
                className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
              />
            </label>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {t.checkoutDetail.selectableGuests}
                </span>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {checkedCount}/{selectableMembers.length} {t.checkoutDetail.selected}
                </span>
              </div>
            </div>

            <div className="max-h-[360px] overflow-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50 text-left text-sm font-semibold text-gray-700">
                  <tr>
                    <th className="w-20 border-b border-gray-200 px-4 py-3">
                      {t.checkoutDetail.stt}
                    </th>
                    <th className="border-b border-gray-200 px-4 py-3">
                      {t.checkoutDetail.fullName}
                    </th>
                    <th className="w-64 border-b border-gray-200 px-4 py-3">
                      {t.checkoutDetail.action}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, idx) => (
                    <tr key={m.id} className="text-sm">
                      <td className="border-b border-gray-100 px-4 py-3 text-gray-700">
                        {idx + 1}
                      </td>
                      <td className="border-b border-gray-100 px-4 py-3 text-gray-800">
                        {m.name}
                      </td>
                      <td className="border-b border-gray-100 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            className={`rounded px-3 py-2 text-sm font-semibold text-white transition ${
                              m.isRepresentative
                                ? "bg-gray-300"
                                : m.checked
                                  ? "bg-gray-300"
                                  : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                            onClick={() => toggleMember(m.id, true)}
                            disabled={m.checked || m.isRepresentative || disabled}
                          >
                            {t.checkoutDetail.checkout}
                          </button>
                          <button
                            className={`rounded px-3 py-2 text-sm font-semibold transition ${
                              m.checked && !m.isRepresentative
                                ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                : "bg-gray-100 text-gray-400"
                            }`}
                            onClick={() => toggleMember(m.id, false)}
                            disabled={!m.checked || m.isRepresentative || disabled}
                          >
                            {t.checkoutDetail.undo}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-sm text-gray-500"
                        colSpan={3}
                      >
                        {t.checkoutDetail.noMemberData}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={disabled}
              className="rounded-lg bg-gray-500 px-6 py-3 text-base font-semibold text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t.checkoutDetail.back}
            </button>
            <button
              onClick={handleSave}
              disabled={disabled || checkedCount === 0}
              className="rounded-lg bg-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {localLoading && checkedCount > 0 ? t.checkoutDetail.saving : t.checkoutDetail.save}
            </button>
            <button
              onClick={handleCheckoutAll}
              disabled={disabled}
              className="rounded-lg bg-blue-800 px-8 py-3 text-base font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {localLoading ? t.checkoutDetail.checkingOut : t.checkoutDetail.checkoutAll}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDetailModal;

