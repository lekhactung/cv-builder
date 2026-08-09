import { create } from "zustand"
import { CvDocument, Block, Column } from "../schemas/block.schema"

const MAX_HISTORY = 50

interface EditorState {
    cvId: string
    title: string
    templateName: string
    document: CvDocument
    saved: boolean
    saving: boolean

    selectedBlockId: string | null
    selectedColumnId: string | null

    past: CvDocument[]
    future: CvDocument[]

    setTitle: (title: string) => void
    setTemplateName: (name: string) => void
    setSaved: (saved: boolean) => void
    setSaving: (saving: boolean) => void
    selectBlock: (blockId: string | null, columnId?: string | null) => void

    updateDocument: (updater: (doc: CvDocument) => CvDocument) => void

    addBlock: (columnId: string, block: Block) => void
    updateBlock: (columnId: string, blockId: string, updater: (b: Block) => Block) => void
    removeBlock: (columnId: string, blockId: string) => void
    moveBlock: (fromColId: string, toColId: string, fromIdx: number, toIdx: number) => void
    toggleBlockVisible: (columnId: string, blockId: string) => void
    duplicateBlock: (columnId: string, blockId: string) => void
    updateBlockLabel: (columnId: string, blockId: string, label: string, icon: string) => void

    reorderBlocks: (columnId: string, newOrder: string[]) => void
    updateTheme: (theme: Partial<CvDocument["theme"]>) => void

    undo: () => void
    redo: () => void
    canUndo: () => boolean
    canRedo: () => boolean

    loadDocument: (cvId: string, title: string, templateName: string, doc: CvDocument) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
    cvId: "",
    title: "",
    templateName: "Modern",
    document: { layout: "single", theme: { primaryColor: "#7c3aed", accentColor: "#f43f5e", fontFamily: "Inter", fontSize: 14, lineHeight: 1.5 }, columns: [] },
    saved: true,
    saving: false,
    selectedBlockId: null,
    selectedColumnId: null,
    past: [],
    future: [],
    setTitle: (title) => set({ title, saved: false }),
    setTemplateName: (name) => set({ templateName: name, saved: false }),
    setSaved: (saved) => set({ saved }),
    setSaving: (saving) => set({ saving }),
    selectBlock: (blockId, columnId = null) => set({ selectedBlockId: blockId, selectedColumnId: columnId }),

    updateDocument: (updater) => {
        const { document, past } = get()
        const next = updater(document)
        set({
            document: next,
            saved: false,
            past: [...past.slice(-MAX_HISTORY), document],
            future: [],
        })
    },

    addBlock: (columnId, block) => {
        get().updateDocument((doc) => ({
            ...doc,
            columns: doc.columns.map((col) =>
                col.id === columnId
                    ? { ...col, blocks: [...col.blocks, block] }
                    : col
            ),
        }))
    },
    updateBlock: (columnId, blockId, updater) => {
        get().updateDocument((doc) => ({
            ...doc,
            columns: doc.columns.map((col) =>
                col.id === columnId
                    ? { ...col, blocks: col.blocks.map((b) => b.id === blockId ? updater(b) : b) }
                    : col
            ),
        }))
    },
    removeBlock: (columnId, blockId) => {
        get().updateDocument((doc) => ({
            ...doc,
            columns: doc.columns.map((col) =>
                col.id === columnId
                    ? { ...col, blocks: col.blocks.filter((b) => b.id !== blockId) }
                    : col
            ),
        }))
    },
    moveBlock: (fromColId, toColId, fromIdx, toIdx) => {
        get().updateDocument((doc) => {
            const cols = doc.columns.map((col) => ({ ...col, blocks: [...col.blocks] }))
            const fromCol = cols.find((c) => c.id === fromColId)!
            const toCol = cols.find((c) => c.id === toColId)!
            const [moved] = fromCol.blocks.splice(fromIdx, 1)
            toCol.blocks.splice(toIdx, 0, moved)
            return { ...doc, columns: cols }
        })
    },
    toggleBlockVisible: (columnId, blockId) => {
        get().updateBlock(columnId, blockId, (b) => ({ ...b, visible: !b.visible }))
    },
    duplicateBlock: (columnId, blockId) => {
        get().updateDocument((doc) => ({
            ...doc,
            columns: doc.columns.map((col) => {
                if (col.id !== columnId) return col
                const idx = col.blocks.findIndex((b) => b.id === blockId)
                const clone = { ...col.blocks[idx], id: crypto.randomUUID() }
                const blocks = [...col.blocks]
                blocks.splice(idx + 1, 0, clone)
                return { ...col, blocks }
            }),
        }))
    },
    updateBlockLabel: (columnId, blockId, label, icon) => {
        get().updateBlock(columnId, blockId, (b) => ({ ...b, label, icon }))
    },
    reorderBlocks: (columnId, newOrder) => {
        get().updateDocument((doc) => ({
            ...doc,
            columns: doc.columns.map((col) => {
                if (col.id !== columnId) return col
                const blockMap = Object.fromEntries(col.blocks.map((b) => [b.id, b]))
                return { ...col, blocks: newOrder.map((id) => blockMap[id]).filter(Boolean) }
            }),
        }))
    },
    updateTheme: (theme) => {
        get().updateDocument((doc) => ({
            ...doc,
            theme: { ...doc.theme, ...theme },
        }))
    },

    undo: () => {
        const { past, document, future } = get()
        if (past.length === 0) return
        const prev = past[past.length - 1]
        set({
            document: prev,
            past: past.slice(0, -1),
            future: [document, ...future],
            saved: false,
        })
    },
    redo: () => {
        const { future, document, past } = get()
        if (future.length === 0) return
        const next = future[0]
        set({
            document: next,
            past: [...past, document],
            future: future.slice(1),
            saved: false,
        })
    },
    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,
    
    loadDocument: (cvId, title, templateName, doc) => {
        set({ cvId, title, templateName, document: doc, past: [], future: [], saved: true })
    },
}))