"use client"
import { create } from "zustand"

export type ApiCodeItem = {
  id: string
  code: string
  status: string
  batchId: string
  batchName: string | null
  amount: number | null
  currency: string | null
  createdAt: string
  updatedAt: string
}

type PromoCodesState = {
  items: ApiCodeItem[]
  loading: boolean
  error: string | null
  page: number
  limit: number
  total: number
  search: string
  status: string
  batch: string
  dateFrom: string | null
  dateTo: string | null
  refreshKey: number
}

type PromoCodesActions = {
  fetch: (params?: { page?: number; limit?: number; search?: string; status?: string }) => Promise<void>
  invalidate: () => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setItems: (items: ApiCodeItem[]) => void
  setSearch: (search: string) => void
  setStatus: (status: string) => void
  setBatch: (batch: string) => void
  setDateFrom: (date: string | null) => void
  setDateTo: (date: string | null) => void
}

export const usePromoCodesStore = create<PromoCodesState & PromoCodesActions>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  page: 1,
  limit: 20,
  total: 0,
  search: "",
  status: "",
  batch: "",
  dateFrom: null,
  dateTo: null,
  refreshKey: 0,
  fetch: async (params) => {
    const page = params?.page ?? get().page
    const limit = params?.limit ?? get().limit
    const search = params?.search ?? get().search
    const status = params?.status ?? get().status
    set({ loading: true, error: null })
    try {
      const qs = new URLSearchParams({
        limit: String(limit),
        page: String(page),
      })
      if (search) qs.set("search", search)
      if (status) qs.set("status", status)
      const res = await fetch(`/api/promo-codes?${qs.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) {
        set({ error: json?.error || "Failed to load promo codes" })
      } else {
        set({ items: (json?.items ?? []) as ApiCodeItem[], total: Number(json?.total ?? 0) })
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to load promo codes" })
    } finally {
      set({ loading: false })
    }
  },
  invalidate: () => {
    set({ refreshKey: Date.now() })
    // Optionally refetch with current pagination
    void get().fetch()
  },
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit }),
  setItems: (items) => set({ items }),
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
  setBatch: (batch) => set({ batch }),
  setDateFrom: (date) => set({ dateFrom: date }),
  setDateTo: (date) => set({ dateTo: date }),
}))