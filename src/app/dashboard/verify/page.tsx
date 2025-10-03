"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyPage() {
  const [code, setCode] = useState("")
  const [result, setResult] = useState<string | null>(null)

  async function check() {
    const res = await fetch(`/api/verify?code=${encodeURIComponent(code)}`)
    const data = await res.json()
    if (res.ok) setResult(JSON.stringify(data))
    else alert(data.error || "Error")
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Verify Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 max-w-md">
            <div>
              <Label>Code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={check}>Check</Button>
            </div>
            {result && <pre className="text-sm text-muted-foreground">{result}</pre>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}