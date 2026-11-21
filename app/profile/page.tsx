import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserRound, ShieldCheck, CreditCard, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { profileImageUrl } from "@/lib/profile-image";
import ProfileForms from "@/components/profile/ProfileForms";
import styles from "./profile.module.css";

export const metadata = { title: "Cài đặt tài khoản" };

const statusLabels: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  TRIALING: "Đang dùng thử",
  PAST_DUE: "Cần thanh toán",
  CANCELLED: "Đã hủy",
  EXPIRED: "Đã hết hạn",
  INCOMPLETE: "Chưa hoàn tất",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id || session.error) redirect("/auth?callbackUrl=/profile");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      password: true,
      updatedAt: true,
      accounts: { select: { provider: true } },
      subscription: { include: { plan: true } },
      creditWallet: { select: { balance: true } },
    },
  });
  if (!user) redirect("/auth");
  const subscription = user.subscription;
  const date = subscription?.currentPeriodEnd.toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const hasPaidPlan = subscription && subscription.plan.slug !== "FREE";

  return (
    <main className={styles.page}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>TÀI KHOẢN CỦA BẠN</span>
          <h1>Cài đặt tài khoản</h1>
          <p>Quản lý thông tin cá nhân, bảo mật và gói dịch vụ.</p>
        </div>
        <Link href="/dashboard" className={styles.secondary}>
          Về Dashboard
        </Link>
      </div>
      <div className={styles.layout}>
        <nav className={styles.navigation} aria-label="Các mục cài đặt">
          <a href="#personal">
            <UserRound size={18} />
            Thông tin cá nhân
          </a>
          <a href="#security">
            <ShieldCheck size={18} />
            Bảo mật
          </a>
          <a href="#subscription">
            <CreditCard size={18} />
            Gói dịch vụ
          </a>
        </nav>
        <div className={styles.content}>
          <ProfileForms
            name={user.name ?? ""}
            email={user.email}
            image={profileImageUrl(user.image, user.updatedAt)}
            hasPassword={!!user.password}
            hasGoogle={user.accounts.some((account) => account.provider === "google")}
          />
          <section id="subscription" className={styles.card}>
            <div className={styles.cardHeading}>
              <CreditCard size={22} />
              <div>
                <h2>Gói dịch vụ và credit</h2>
                <p>Theo dõi quyền lợi và tín dụng AI của bạn.</p>
              </div>
            </div>
            <div className={styles.planGrid}>
              <div className={styles.plan}>
                <span>Gói đã đăng ký</span>
                <strong>{subscription?.plan.name ?? "Free"}</strong>
                <p>{subscription ? statusLabels[subscription.status] : "Gói miễn phí"}</p>
                {hasPaidPlan && (
                  <p>
                    Chu kỳ: {subscription.billingInterval === "YEARLY" ? "Hàng năm" : "Hàng tháng"}
                  </p>
                )}
                {hasPaidPlan && (
                  <p>
                    {subscription.cancelAtPeriodEnd ||
                    !["ACTIVE", "TRIALING"].includes(subscription.status)
                      ? "Kết thúc kỳ"
                      : "Kỳ hiện tại đến"}
                    : {date}
                  </p>
                )}
              </div>
              <div className={styles.plan}>
                <span>
                  <Zap size={16} /> Credit khả dụng
                </span>
                <strong>
                  {new Intl.NumberFormat("vi-VN").format(user.creditWallet?.balance ?? 0)}
                </strong>
                <p>Dùng cho các tính năng AI.</p>
              </div>
            </div>
            {subscription?.cancelAtPeriodEnd &&
              ["ACTIVE", "TRIALING"].includes(subscription.status) && (
                <p className={styles.notice}>
                  Gói sẽ ngừng gia hạn. Bạn vẫn có thể sử dụng đến hết ngày {date}.
                </p>
              )}
            <div className={styles.actions}>
              <Link href="/billing" className={styles.primary}>
                Quản lý thanh toán và lịch sử
              </Link>
              <Link href="/pricing" className={styles.secondary}>
                Xem các gói dịch vụ
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
