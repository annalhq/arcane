export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bookmark_tags: {
        Row: {
          bookmark_id: string
          tag_id: string
        }
        Insert: {
          bookmark_id: string
          tag_id: string
        }
        Update: {
          bookmark_id?: string
          tag_id?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          title: string
          description: string | null
          urls: string[]
          favorite: boolean
          read_later: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          urls: string[]
          favorite?: boolean
          read_later?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          urls?: string[]
          favorite?: boolean
          read_later?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      passphrases: {
        Row: {
          id: string
          hash: string
          created_at: string
        }
        Insert: {
          id?: string
          hash: string
          created_at?: string
        }
        Update: {
          id?: string
          hash?: string
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
    }
  }
}