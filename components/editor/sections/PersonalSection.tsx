import { Personal } from "@/lib/schemas/cv.schema";

interface Props {
  data: Personal;
  onChange: (data: Personal) => void;
}

export default function PersonalSection({ data, onChange }: Props) {
  const set = (field: keyof Personal) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...data, [field]: e.target.value });

  return (
    <div className="editor-section-form">
      <h3 className="form-section-title">👤 Hồ sơ cá nhân</h3>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Họ và tên</label>
          <input className="form-input" value={data.fullName} onChange={set("fullName")} placeholder="Nguyễn Văn A" />
        </div>
        <div className="form-group">
          <label className="form-label">Chức danh</label>
          <input className="form-input" value={data.jobTitle} onChange={set("jobTitle")} placeholder="Software Engineer" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={data.email} onChange={set("email")} placeholder="you@email.com" />
        </div>
        <div className="form-group">
          <label className="form-label">Số điện thoại</label>
          <input className="form-input" value={data.phone} onChange={set("phone")} placeholder="0912 345 678" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Địa chỉ</label>
          <input className="form-input" value={data.location} onChange={set("location")} placeholder="Hà Nội, Việt Nam" />
        </div>
        <div className="form-group">
          <label className="form-label">Website / Portfolio</label>
          <input className="form-input" value={data.website} onChange={set("website")} placeholder="https://..." />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">LinkedIn</label>
        <input className="form-input" value={data.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/..." />
      </div>

      <div className="form-group">
        <label className="form-label">Giới thiệu bản thân</label>
        <textarea
          className="form-input form-textarea"
          value={data.summary}
          onChange={set("summary")}
          placeholder="Mô tả ngắn về bạn, kinh nghiệm và mục tiêu nghề nghiệp..."
          rows={4}
        />
      </div>
    </div>
  );
}
