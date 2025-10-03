"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function GeneratePage() {
  const [name, setName] = useState("")
  const [prefix, setPrefix] = useState("")
  const [length, setLength] = useState(8)
  const [count, setCount] = useState(100)
  const [expiresAt, setExpiresAt] = useState("")
  const [metadata, setMetadata] = useState("")
  const [jobId, setJobId] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, prefix, length, count, expiresAt: expiresAt || null, metadata: metadata || null }),
    })
    const data = await res.json()
    if (res.ok) setJobId(data.jobId)
    else alert(data.error || "Error")
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Promo Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 max-w-xl">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="January Campaign" />
            </div>
            <div>
              <Label>Prefix</Label>
              <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="JAN-" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Code Length</Label>
                <Input type="number" value={length} onChange={(e) => setLength(Number(e.target.value))} />
              </div>
              <div>
                <Label>Count</Label>
                <Input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} />
              </div>
            </div>
            <div>
              <Label>Expires At</Label>
              <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
            <div>
              <Label>Metadata (optional)</Label>
              <Input value={metadata} onChange={(e) => setMetadata(e.target.value)} placeholder="campaign:jan" />
            </div>
            <Button type="submit">Enqueue Generation</Button>
          </form>
          {jobId && <p className="mt-4 text-sm text-muted-foreground">Job queued: {jobId}</p>}
        </CardContent>
      </Card>
    </div>
  )
}