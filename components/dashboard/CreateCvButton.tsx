"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, AlertTriangle, ArrowRight, X } from "lucide-react"
import { checkCanCreateCvAction } from "@/lib/actions/cv"

export default function CreateCvButton() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [limitInfo, setLimitInfo] = useState<{
        currentCount: number
        maxCv: number
    } | null>(null)

    const handleClick = async () => {
        setLoading(true)
        try {
            const { canCreate, currentCount, maxCv } = await checkCanCreateCvAction()
            if (canCreate) {
                router.push("/editor/new?template=single")
            } else {
                setLimitInfo({ currentCount, maxCv })
            }
        } catch {
            router.push("/editor/new?template=single")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={handleClick}
                disabled={loading}
                className="btn btn-primary btn-md group"
            >
                {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                    <Plus size={18} className="transition-transform group-hover:rotate-90" />
                )}
                Tạo CV mới
            </button>

            {/* Limit reached modal */}
            {limitInfo && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
                    onClick={() => setLimitInfo(null)}
                >
                    <div
                        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 flex flex-col gap-5 animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setLimitInfo(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 mx-auto">
                            <AlertTriangle size={28} className="text-amber-500" />
                        </div>

                        <div className="text-center">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                                Đã đạt giới hạn CV
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                Gói hiện tại của bạn chỉ cho phép tạo tối đa{" "}
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    {limitInfo.maxCv} CV
                                </span>
                                . Bạn đã có{" "}
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    {limitInfo.currentCount} CV
                                </span>
                                . Hãy nâng cấp gói hoặc xóa bớt CV cũ để tiếp tục.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <a
                                href="/pricing"
                                className="btn btn-primary btn-md w-full justify-center gap-2"
                            >
                                Nâng cấp ngay
                                <ArrowRight size={16} />
                            </a>
                            <button
                                onClick={() => setLimitInfo(null)}
                                className="btn btn-ghost btn-md w-full justify-center"
                            >
                                Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
