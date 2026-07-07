const logos = ["Google", "Meta", "Shopee", "VNG", "FPT Software", "Vingroup"];

export default function TrustedSection() {
  return (
    <section className="trusted-section">
      <div className="container">
        <p className="trusted-label">Được tin dùng bởi ứng viên tại</p>
        <div className="trusted-logos">
          {logos.map((logo) => (
            <div key={logo} className="trusted-logo">{logo}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
