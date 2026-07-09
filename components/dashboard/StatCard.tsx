interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color?: "primary" | "accent" | "success" | "warning";
    description?: string;
}

export default function StatCard({ label, value, icon, color = "primary", description }: StatCardProps) {
    return (
        <div className={`db-stat-card db-stat-${color}`}>
            <div className="db-stat-icon">{icon}</div>
            <div className="db-stat-content">
                <p className="db-stat-label">{label}</p>
                <p className="db-stat-value">{value}</p>
                {description && <p className="db-stat-desc">{description}</p>}
            </div>
        </div>
    );
}