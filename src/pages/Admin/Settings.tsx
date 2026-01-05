import React, { useEffect, useState } from "react";
import axios from "axios";
import  { API_BASE_URL }from '../../utils/url'
import { useLocale } from '../../i18n/LocaleContext';
/* ================= AXIOS INSTANCE ================= */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      alert(t.settings.sessionExpired);
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/* ================= TYPES ================= */
interface ApiConfigItem {
  id: number;
  configKey: string;
  configValue: string;
  description: string;
}

interface CheckinItem {
  id: number;
  type: string;
  desc: string;
  status: "active" | "inactive";
}

/* ================= COMPONENT ================= */
const SystemConfiguration: React.FC = () => {
  const { t } = useLocale();
  /* ===== FORM STATE ===== */
  const [formState, setFormState] = useState({
    operatingHours: "",
    activity: "",
    guestCheckIn: t.settings.off,
  });

  /* ===== TABLE STATE ===== */
  const [checkinList, setCheckinList] = useState<CheckinItem[]>([]);
  const [editingItem, setEditingItem] = useState<CheckinItem | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH CONFIG ================= */
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/system_config");
      const data: ApiConfigItem[] = res.data.data;

      /* ===== FORM ===== */
      setFormState({
        operatingHours:
          data.find((i) => i.configKey === "OPERATION_HOURS")?.configValue || "",
        activity:
          data.find((i) => i.configKey === "SYSTEM_STATUS")?.description || "",
        guestCheckIn:
          data.find((i) => i.configKey === "GUEST_CHECKIN")?.configValue === "1"
            ? t.settings.on
            : t.settings.off,
      });

      /* ===== TABLE ===== */
      const methods = data.filter((i) => i.configKey.startsWith("METHOD_"));

      setCheckinList(
        methods.map((m) => ({
          id: m.id,
          type: mapMethodName(m.configKey, t),
          desc: m.description,
          status: m.configValue === "1" ? "active" : "inactive",
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= FORM HANDLERS ================= */
  const handleFormChange = (
    key: keyof typeof formState,
    value: string
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveForm = async () => {
    try {
      setLoading(true);

      await Promise.all([
        api.put("/system_config/general", {
          key: "OPERATION_HOURS",
          value: formState.operatingHours,
        }),
        api.put("/system_config/general", {
          key: "GUEST_CHECKIN",
          value: formState.guestCheckIn === t.settings.on ? "1" : "0",
        }),
      ]);

      alert(t.common.saveSuccess);
      fetchConfig();
    } finally {
      setLoading(false);
    }
  };

  /* ================= METHOD HANDLERS ================= */
  const handleEditItem = (item: CheckinItem) => {
    setEditingItem({ ...item });
  };

  const handleEditChange = (
    field: keyof CheckinItem,
    value: string
  ) => {
    if (!editingItem) return;
    setEditingItem((prev) =>
      prev ? { ...prev, [field]: value as any } : prev
    );
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    await api.put(`/system_config/method/${editingItem.id}`, {
      status: editingItem.status === "active" ? "1" : "0",
      description: editingItem.desc,
    });

    setEditingItem(null);
    fetchConfig();
  };

  /* ================= RENDER ================= */
  return (
    <div style={pageStyle}>
      {/* ================= FORM ================= */}
      <div style={boxStyle}>
        <FormRow label={t.settings.operatingHours}>
          <input
            style={inputStyle}
            value={formState.operatingHours}
            onChange={(e) =>
              handleFormChange("operatingHours", e.target.value)
            }
          />
        </FormRow>

        <FormRow label={t.settings.activity}>
          <input style={inputStyle} value={formState.activity} disabled />
        </FormRow>

        <FormRow label={t.settings.guestCheckIn}>
          <select
            style={inputStyle}
            value={formState.guestCheckIn}
            onChange={(e) =>
              handleFormChange("guestCheckIn", e.target.value)
            }
          >
            <option>{t.settings.on}</option>
            <option>{t.settings.off}</option>
          </select>
        </FormRow>

        <div style={{ textAlign: "right" }}>
          <button
            style={primaryBtn}
            onClick={handleSaveForm}
            disabled={loading}
          >
            {loading ? t.settings.saving : t.settings.saveInfo}
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <h3 style={titleStyle}>{t.settings.checkinMethods}</h3>

      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>{t.settings.methodType}</th>
              <th style={thStyle}>{t.settings.methodDescription}</th>
              <th style={thStyle}>{t.settings.methodStatus}</th>
              <th style={thStyle}>{t.common.actions}</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={tdStyle}>
                  {t.common.loading}
                </td>
              </tr>
            ) : (
              checkinList.map((item) => (
                <tr key={item.id} style={rowStyle}>
                  {editingItem?.id === item.id ? (
                    <>
                      <td style={tdStyle}>{item.type}</td>
                      <td style={tdStyle}>
                        <input
                          style={editInput}
                          value={editingItem.desc}
                          onChange={(e) =>
                            handleEditChange("desc", e.target.value)
                          }
                        />
                      </td>
                      <td style={tdStyle}>
                        <select
                          style={editInput}
                          value={editingItem.status}
                          onChange={(e) =>
                            handleEditChange("status", e.target.value)
                          }
                        >
                          <option value="active">{t.common.active}</option>
                          <option value="inactive">{t.common.inactive}</option>
                        </select>
                      </td>
                      <td style={tdStyle}>
                        <button style={iconBtn} onClick={handleSaveEdit}>
                          💾
                        </button>
                        <button
                          style={iconBtn}
                          onClick={() => setEditingItem(null)}
                        >
                          ❌
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={tdStyle}>{item.type}</td>
                      <td style={tdStyle}>{item.desc}</td>
                      <td style={tdStyle}>
                        <span
                          style={
                            item.status === "active"
                              ? badgeActive
                              : badgeInactive
                          }
                        >
                          {item.status === "active"
                            ? t.common.active
                            : t.common.inactive}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button
                          style={iconBtn}
                          onClick={() => handleEditItem(item)}
                        >
                          ✏️
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemConfiguration;

/* ================= HELPERS ================= */
const mapMethodName = (key: string, t: any) => {
  switch (key) {
    case "METHOD_CARD":
      return t.settings.methodTypes.card;
    case "METHOD_MANUAL":
      return t.settings.methodTypes.manual;
    case "METHOD_FACEID":
      return t.settings.methodTypes.faceId;
    case "METHOD_QR":
      return t.settings.methodTypes.qr;
    case "METHOD_FINGERPRINT":
      return t.settings.methodTypes.fingerprint;
    default:
      return key;
  }
};

/* ================= REUSABLE ================= */
const FormRow = ({ label, children }: any) => (
  <div style={formRowStyle}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

/* ================= STYLES ================= */
const pageStyle: React.CSSProperties = {
  fontFamily: "Arial, sans-serif",
};
const boxStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: 20,
  marginBottom: 24,
};
const formRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginBottom: 14,
  gap: 16,
};
const labelStyle: React.CSSProperties = {
  width: 260,
  fontWeight: 600,
};
const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #e5e7eb",
};
const primaryBtn: React.CSSProperties = {
  padding: "8px 20px",
  borderRadius: 6,
  background: "#143CA6",
  color: "#fff",
  fontWeight: 600,
  border: "none",
};
const titleStyle: React.CSSProperties = {
  marginBottom: 12,
  fontSize: 18,
  fontWeight: 600,
};
const tableWrapperStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  maxHeight: 400,
  overflowY: "auto",
};
const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};
const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  background: "#f9fafb",
  fontWeight: 700,
  textAlign: "left",
};
const rowStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e7eb",
};
const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
};
const badgeActive: React.CSSProperties = {
  background: "#d4f8dc",
  color: "#1fa940",
  padding: "4px 12px",
  borderRadius: 20,
  fontWeight: 600,
};
const badgeInactive: React.CSSProperties = {
  background: "#ffd6d6",
  color: "#ff4343",
  padding: "4px 12px",
  borderRadius: 20,
  fontWeight: 600,
};
const iconBtn: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  background: "#fff",
  borderRadius: 6,
  padding: "6px 10px",
  cursor: "pointer",
  marginRight: 6,
};
const editInput: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #e5e7eb",
};
