"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type ApiBatchItem = {
  id: string
  name: string
  status: string
  quantity: number | null
  prefix: string | null
  suffix: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  totalCodes: number
  redeemed: number
  progress: number
}

export default function BatchesPage() {
  const [search, setSearch] = useState("")
  // Legacy-inspired filters: All, Active, Expired, Blocked
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [items, setItems] = useState<ApiBatchItem[]>([])
  const [total, setTotal] = useState(0)
  const [counts, setCounts] = useState<{ [k: string]: number }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])

  const filters = [
    { label: "All", value: "" },
    // Map legacy "Active" to our "completed" internal status
    { label: "Active", value: "completed" },
    // "Expired" not modeled in current schema; keep as placeholder value to allow future support
    { label: "Expired", value: "expired" },
    // Map legacy "Blocked" to our "archived" (or failed) — using archived here
    { label: "Blocked", value: "archived" },
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
      const res = await fetch(`/api/batches?${params.toString()}`, { cache: "no-store" })
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
          <h1 className="text-2xl font-semibold tracking-tight">Batches</h1>
          <p className="text-sm text-muted-foreground">Manage promo code batches and track progress</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Input
                placeholder="Search batches..."
                value={search}
                onChange={(e) => resetAndSearch(e.target.value)}
                aria-label="Search batches"
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
                      const map: Record<string, string> = { "": "all", completed: "active", expired: "expired", archived: "blocked" }
                      return (counts[map[f.value]] ?? 0).toLocaleString()
                    })()}
                  </span>
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${total.toLocaleString()} batches`}
            </span>
          </div>
        </div>
      </Card>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3">Batch Name</th>
              <th className="p-3">Total Codes</th>
              <th className="p-3">Amount / Code</th>
              <th className="p-3">Progress</th>
              <th className="p-3">Status</th>
              <th className="p-3">Assigned To</th>
              <th className="p-3">Expiration</th>
              <th className="p-3">Download</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-muted-foreground">
                  {error ? `Error: ${error}` : "No batches found"}
                </td>
              </tr>
            )}
            {items.map((b) => {
              const created = new Date(b.createdAt)
              return (
                <tr key={b.id} className="border-t">
                  <td className="p-3 font-medium">{b.name}</td>
                  <td className="p-3">{(b.totalCodes ?? 0).toLocaleString()}</td>
                  <td className="p-3">{/* Placeholder amount-per-code (not modeled yet) */}-</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="relative h-2 w-40 rounded bg-muted">
                        <div
                          className="absolute left-0 top-0 h-2 rounded bg-emerald-500"
                          style={{ width: `${b.progress}%` }}
                          aria-label="Progress"
                          title={`${b.progress}%`}
                        />
                      </div>
                      <span className="text-muted-foreground">
                        {b.redeemed.toLocaleString()}/{b.totalCodes.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 capitalize">{b.status}</td>
                  <td className="p-3">{b.createdBy || "Generator"}</td>
                  <td className="p-3">{/* Expiration not modeled yet */}-</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  </td>
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