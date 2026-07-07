const steps = [
  { num: "01", title: "Chọn template",   desc: "Chọn từ 20+ template được thiết kế bởi HR professionals" },
  { num: "02", title: "Điền thông tin",  desc: "Form thông minh hướng dẫn từng bước, import từ LinkedIn" },
  { num: "03", title: "AI phân tích",    desc: "Nhận ATS Score và suggestions cụ thể để cải thiện CV" },
  { num: "04", title: "Apply 1-click",   desc: "Áp dụng suggestions của AI chỉ với một cú nhấp chuột" },
  { num: "05", title: "Export & Apply",  desc: "Download PDF chuẩn đẹp hoặc chia sẻ link trực tiếp" },
];

export default function HowItWorksSection() {
  return (
    <section className="how-section" id="how">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">Quy trình</div>
          <h2 className="section-title">
            CV chuyên nghiệp trong <span className="gradient-text">5 bước</span>
          </h2>
        </div>
        <div className="steps-container">
          {steps.map((step, i) => (
            <div key={step.num} className="steps-item-wrapper">
              <div className="step-item">
                <div className="step-num">{step.num}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
