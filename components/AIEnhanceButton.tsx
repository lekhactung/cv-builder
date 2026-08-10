"use client"
import React, { useState } from "react"
import { Sparkles, Loader2, X, Check } from "lucide-react"

interface Props {
    currentText: string;
    type: "summary" | "experience";
    onAccept: (newText: string) => void;
}

export default function AIEnhanceButton({ currentText, type, onAccept }: Props) {
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<string[]>([]);

    const handleEnhance = async (e: React.MouseEvent) => {
        e.stopPropagation();

        let textToEnhance = currentText;
        const container = (e.currentTarget as HTMLElement).closest('.group\\/ai, .group\\/ai-desc');
        if (container) {
            const editable = container.querySelector('[contenteditable="true"]') as HTMLElement;
            if (editable) {
                textToEnhance = editable.innerText.trim();
            }
        }

        if (!textToEnhance.trim()) return alert("Vui lòng nhập nội dung nháp trước!");

        setLoading(true);
        try {
            const res = await fetch("/api/ai/enhance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: textToEnhance, type }),
            });
            const data = await res.json();
            if (data.result && Array.isArray(data.result)) {
                setOptions(data.result);
            } else {
                alert(`Lỗi AI: ${data.error || "Không thể xử lý yêu cầu"}`);
            }
        } catch {
            alert("Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative">
            <button
                onClick={handleEnhance}
                disabled={loading}
                className="text-purple-500 hover:text-purple-700 bg-purple-50 p-1.5 rounded-md transition-colors disabled:opacity-50"
                title="Dùng AI viết lại cho chuyên nghiệp"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            </button>

            {options.length > 0 && (
                <div className="absolute right-0 top-full pt-2 z-[100]">
                    <div 
                        className="w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-3 flex flex-col gap-2 max-h-96 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                    <div className="flex justify-between items-center px-1 pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI gợi ý {options.length} phiên bản:</span>
                        <button onClick={() => setOptions([])} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50">
                            <X size={14}/>
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        {options.map((opt, i) => (
                            <div 
                                key={i} 
                                onClick={(e) => { e.stopPropagation(); onAccept(opt); setOptions([]) }}
                                className="text-sm text-left p-3 bg-slate-50 hover:bg-purple-50 rounded-lg cursor-pointer border border-transparent hover:border-purple-200 transition-all group"
                            >
                                <div className="text-slate-700 whitespace-pre-wrap">{opt}</div>
                                <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Check size={14} /> Chọn phiên bản này
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                </div>
            )}
        </div>
    );
}