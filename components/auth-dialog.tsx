"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { verifyPassphrase, setPassphrase } from '@/lib/auth'
import { toast } from 'sonner'

export function AuthDialog() {
  const [isOpen, setIsOpen] = useState(true)
  const [passphrase, setPassphrase] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const isValid = await verifyPassphrase(passphrase)
      if (isValid) {
        localStorage.setItem('isAdmin', 'true')
        setIsOpen(false)
        toast.success('authenticated as admin')
        router.refresh()
      } else {
        toast.error('invalid passphrase')
      }
    } catch (error) {
      toast.error('authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>admin authentication</DialogTitle>
          <DialogDescription>
            enter the admin passphrase to manage bookmarks
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="enter passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            authenticate
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}