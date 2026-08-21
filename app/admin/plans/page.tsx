"use client";

import { useState, useEffect } from "react";
import { Edit2, Plus, Trash2, X, Check, XCircle, Loader2 } from "lucide-react";

interface PlanFeature {
  id?: string;
  key: string;
  value: string;
  label: string | null;
}

interface PlanTemplate {
  id?: string;
  templateId: string;
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  isActive: boolean;
  sortOrder: number;
  features: PlanFeature[];
  templates: PlanTemplate[];
}

const AVAILABLE_TEMPLATES = [
  { id: "single", name: "Đơn giản" },
  { id: "two-col", name: "Chuyên nghiệp" },
  { id: "sidebar", name: "Sáng tạo (Sidebar)" },
  { id: "harvard", name: "Harvard" },
];

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      setPlans(data.plans ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(JSON.parse(JSON.stringify(plan))); // deep copy
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        name: editingPlan.name,
        description: editingPlan.description,
        priceMonthly: editingPlan.priceMonthly,
        priceYearly: editingPlan.priceYearly,
        isActive: editingPlan.isActive,
        sortOrder: editingPlan.sortOrder,
        features: editingPlan.features.map(f => ({ key: f.key, value: f.value, label: f.label })),
        templates: editingPlan.templates.map(t => t.templateId),
      };

      const res = await fetch(`/api/admin/plans/${editingPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Cập nhật thành công!" });
        await fetchPlans();
        setTimeout(() => setEditingPlan(null), 1500);
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error ?? "Có lỗi xảy ra" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi kết nối server" });
    } finally {
      setSaving(false);
    }
  };

  const handleFeatureChange = (index: number, field: keyof PlanFeature, value: string) => {
    if (!editingPlan) return;
    const newFeatures = [...editingPlan.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setEditingPlan({ ...editingPlan, features: newFeatures });
  };

  const handleAddFeature = () => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, { key: "", value: "", label: "" }]
    });
  };

  const handleRemoveFeature = (index: number) => {
    if (!editingPlan) return;
    const newFeatures = [...editingPlan.features];
    newFeatures.splice(index, 1);
    setEditingPlan({ ...editingPlan, features: newFeatures });
  };

  const handleTemplateToggle = (templateId: string) => {
    if (!editingPlan) return;
    const hasTemplate = editingPlan.templates.some(t => t.templateId === templateId);
    let newTemplates = [...editingPlan.templates];
    
    if (hasTemplate) {
      newTemplates = newTemplates.filter(t => t.templateId !== templateId);
    } else {
      newTemplates.push({ templateId });
    }
    setEditingPlan({ ...editingPlan, templates: newTemplates });
  };

  if (loading) {
    return <div style={{ padding: 40, display: "flex", justifyContent: "center" }}><Loader2 className="spin" /></div>;
  }

  return (
    <div>
      <h1 className="admin-page-title">Quản lý Gói (Plans)</h1>

      <div className="plan-mgmt-grid">
        {plans.map((plan) => (
          <div key={plan.id} className={`plan-card ${!plan.isActive ? "plan-card--inactive" : ""}`}>
            <div className="plan-card-header">
              <h3 className="plan-card-name">{plan.name}</h3>
              <span className="plan-card-slug">{plan.slug}</span>
            </div>
            <div className="plan-card-desc">{plan.description}</div>
            
            <div className="plan-card-price">
              <div>
                <span className="price-val">{plan.priceMonthly.toLocaleString("vi-VN")}đ</span>
                <span className="price-unit">/ tháng</span>
              </div>
              <div>
                <span className="price-val">{plan.priceYearly.toLocaleString("vi-VN")}đ</span>
                <span className="price-unit">/ năm</span>
              </div>
            </div>

            <div className="plan-card-stats">
              <div><strong>{plan.features.length}</strong> features</div>
              <div><strong>{plan.templates.length}</strong> templates</div>
            </div>

            <button onClick={() => handleEdit(plan)} className="plan-edit-btn">
              <Edit2 size={15} /> Chỉnh sửa
            </button>
          </div>
        ))}
      </div>

      {editingPlan && (
        <div className="plan-modal-overlay">
          <div className="plan-modal">
            <div className="plan-modal-header">
              <h2>Sửa gói: {editingPlan.name} ({editingPlan.slug})</h2>
              <button className="plan-modal-close" onClick={() => setEditingPlan(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="plan-modal-body">
              {message && (
                <div className={`credit-message credit-message--${message.type}`} style={{ marginBottom: 20 }}>
                  {message.type === "success" ? <Check size={16} /> : <XCircle size={16} />}
                  {message.text}
                </div>
              )}

              <div className="plan-form-grid">
                <div className="admin-form-group">
                  <label className="admin-label">Tên gói</label>
                  <input
                    value={editingPlan.name}
                    onChange={e => setEditingPlan({...editingPlan, name: e.target.value})}
                    className="admin-input" required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Mô tả</label>
                  <input
                    value={editingPlan.description ?? ""}
                    onChange={e => setEditingPlan({...editingPlan, description: e.target.value})}
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Giá tháng (VNĐ)</label>
                  <input
                    type="number"
                    value={editingPlan.priceMonthly}
                    onChange={e => setEditingPlan({...editingPlan, priceMonthly: parseInt(e.target.value) || 0})}
                    className="admin-input" required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Giá năm (VNĐ)</label>
                  <input
                    type="number"
                    value={editingPlan.priceYearly}
                    onChange={e => setEditingPlan({...editingPlan, priceYearly: parseInt(e.target.value) || 0})}
                    className="admin-input" required
                  />
                </div>
              </div>

              <div className="plan-form-section">
                <h3 className="plan-section-title">Quyền truy cập Templates</h3>
                <div className="plan-templates-grid">
                  {AVAILABLE_TEMPLATES.map(t => (
                    <label key={t.id} className="plan-template-checkbox">
                      <input
                        type="checkbox"
                        checked={editingPlan.templates.some(pt => pt.templateId === t.id)}
                        onChange={() => handleTemplateToggle(t.id)}
                      />
                      <span>{t.name} <small>({t.id})</small></span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="plan-form-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 className="plan-section-title" style={{ margin: 0 }}>Cấu hình Features</h3>
                  <button type="button" onClick={handleAddFeature} className="plan-add-feature-btn">
                    <Plus size={14} /> Thêm Feature
                  </button>
                </div>
                
                <div className="plan-features-list">
                  {editingPlan.features.map((f, i) => (
                    <div key={i} className="plan-feature-row">
                      <input
                        placeholder="Key (vd: max_cv_count)"
                        value={f.key}
                        onChange={e => handleFeatureChange(i, "key", e.target.value)}
                        className="admin-input"
                      />
                      <input
                        placeholder="Value (vd: 2)"
                        value={f.value}
                        onChange={e => handleFeatureChange(i, "value", e.target.value)}
                        className="admin-input"
                      />
                      <input
                        placeholder="Label hiển thị"
                        value={f.label ?? ""}
                        onChange={e => handleFeatureChange(i, "label", e.target.value)}
                        className="admin-input"
                      />
                      <button type="button" onClick={() => handleRemoveFeature(i)} className="plan-feature-remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="plan-modal-footer">
                <label className="plan-active-toggle">
                  <input
                    type="checkbox"
                    checked={editingPlan.isActive}
                    onChange={e => setEditingPlan({...editingPlan, isActive: e.target.checked})}
                  />
                  Gói đang kích hoạt (Active)
                </label>
                
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={() => setEditingPlan(null)} className="plan-btn-cancel">
                    Hủy
                  </button>
                  <button type="submit" disabled={saving} className="admin-submit-btn" style={{ margin: 0, padding: "10px 24px" }}>
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
