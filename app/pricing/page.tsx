"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, Zap, Crown, Star, Loader2, PartyPopper } from "lucide-react";

interface PlanFeature {
  id: string;
  key: string;
  value: string;
  label: string | null;
}

interface Plan {
  id: string;
  name: string;
  slug: "FREE" | "PRO" | "PREMIUM";
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  features: PlanFeature[];
}

function getDisplayFeatures(features: PlanFeature[]): string[] {
  return features
    .filter((f) => f.label && f.value !== "false")
    .map((f) => f.label as string);
}

function PricingPageContent() {
  const { data: session }  = useSession();
  const router             = useRouter();
  const searchParams       = useSearchParams();

  const [interval, setInterval]         = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [loading, setLoading]           = useState<string | null>(null);
  const [message, setMessage]           = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [plans, setPlans]               = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => setPlans(d.plans ?? []))
      .catch(() => setPlansError("Không thể tải danh sách gói. Vui lòng thử lại."))
      .finally(() => setPlansLoading(false));
  }, []);

  useEffect(() => {
    if (searchParams.get("success") === "true")
      setMessage({ type: "success", text: "Thanh toán thành công! Tài khoản đang được kích hoạt..." });
    if (searchParams.get("cancelled") === "true")
      setMessage({ type: "error", text: "Thanh toán đã bị hủy. Bạn có thể thử lại bất cứ lúc nào." });
  }, [searchParams]);

  const handleUpgrade = async (plan: Plan) => {
    if (plan.slug === "FREE") { router.push("/auth"); return; }
    if (!session) { router.push(`/auth?callbackUrl=/pricing`); return; }

    setLoading(plan.slug);
    try {
      const res  = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, billingInterval: interval }),
      });
      const data = await res.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else setMessage({ type: "error", text: data.error ?? "Có lỗi xảy ra" });
    } catch {
      setMessage({ type: "error", text: "Không thể kết nối máy chủ" });
    } finally {
      setLoading(null);
    }
  };

  const formatPrice = (price: number) =>
    price === 0
      ? "Miễn phí"
      : new Intl.NumberFormat("vi-VN").format(price) + "₫";

  return (
    <section className="pricing-section">
      <div className="container">

        {/* Header */}
        <div className="section-header">
          <h1 className="section-title">Chọn gói phù hợp với bạn</h1>
          <p className="section-subtitle">
            Bắt đầu miễn phí. Nâng cấp khi cần thêm sức mạnh AI.
          </p>
        </div>

        {/* Toggle */}
        <div className="pricing-toggle">
          <button
            className={`pricing-toggle-btn${interval === "MONTHLY" ? " active" : ""}`}
            onClick={() => setInterval("MONTHLY")}
          >
            Hàng tháng
          </button>
          <button
            className={`pricing-toggle-btn${interval === "YEARLY" ? " active" : ""}`}
            onClick={() => setInterval("YEARLY")}
          >
            Hàng năm&nbsp;<span className="pricing-save-badge">-20%</span>
          </button>
        </div>

        {/* Payment result message */}
        {message && (
          <div className={`pricing-message pricing-message-${message.type}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {message.type === "success" && <PartyPopper size={18} />}
            {message.text}
          </div>
        )}

        {/* Loading */}
        {plansLoading && (
          <div className="pricing-loading">
            <Loader2 size={36} className="pricing-spinner" />
            <p>Đang tải danh sách gói...</p>
          </div>
        )}

        {/* Error */}
        {plansError && !plansLoading && (
          <div className="pricing-error">
            <p>{plansError}</p>
            <button className="pricing-retry-btn" onClick={() => window.location.reload()}>
              Thử lại
            </button>
          </div>
        )}

        {/* Plan cards */}
        {!plansLoading && !plansError && (
          <div className="pricing-grid">
            {plans.map((plan) => {
              const highlight       = plan.slug === "PRO";
              const displayFeatures = getDisplayFeatures(plan.features);
              const price           = interval === "MONTHLY" ? plan.priceMonthly : plan.priceYearly;

              return (
                <div key={plan.slug} className={`pricing-card${highlight ? " pricing-card-highlight" : ""}`}>
                  {highlight && <div className="pricing-popular-badge"><Star size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> Phổ biến nhất</div>}

                  {/* Plan name + icon */}
                  <div className="pricing-plan-header">
                    <div className="pricing-plan-icon">
                      {plan.slug === "PREMIUM" && <Crown size={20} />}
                      {plan.slug === "PRO"     && <Zap   size={20} />}
                      {plan.slug === "FREE"    && <Star  size={20} />}
                    </div>
                    <span className="pricing-plan-name">{plan.name}</span>
                  </div>

                  {/* Price */}
                  <div className="pricing-price">
                    <span className="pricing-amount">{formatPrice(price)}</span>
                    {plan.priceMonthly > 0 && (
                      <span className="pricing-period">
                        /{interval === "MONTHLY" ? "tháng" : "năm"}
                      </span>
                    )}
                  </div>
                  <p className="pricing-desc">{plan.description}</p>

                  {/* Features */}
                  <ul className="pricing-features">
                    {displayFeatures.map((f) => (
                      <li key={f} className="pricing-feature-item">
                        <Check size={14} className="pricing-check" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    className={`pricing-cta-btn${highlight ? " pricing-cta-primary" : " pricing-cta-outline"}`}
                    onClick={() => handleUpgrade(plan)}
                    disabled={loading === plan.slug}
                  >
                    {loading === plan.slug
                      ? "Đang xử lý..."
                      : plan.slug === "FREE"    ? "Bắt đầu miễn phí"
                      : plan.slug === "PRO"     ? "Nâng cấp Pro"
                      : "Nâng cấp Premium"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="pricing-loading"><Loader2 size={36} className="pricing-spinner" /><p>Đang tải danh sách gói...</p></div>}>
      <PricingPageContent />
    </Suspense>
  );
}