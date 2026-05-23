'use client'

import { useTransition, useState } from 'react'
import { Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { claimJob } from './actions'

export function ClaimButton({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition()
  const [claimed, setClaimed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleClaim() {
    startTransition(async () => {
      const result = await claimJob(jobId)
      if (result.error) {
        setError(result.error)
      } else {
        setClaimed(true)
      }
    })
  }

  if (claimed) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
        <CheckCircle className="h-3.5 w-3.5" /> Claimed
      </span>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs"
        onClick={handleClaim}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Claim Lead'}
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
