"use client"
import { useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePromoCodesStore } from "@/hooks/use-promo-codes"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from "@tanstack/react-table"
import { useState } from "react"

function toTitle(s: string) {
  return s ? s.slice(0, 1).toUpperCase() + s.slice(1) : s
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  const s = status?.toLowerCase()
  switch (s) {
    case "active":
      return "default"
    case "used":
      return "secondary"
    case "redeemed":
      return "secondary"
    case "reported":
      return "outline"
    case "expired":
      return "outline"
    case "blocked":
      return "destructive"
    default:
      return "outline"
  }
}

export function PromoCodesTable() {
  const { items, loading, error, fetch, page, limit, total, refreshKey, search, status, batch, dateFrom, dateTo, setPage, setLimit, setSearch, setStatus, setBatch, setDateFrom, setDateTo } = usePromoCodesStore((s) => ({
    items: s.items,
    loading: s.loading,
    error: s.error,
    fetch: s.fetch,
    page: s.page,
    limit: s.limit,
    total: s.total,
    refreshKey: s.refreshKey,
    search: s.search,
    status: s.status,
    batch: s.batch,
    dateFrom: s.dateFrom,
    dateTo: s.dateTo,
    setPage: s.setPage,
    setLimit: s.setLimit,
    setSearch: s.setSearch,
    setStatus: s.setStatus,
    setBatch: s.setBatch,
    setDateFrom: s.setDateFrom,
    setDateTo: s.setDateTo,
  }))

  const [sorting, setSorting] = useState<SortingState>([])
  const columns: ColumnDef<typeof items[number]>[] = useMemo(() => [
    { accessorKey: "code", header: "Code", cell: ({ getValue }) => <span className="font-mono">{String(getValue())}</span> },
    { accessorKey: "status", header: "Status", cell: ({ getValue }) => <Badge variant={statusVariant(String(getValue()))}>{toTitle(String(getValue()))}</Badge> },
    { accessorKey: "batchName", header: "Batch", cell: ({ getValue }) => String(getValue() ?? "—") },
    { accessorKey: "amount", header: "Amount", cell: ({ getValue }) => (getValue() != null ? String(getValue()) : "—") },
    { accessorKey: "currency", header: "Currency", cell: ({ getValue }) => String(getValue() ?? "—") },
    { accessorKey: "createdAt", header: "Created", cell: ({ getValue }) => (getValue() ? new Date(String(getValue())).toLocaleString() : "—") },
  ], [])

  const table = useReactTable({
    data: useMemo(() => {
      const fromTs = dateFrom ? Date.parse(dateFrom) : null
      const toTs = dateTo ? Date.parse(dateTo) : null
      return items.filter((it) => {
        if (batch && it.batchName !== batch) return false
        const createdTs = it.createdAt ? Date.parse(String(it.createdAt)) : null
        if (fromTs && createdTs && createdTs < fromTs) return false
        if (toTs && createdTs && createdTs > toTs + 24 * 60 * 60 * 1000 - 1) return false
        return true
      })
    }, [items, batch, dateFrom, dateTo]),
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  useEffect(() => {
    void fetch({ page, limit, search, status })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, status, refreshKey])

  return (
    <Card className="bg-card text-foreground">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Promo Codes</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between mb-3">
          <div className="flex gap-2 items-center flex-wrap">
            <Input
              placeholder="Search codes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[200px]"
            />
            <Select value={status} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="redeemed">Redeemed</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            {/* Batch filter */}
            <Select value={batch} onValueChange={(v) => setBatch(v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Batches</SelectItem>
                {Array.from(new Set(items.map((it) => it.batchName).filter(Boolean))).map((name) => (
                  <SelectItem key={String(name)} value={String(name)}>{String(name)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Date range */}
            <Input
              type="date"
              value={dateFrom ?? ""}
              onChange={(e) => setDateFrom(e.target.value || null)}
              className="w-[160px]"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              value={dateTo ?? ""}
              onChange={(e) => setDateTo(e.target.value || null)}
              className="w-[160px]"
            />
          </div>
          <div className="text-xs text-muted-foreground">Total: {total}</div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No promo codes found.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="border-b">
                    {hg.headers.map((h) => (
                      <TableHead key={h.id} className="px-3 py-2 text-left font-medium text-muted-foreground">
                        {h.isPlaceholder ? null : (
                          <button
                            className="inline-flex items-center gap-1 hover:underline"
                            onClick={h.column.getCanSort() ? () => h.column.toggleSorting(h.column.getIsSorted() === "asc") : undefined}
                          >
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {h.column.getIsSorted() === "asc" ? <span>▲</span> : h.column.getIsSorted() === "desc" ? <span>▼</span> : null}
                          </button>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-b">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {/* Pagination Controls */}
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))}>Previous</Button>
          <span className="text-sm">Page {page}</span>
          <Button variant="ghost" disabled={(page * limit) >= total} onClick={() => setPage(page + 1)}>Next</Button>
          <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}