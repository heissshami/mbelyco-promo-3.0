"use client"
import { useEffect, useMemo, useState, useLayoutEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

export function GenerateCodesForm() {
  const router = useRouter()

  // State aligned with legacy JSON spec
  const [batchName, setBatchName] = useState("")
  const [totalCodes, setTotalCodes] = useState<string>("")
  const [amountPerCode, setAmountPerCode] = useState<string>("")
  const [currency, setCurrency] = useState<string>("RWF")
  const [expirationDate, setExpirationDate] = useState<string>("")
  const [assignToUser, setAssignToUser] = useState<string>("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [jobId, setJobId] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)

  // Date picker popover state
  const [dateOpen, setDateOpen] = useState(false)

  // Responsive auto-scale to keep form visible without scroll
  const containerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const updateScale = () => {
      const container = containerRef.current
      const content = contentRef.current
      if (!container || !content) return
      const cw = container.clientWidth
      const ch = container.clientHeight
      // Use offset dimensions to avoid transform effects
      const naturalWidth = content.offsetWidth
      const naturalHeight = content.offsetHeight
      if (!naturalWidth || !naturalHeight) return
      const s = Math.min(cw / naturalWidth, ch / naturalHeight, 1)
      setScale(Number.isFinite(s) && s > 0 ? s : 1)
    }
    // First measure after paint
    requestAnimationFrame(updateScale)
    const ro = new ResizeObserver(updateScale)
    if (containerRef.current) ro.observe(containerRef.current)
    if (contentRef.current) ro.observe(contentRef.current)
    window.addEventListener("resize", updateScale)
    return () => {
      window.removeEventListener("resize", updateScale)
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const schema = useMemo(
    () =>
      z.object({
        batchName: z
          .string()
          .min(3, "Batch name must be at least 3 characters")
          .max(100, "Batch name cannot exceed 100 characters")
          .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, hyphens and underscores allowed"),
        totalCodes: z
          .coerce
          .number({ invalid_type_error: "Total codes is required" })
          .min(1, "Must generate at least 1 code")
          .max(100_000, "Cannot exceed 100,000 codes per batch"),
        amountPerCode: z
          .coerce
          .number({ invalid_type_error: "Amount per code is required" })
          .min(0.01, "Amount must be greater than 0"),
        currency: z.string().min(1, "Currency is required"),
        expirationDate: z.string().min(1, "Expiration date is required"),
        assignToUser: z.string().optional(),
      }),
    []
  )

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const selectedDate = useMemo(() => (expirationDate ? new Date(expirationDate) : undefined), [expirationDate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const parsed = schema.safeParse({
      batchName,
      totalCodes,
      amountPerCode,
      currency,
      expirationDate,
      assignToUser,
    })
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join("\n"))
      return
    }

    setSubmitting(true)
    const payload = {
      // Map legacy-specified fields into existing API contract
      name: batchName.trim(),
      prefix: "", // legacy form does not include prefix
      length: 12, // per legacy spec
      count: parsed.success ? parsed.data.totalCodes : Number(totalCodes),
      expiresAt: expirationDate,
      // Encode additional legacy fields into metadata
      metadata: JSON.stringify({
        amountPerCode: parsed.success ? parsed.data.amountPerCode : Number(amountPerCode),
        currency,
        assignToUser: assignToUser || null,
      }),
    }

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (res.ok) setJobId(data.jobId)
    else setError(data.error || "Error creating job")
    setSubmitting(false)
  }

  useEffect(() => {
    let timer: number | undefined
    async function poll() {
      if (!jobId) return
      try {
        const res = await fetch(`/api/generate/status?jobId=${encodeURIComponent(jobId)}`)
        if (res.ok) {
          const json = await res.json()
          setProgress(json.progress ?? null)
        }
      } catch {}
    }
    if (jobId) {
      poll()
      timer = window.setInterval(poll, 1500)
    }
    return () => {
      if (timer) window.clearInterval(timer)
    }
  }, [jobId])

  function onCancel() {
    setBatchName("")
    setTotalCodes("")
    setAmountPerCode("")
    setCurrency("RWF")
    setExpirationDate("")
    setAssignToUser("")
    setJobId(null)
    setProgress(null)
    setError(null)
  }

  function onClose() {
    router.push("/dashboard")
  }

  return (
    <div
      ref={containerRef}
      className="bg-background flex min-h-svh w-full items-center justify-center overflow-hidden p-2 sm:p-6"
    >
      <div
        ref={contentRef}
        style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
        className="w-full max-w-4xl"
      >
      <Card className="bg-card text-foreground">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl">Create Batch & Generate Codes</CardTitle>
          <Button aria-label="Close" variant="ghost" onClick={onClose} className="text-foreground">×</Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Batch Name */}
            <div className="md:col-span-1">
              <Label htmlFor="batch_name">Batch Name</Label>
              <Input
                id="batch_name"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="Enter batch name"
                className="mt-2"
              />
            </div>

            {/* Total Codes */}
            <div className="md:col-span-1">
              <Label htmlFor="total_codes">Total Codes</Label>
              <Input
                id="total_codes"
                type="number"
                min={1}
                max={100000}
                value={totalCodes}
                onChange={(e) => setTotalCodes(e.target.value)}
                placeholder="Enter Number of Codes"
                className="mt-2"
              />
            </div>

            {/* Amount per Code */}
            <div className="md:col-span-1">
              <Label htmlFor="amount_per_code">Amount per Code</Label>
              <Input
                id="amount_per_code"
                type="number"
                min={0.01}
                step={0.01}
                value={amountPerCode}
                onChange={(e) => setAmountPerCode(e.target.value)}
                placeholder="Enter Amount"
                className="mt-2"
              />
            </div>

            {/* Currency */}
            <div className="md:col-span-1">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency" size="default" className="mt-2 w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RWF">RWF - Rwandan Franc</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expiration Date */}
            <div className="md:col-span-1">
              <Label htmlFor="expiration_date">Expiration Date</Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="expiration_date"
                    type="button"
                    variant="outline"
                    data-empty={!selectedDate}
                    className="data-[empty=true]:text-muted-foreground mt-2 w-full justify-start text-left font-normal h-9"
                    aria-label="Pick expiration date"
                  >
                    <CalendarIcon className="mr-2" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        // Store ISO date string (yyyy-MM-dd) while presenting human-friendly format (PPP)
                        setExpirationDate(format(date, "yyyy-MM-dd"))
                        setDateOpen(false)
                      }
                    }}
                    captionLayout="dropdown"
                    disabled={[{ before: new Date() }]}
                    defaultMonth={selectedDate ?? new Date()}
                    showOutsideDays
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Assign to User */}
            <div className="md:col-span-1">
              <Label htmlFor="assign_to_user">Assign to User (optional)</Label>
              <Select value={assignToUser || undefined} onValueChange={setAssignToUser}>
                <SelectTrigger id="assign_to_user" size="default" className="mt-2 w-full">
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generator">Generator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="marketing_team">Marketing Team</SelectItem>
                  <SelectItem value="sales_team">Sales Team</SelectItem>
                </SelectContent>
              </Select>
            </div>

            

            {/* Actions */}
            <div className="md:col-span-2 mt-4 sm:mt-6 flex flex-wrap items-center justify-end gap-2">
              <Button id="cancel_button" type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button id="generate_button" type="submit" disabled={submitting}>
                {submitting ? "Generating..." : "Generate"}
              </Button>
            </div>
          </form>
          {jobId && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Job queued: {jobId}</p>
              {progress != null && <p>Progress: {progress}%</p>}
            </div>
          )}
        </CardContent>
        {error && (
          <div className="px-6 pb-6">
            <div role="alert" className="text-destructive text-sm">
              {error}
            </div>
          </div>
        )}
      </Card>
      </div>
    </div>
  )
}