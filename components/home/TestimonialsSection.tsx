const testimonials = [
  {
    id: 1,
    stars: "★★★★★",
    text: "ATS Score tăng từ 52 lên 89 sau khi dùng ResumeAI. Tôi nhận được 3 lời mời phỏng vấn trong tuần đầu tiên!",
    initials: "NT",
    name: "Nguyễn Thành",
    role: "Software Engineer tại Google",
    avatarGrad: "linear-gradient(135deg, #6366F1, #22D3EE)",
    featured: false,
  },
  {
    id: 2,
    stars: "★★★★★",
    text: "Cover letter AI viết hay hơn cả tôi viết tay. Tiết kiệm 2 tiếng đồng hồ mỗi lần apply job. Không thể thiếu!",
    initials: "LM",
    name: "Lê Minh Anh",
    role: "Product Manager tại Shopee",
    avatarGrad: "linear-gradient(135deg, #10B981, #6366F1)",
    featured: true,
  },
  {
    id: 3,
    stars: "★★★★★",
    text: "Template đẹp, AI suggestions cực hữu ích. Job match score giúp tôi hiểu mình cần bổ sung gì trước khi apply.",
    initials: "TH",
    name: "Trần Hoàng",
    role: "Data Analyst tại VNG",
    avatarGrad: "linear-gradient(135deg, #F59E0B, #EF4444)",
    featured: false,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">Testimonials</div>
          <h2 className="section-title">
            Người dùng <span className="gradient-text">nói gì về chúng tôi</span>
          </h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className={`testimonial-card${t.featured ? " testimonial-featured" : ""}`}
            >
              <div className="testimonial-stars">{t.stars}</div>
              <p>&quot;{t.text}&quot;</p>
              <div className="testimonial-author">
                <div
                  className="author-avatar"
                  style={{ background: t.avatarGrad }}
                >
                  {t.initials}
                </div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
