"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type ApiCodeItem = {
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

export default function PromoCodesPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [items, setItems] = useState<ApiCodeItem[]>([])
  const [total, setTotal] = useState(0)
  const [counts, setCounts] = useState<{ [k: string]: number }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])

  const filters = [
    { label: "All", value: "" },
    { label: "Active", value: "active" },
    { label: "Used", value: "used" },
    { label: "Redeemed", value: "redeemed" },
    { label: "Reported", value: "reported" },
    { label: "Expired", value: "expired" },
    { label: "Blocked", value: "blocked" },
  ]

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (status) params.set("status", status)
      params.set("page", String(page))
      params.set("limit", String(pageSize))
      const res = await fetch(`/api/promo-codes?${params.toString()}`, { cache: "no-store" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || `Request failed: ${res.status}`)
      }
      const data = await res.json()
      setItems(data.items || [])
      setTotal(data.total || 0)
      setCounts(data.counts || {})
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, page, pageSize])

  function resetAndSearch(value: string) {
    setPage(1)
    setSearch(value)
  }

  function onSelectFilter(value: string) {
    setPage(1)
    setStatus(value)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Promo Codes</h1>
          <p className="text-sm text-muted-foreground">Search and manage promo codes</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Input
                placeholder="Search codes..."
                value={search}
                onChange={(e) => resetAndSearch(e.target.value)}
                aria-label="Search codes"
              />
            </div>
            <Separator orientation="vertical" className="hidden md:block h-6" />
            <div className="flex items-center gap-2">
              {filters.map((f) => (
                <Button
                  key={f.label}
                  variant={status === f.value ? "default" : "outline"}
                  className={status === f.value ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
                  size="sm"
                  onClick={() => onSelectFilter(f.value)}
                >
                  {f.label}
                  <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs">
                    {(() => {
                      const map: Record<string, string> = {
                        "": "all",
                        active: "active",
                        used: "used",
                        redeemed: "redeemed",
                        reported: "reported",
                        expired: "expired",
                        blocked: "blocked",
                      }
                      return (counts[map[f.value]] ?? 0).toLocaleString()
                    })()}
                  </span>
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${total.toLocaleString()} codes`}
            </span>
          </div>
        </div>
      </Card>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3">Code</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Batch</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  {error ? `Error: ${error}` : "No codes found"}
                </td>
              </tr>
            )}
            {items.map((c) => {
              const created = c.createdAt ? new Date(c.createdAt) : null
              const amountLabel = c.amount != null ? `${c.amount.toLocaleString()}${c.currency ? ` ${c.currency}` : ""}` : "-"
              return (
                <tr key={c.id} className="border-t">
                  <td className="p-3 font-mono">{c.code}</td>
                  <td className="p-3">{amountLabel}</td>
                  <td className="p-3">{c.batchName ?? c.batchId}</td>
                  <td className="p-3 capitalize">{c.status}</td>
                  <td className="p-3">{created ? created.toLocaleString() : "-"}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            aria-label="Previous page"
          >
            ‹
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            aria-label="Next page"
          >
            ›
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-sm text-muted-foreground">Rows</label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
            className="bg-background border rounded-md px-3 py-2 text-sm"
            aria-label="Rows per page"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>
  )
}