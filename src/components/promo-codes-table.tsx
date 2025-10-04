"use client"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

function toTitle(s: string) {
  return s ? s.slice(0, 1).toUpperCase() + s.slice(1) : s
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  const s = status?.toLowerCase()
  switch (s) {
    case "new":
      return "secondary"
    case "issued":
      return "default"
    case "redeemed":
      return "default"
    case "invalid":
      return "destructive"
    case "expired":
      return "outline"
    default:
      return "outline"
  }
}

export function PromoCodesTable() {
  const [items, setItems] = useState<ApiCodeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const columns = useMemo(() => ["Code", "Status", "Batch", "Amount", "Currency", "Created"], [])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/promo-codes?limit=20&page=1`, { cache: "no-store" })
        const json = await res.json()
        if (!mounted) return
        if (!res.ok) {
          setError(json?.error || "Failed to load promo codes")
        } else {
          setItems((json?.items ?? []) as ApiCodeItem[])
        }
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : "Failed to load promo codes")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <Card className="bg-card text-foreground">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Promo Codes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No promo codes found.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {columns.map((c) => (
                    <th key={c} className="px-3 py-2 text-left font-medium text-muted-foreground">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b">
                    <td className="px-3 py-2 font-mono">{it.code}</td>
                    <td className="px-3 py-2">
                      <Badge variant={statusVariant(it.status)}>{toTitle(it.status)}</Badge>
                    </td>
                    <td className="px-3 py-2">{it.batchName ?? "—"}</td>
                    <td className="px-3 py-2">{it.amount != null ? it.amount : "—"}</td>
                    <td className="px-3 py-2">{it.currency ?? "—"}</td>
                    <td className="px-3 py-2">{it.createdAt ? new Date(it.createdAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}