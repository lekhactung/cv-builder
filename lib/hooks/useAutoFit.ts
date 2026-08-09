"use client"
import { useEffect, useRef } from "react"

export function useAutoFit(enable: boolean = true) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!enable || !ref.current) return
        const el = ref.current
        const A4_H = 1122.52

        const fit = () => {
            el.style.fontSize = ""

            let fontSize = parseFloat(getComputedStyle(el).fontSize) || 14
            let iterators = 0

            while (el.scrollHeight > A4_H && fontSize > 8 && iterators < 20) {
                fontSize -= 0.5
                el.style.fontSize = `${fontSize}px`
                iterators++
            }
        }

        const observer = new ResizeObserver(fit)
        observer.observe(el)
        fit()

        return () => observer.disconnect()
    }, [enable])
    return ref
}