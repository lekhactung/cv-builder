"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, Zap, Crown, Star, Loader2 } from "lucide-react";
import Link from "next/link";

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

export default function PricingSection() {
  const { data: session } = useSession();
  const router = useRouter();

  const [interval, setInterval] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [loading, setLoading]   = useState<string | null>(null);
  const [plans, setPlans]       = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((d) => setPlans(d.plans ?? []))
      .catch(() => {})
      .finally(() => setPlansLoading(false));
  }, []);

  const handleUpgrade = async (plan: Plan) => {
    if (plan.slug === "FREE") {
      router.push("/auth");
      return;
    }
    if (!session) {
      router.push(`/auth?callbackUrl=/pricing`);
      return;
    }
    setLoading(plan.slug);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, billingInterval: interval }),
      });
      const data = await res.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch {}
    finally { setLoading(null); }
  };

  const formatPrice = (price: number) =>
    price === 0
      ? "Miễn phí"
      : new Intl.NumberFormat("vi-VN").format(price) + "₫";

  return (
    <section className="pricing-section" id="pricing">
      <div className="container">

        {/* Section Header */}
        <div className="section-header">
          <div className="section-badge">Bảng giá</div>
          <h2 className="section-title">
            Chọn gói <span className="gradient-text">phù hợp với bạn</span>
          </h2>
          <p className="section-subtitle">
            Bắt đầu miễn phí. Nâng cấp khi cần thêm sức mạnh AI.
          </p>
        </div>

        {/* Toggle Monthly / Yearly */}
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

        {/* Loading */}
        {plansLoading && (
          <div className="pricing-loading">
            <Loader2 size={32} className="pricing-spinner" />
            <p>Đang tải...</p>
          </div>
        )}

        {/* Plan Cards */}
        {!plansLoading && (
          <div className="pricing-grid">
            {plans.map((plan) => {
              const highlight       = plan.slug === "PRO";
              const displayFeatures = getDisplayFeatures(plan.features);
              const price           = interval === "MONTHLY" ? plan.priceMonthly : plan.priceYearly;

              return (
                <div
                  key={plan.slug}
                  className={`pricing-card${highlight ? " pricing-card-highlight" : ""}`}
                >
                  {highlight && (
                    <div className="pricing-popular-badge">⭐ Phổ biến nhất</div>
                  )}

                  {/* Icon + tên */}
                  <div className="pricing-plan-header">
                    <div className="pricing-plan-icon">
                      {plan.slug === "PREMIUM" && <Crown size={20} />}
                      {plan.slug === "PRO"     && <Zap   size={20} />}
                      {plan.slug === "FREE"    && <Star  size={20} />}
                    </div>
                    <span className="pricing-plan-name">{plan.name}</span>
                  </div>

                  {/* Giá */}
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

        {/* Link tới trang pricing đầy đủ */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/pricing" className="pricing-detail-link">
            Xem chi tiết so sánh các gói →
          </Link>
        </div>

      </div>
    </section>
  );
}
