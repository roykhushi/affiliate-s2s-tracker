'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface Affiliate {
  id: number
  name: string
}

export default function PostbackUrlPage() {
  const searchParams = useSearchParams()
  const affiliateId = searchParams.get('affiliate_id')
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (affiliateId) {
      fetchAffiliate()
    }
  }, [affiliateId])

  const fetchAffiliate = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/affiliates')
      const affiliates = await response.json()
      const foundAffiliate = affiliates.find((a: Affiliate) => a.id.toString() === affiliateId)
      setAffiliate(foundAffiliate || null)
    } catch (error) {
      console.error('Error fetching affiliate:', error)
    } finally {
      setLoading(false)
    }
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const postbackUrl = `${baseUrl}/api/postback?affiliate_id=${affiliateId}&click_id={click_id}&amount={amount}&currency={currency}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postbackUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (!affiliateId) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600">No affiliate selected</p>
        <Button onClick={() => window.location.href = '/'} className="mt-4">
          Go Back Home
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Postback URL for {affiliate?.name || `Affiliate ${affiliateId}`}
          </h1>
          <p className="text-muted-foreground">
            Use this URL template to send conversion data
          </p>
        </div>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Back to Home
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Postback URL Template</CardTitle>
          <CardDescription>
            Replace the placeholder values with actual data when making the request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div className="bg-muted border rounded-lg p-4 font-mono text-sm break-all">
              {postbackUrl}
            </div>
            <Button
              onClick={copyToClipboard}
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <code className="text-sm bg-muted px-2 py-1 rounded">affiliate_id</code>
              <p className="text-sm text-muted-foreground mt-1">Your affiliate ID (already filled in)</p>
            </div>
            <div>
              <code className="text-sm bg-muted px-2 py-1 rounded">{'{click_id}'}</code>
              <p className="text-sm text-muted-foreground mt-1">Replace with the actual click ID from tracking</p>
            </div>
            <div>
              <code className="text-sm bg-muted px-2 py-1 rounded">{'{amount}'}</code>
              <p className="text-sm text-muted-foreground mt-1">Replace with the conversion amount (e.g., 100.50)</p>
            </div>
            <div>
              <code className="text-sm bg-muted px-2 py-1 rounded">{'{currency}'}</code>
              <p className="text-sm text-muted-foreground mt-1">Replace with currency code (e.g., USD, EUR)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Example Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Here's how the URL would look with actual values:
            </p>
            <div className="bg-muted border rounded-lg p-3 font-mono text-xs break-all">
              {baseUrl}/api/postback?affiliate_id={affiliateId}&click_id=abc123&amount=99.99&currency=USD
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              This would record a $99.99 USD conversion for click ID "abc123"
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integration Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm">1. Track Clicks First</h4>
            <p className="text-sm text-muted-foreground">
              Make sure to track clicks using: <code className="bg-muted px-1 rounded">/api/click?affiliate_id={affiliateId}&click_id=YOUR_CLICK_ID</code>
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">2. Fire Postback on Conversion</h4>
            <p className="text-sm text-muted-foreground">
              When a conversion happens, make a GET request to the postback URL with the actual values
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">3. Check Response</h4>
            <p className="text-sm text-muted-foreground">
              The API will return JSON with success/error status. 200 status means conversion was recorded successfully
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
