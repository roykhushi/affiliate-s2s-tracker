'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Conversion {
  id: number
  click_id: string
  amount: number
  currency: string
  created_at: string
  click_created_at: string
}

interface AffiliateData {
  affiliate: {
    name: string
  }
  conversions: Conversion[]
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const affiliateId = searchParams.get('affiliate_id')
  const [data, setData] = useState<AffiliateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (affiliateId) {
      fetchConversions()
    }
  }, [affiliateId])

  const fetchConversions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/affiliate/${affiliateId}/conversions`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversions')
      }
      
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching conversions:', error)
      setError('Failed to load conversion data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
  }

  const getTotalRevenue = () => {
    if (!data?.conversions) return 0
    return data.conversions.reduce((sum, conv) => sum + conv.amount, 0)
  }

  if (!affiliateId) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-muted-foreground">No affiliate selected</p>
        <Button onClick={() => window.location.href = '/'} className="mt-4">
          Go Back Home
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading conversions...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <Button onClick={fetchConversions} variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {data?.affiliate?.name || `Affiliate ${affiliateId}`} Dashboard
          </h1>
          <p className="text-muted-foreground">
            View all conversions and tracking data
          </p>
        </div>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Back to Home
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.conversions?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(getTotalRevenue(), data?.conversions?.[0]?.currency || 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.conversions?.length 
                ? formatAmount(getTotalRevenue() / data.conversions.length, data?.conversions?.[0]?.currency || 'USD')
                : '$0.00'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversions</CardTitle>
          <CardDescription>
            All recorded conversions for this affiliate
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.conversions && data.conversions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Click ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Click Date</TableHead>
                  <TableHead>Conversion Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.conversions.map((conversion) => (
                  <TableRow key={conversion.id}>
                    <TableCell className="font-mono text-sm">
                      {conversion.click_id}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatAmount(conversion.amount, conversion.currency)}
                    </TableCell>
                    <TableCell>{conversion.currency}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(conversion.click_created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(conversion.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No conversions found for this affiliate</p>
              <p className="text-sm text-muted-foreground mt-2">
                Conversions will appear here once postbacks are received
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
