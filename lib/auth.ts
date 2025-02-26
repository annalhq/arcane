import { createHash } from 'crypto'
import { supabase } from './supabase/client'

export async function verifyPassphrase(passphrase: string): Promise<boolean> {
  const hash = createHash('sha256').update(passphrase).digest('hex')
  
  const { data, error } = await supabase
    .from('passphrases')
    .select('hash')
    .single()

  if (error) {
    console.error('Error verifying passphrase:', error)
    return false
  }

  return data?.hash === hash
}

export async function setPassphrase(passphrase: string): Promise<boolean> {
  const hash = createHash('sha256').update(passphrase).digest('hex')
  
  const { error } = await supabase
    .from('passphrases')
    .insert({ hash })

  if (error) {
    console.error('Error setting passphrase:', error)
    return false
  }

  return true
}