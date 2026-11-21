"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Camera, Eye, EyeOff, ShieldCheck, UserRound } from "lucide-react";
import {
  changePasswordAction,
  updateProfileAction,
  type ProfileActionState,
} from "@/lib/actions/profile";
import styles from "@/app/profile/profile.module.css";

interface Props {
  name: string;
  email: string;
  image: string | null;
  hasPassword: boolean;
  hasGoogle: boolean;
}

function Feedback({ state }: { state: ProfileActionState }) {
  if (state.error)
    return (
      <p className={styles.error} role="alert">
        {state.error}
      </p>
    );
  if (state.success)
    return (
      <p className={styles.success} role="status">
        {state.success}
      </p>
    );
  return null;
}

export default function ProfileForms({ name, email, image, hasPassword, hasGoogle }: Props) {
  const { update } = useSession();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const passwordForm = useRef<HTMLFormElement>(null);
  const [displayName, setDisplayName] = useState(name);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [savedImage, setSavedImage] = useState(image);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const [profileState, profileAction, saving] = useActionState(
    async (_previous: ProfileActionState, formData: FormData) => {
      if (avatar) formData.set("avatar", avatar);
      formData.set("removeAvatar", String(removeAvatar));
      const result = await updateProfileAction(formData);
      if (result.success) {
        try {
          const session = await update({ refreshProfile: true });
          setSavedImage(session?.user?.image ?? null);
          setAvatar(null);
          setPreview(null);
          setRemoveAvatar(false);
          if (fileInput.current) fileInput.current.value = "";
          router.refresh();
        } catch {
          return {
            success:
              "Đã lưu thông tin. Tải lại trang để cập nhật ảnh và tên trên thanh điều hướng.",
          };
        }
      }
      return result;
    },
    {},
  );

  const [passwordState, passwordAction, changingPassword] = useActionState(
    async (_previous: ProfileActionState, formData: FormData) => {
      const result = await changePasswordAction(formData);
      if (result.success) passwordForm.current?.reset();
      return result;
    },
    {},
  );

  async function selectAvatar(file?: File) {
    if (!file) return;
    setUploadError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setUploadError("Vui lòng chọn ảnh PNG, JPG hoặc WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ảnh tải lên không được vượt quá 5 MB.");
      return;
    }
    setProcessing(true);
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 256;
      const context = canvas.getContext("2d");
      if (!context) {
        bitmap.close();
        throw new Error("Canvas unavailable");
      }
      const side = Math.min(bitmap.width, bitmap.height);
      context.drawImage(
        bitmap,
        (bitmap.width - side) / 2,
        (bitmap.height - side) / 2,
        side,
        side,
        0,
        0,
        256,
        256,
      );
      bitmap.close();
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.85),
      );
      if (!blob || blob.size > 256 * 1024) throw new Error("Image too large");
      setAvatar(new File([blob], "avatar.webp", { type: blob.type }));
      setPreview(URL.createObjectURL(blob));
      setRemoveAvatar(false);
    } catch {
      setUploadError("Không thể xử lý ảnh này. Vui lòng chọn ảnh khác.");
    } finally {
      setProcessing(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const displayImage = removeAvatar ? null : (preview ?? savedImage);

  return (
    <>
      <section id="personal" className={styles.card}>
        <div className={styles.cardHeading}>
          <UserRound size={22} />
          <div>
            <h2>Thông tin cá nhân</h2>
            <p>Thông tin này được dùng cho tài khoản của bạn.</p>
          </div>
        </div>
        <form action={profileAction}>
          <fieldset disabled={saving || processing} className={styles.fieldset}>
            <div className={styles.avatarRow}>
              <div className={styles.avatar}>
                {displayImage && imageError !== displayImage ? (
                  <Image
                    unoptimized
                    src={displayImage}
                    alt="Ảnh đại diện tài khoản"
                    width={80}
                    height={80}
                    onError={() => setImageError(displayImage)}
                  />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase() || "U"}</span>
                )}
              </div>
              <div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => fileInput.current?.click()}
                  >
                    <Camera size={16} />
                    {processing ? "Đang xử lý..." : "Thay ảnh"}
                  </button>
                  {(displayImage || avatar) && (
                    <button
                      type="button"
                      className={styles.textButton}
                      onClick={() => {
                        setAvatar(null);
                        setPreview(null);
                        setRemoveAvatar(true);
                        setUploadError("");
                      }}
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>
                <p className={styles.hint}>
                  PNG, JPG hoặc WebP, tối đa 5 MB. Ảnh sẽ được cắt vuông.
                </p>
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                aria-label="Chọn ảnh đại diện"
                hidden
                onChange={(event) => void selectAvatar(event.target.files?.[0])}
              />
            </div>
            {uploadError && (
              <p className={styles.error} role="alert">
                {uploadError}
              </p>
            )}
            <div className={styles.fields}>
              <label className={styles.field} htmlFor="profile-name">
                Tên hiển thị
                <input
                  id="profile-name"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={80}
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </label>
              <label className={styles.field} htmlFor="profile-email">
                Email
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  readOnly
                  aria-describedby="email-hint"
                />
                <span id="email-hint" className={styles.hint}>
                  Email đăng nhập hiện chưa hỗ trợ thay đổi.
                </span>
              </label>
            </div>
            <p className={styles.hint}>
              Thay đổi ở đây không chỉnh sửa thông tin trong các CV đã tạo.
            </p>
            <button type="submit" className={styles.primary}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </fieldset>
          <Feedback state={profileState} />
        </form>
      </section>
      <section id="security" className={styles.card}>
        <div className={styles.cardHeading}>
          <ShieldCheck size={22} />
          <div>
            <h2>Bảo mật</h2>
            <p>Quản lý phương thức đăng nhập và mật khẩu.</p>
          </div>
        </div>
        <div className={styles.loginMethod}>
          <span>Phương thức đăng nhập</span>
          <strong>
            {[hasPassword && "Email và mật khẩu", hasGoogle && "Google"]
              .filter(Boolean)
              .join(" · ") || "Tài khoản liên kết"}
          </strong>
        </div>
        {hasPassword ? (
          <form ref={passwordForm} action={passwordAction}>
            <fieldset disabled={changingPassword} className={styles.fieldset}>
              <div className={styles.passwordHeading}>
                <h3>Đổi mật khẩu</h3>
                <button
                  type="button"
                  className={styles.textButton}
                  aria-pressed={showPasswords}
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPasswords ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                </button>
              </div>
              <label className={styles.field} htmlFor="current-password">
                Mật khẩu hiện tại
                <input
                  id="current-password"
                  name="currentPassword"
                  type={showPasswords ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  maxLength={72}
                />
              </label>
              <div className={styles.fields}>
                <label className={styles.field} htmlFor="new-password">
                  Mật khẩu mới
                  <input
                    id="new-password"
                    name="newPassword"
                    type={showPasswords ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={72}
                    aria-describedby="password-hint"
                  />
                </label>
                <label className={styles.field} htmlFor="confirm-password">
                  Xác nhận mật khẩu mới
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showPasswords ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={72}
                  />
                </label>
              </div>
              <p id="password-hint" className={styles.hint}>
                Ít nhất 8 ký tự và khác mật khẩu hiện tại. Các phiên đăng nhập khác vẫn được duy
                trì.
              </p>
              <button type="submit" className={styles.primary}>
                {changingPassword ? "Đang cập nhật..." : "Đổi mật khẩu"}
              </button>
            </fieldset>
            <Feedback state={passwordState} />
          </form>
        ) : (
          <p className={styles.notice}>
            Bạn đang đăng nhập bằng Google. Hãy quản lý mật khẩu và bảo mật tại tài khoản Google của
            bạn.
          </p>
        )}
      </section>
    </>
  );
}
