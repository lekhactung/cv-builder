interface Props { data: { content: string }; onChange: (d: any) => void }

export default function TextBlockSettings({ data, onChange }: Props) {
    return (
        <div className="form-group">
            <label className="form-label">Nội dung</label>
            <textarea
                className="form-input form-textarea"
                value={data.content}
                onChange={(e) => onChange({ ...data, content: e.target.value })}
                rows={8}
                placeholder="Nhập nội dung..."
            />
        </div>
    )
}