'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Affiliate {
  id: number
  name: string
}

export default function HomePage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [selectedAffiliate, setSelectedAffiliate] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchAffiliates()
  }, [])

  const fetchAffiliates = async () => {
    try {
      const response = await fetch('/api/affiliates')
      const data = await response.json()
      setAffiliates(data)
    } catch (error) {
      console.error('Error fetching affiliates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDashboard = () => {
    if (selectedAffiliate) {
      router.push(`/dashboard?affiliate_id=${selectedAffiliate}`)
    }
  }

  const handleViewPostbackUrl = () => {
    if (selectedAffiliate) {
      router.push(`/postback-url?affiliate_id=${selectedAffiliate}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Affiliate Postback Tracking System
        </h1>
        <p className="text-lg text-muted-foreground">
          Select an affiliate to view their dashboard or postback URL
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Select Affiliate</CardTitle>
            <CardDescription>
              Choose an affiliate to access their tracking data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedAffiliate} onValueChange={setSelectedAffiliate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an affiliate" />
              </SelectTrigger>
              <SelectContent>
                {affiliates.map((affiliate) => (
                  <SelectItem key={affiliate.id} value={affiliate.id.toString()}>
                    {affiliate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <Button 
                onClick={handleViewDashboard} 
                disabled={!selectedAffiliate}
                className="w-full"
              >
                View Dashboard
              </Button>
              <Button 
                onClick={handleViewPostbackUrl} 
                disabled={!selectedAffiliate}
                variant="outline"
                className="w-full"
              >
                View Postback URL
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Click Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Track clicks with this endpoint:
            </p>
            <code className="text-xs bg-muted p-2 rounded block">
              GET /click?affiliate_id=1&click_id=abc123
            </code>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Postback Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Track conversions with this endpoint:
            </p>
            <code className="text-xs bg-muted p-2 rounded block">
              GET /postback?affiliate_id=1&click_id=abc123&amount=100&currency=USD
            </code>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View all conversions for an affiliate in a simple table format with click IDs, amounts, and timestamps.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
