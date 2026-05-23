import { DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EarningsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
        <p className="text-slate-500 mt-1">Track your revenue from completed jobs.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">This month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-12 text-center text-slate-400">
            <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 opacity-40" />
            </div>
            <p className="text-sm font-medium text-slate-600">Earnings tracking coming soon</p>
            <p className="text-xs mt-1 max-w-xs text-slate-400">
              Once you complete jobs through Brio, your earnings will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
