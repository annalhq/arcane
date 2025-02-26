/*
  # Initial Bookmark Manager Schema

  1. New Tables
    - `passphrases`
      - `id` (uuid, primary key)
      - `hash` (text, encrypted admin passphrase)
      - `created_at` (timestamp)
    
    - `bookmarks`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional, markdown)
      - `urls` (text[], at least one required)
      - `favorite` (boolean)
      - `read_later` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `color` (text, hex color)
      - `created_at` (timestamp)
    
    - `bookmark_tags`
      - `bookmark_id` (uuid, foreign key)
      - `tag_id` (uuid, foreign key)

  2. Security
    - Enable RLS on all tables
    - Public read access for bookmarks and tags
    - Admin-only write access
*/

-- Create tables
CREATE TABLE IF NOT EXISTS passphrases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  urls text[] NOT NULL CHECK (array_length(urls, 1) > 0),
  favorite boolean DEFAULT false,
  read_later boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text NOT NULL CHECK (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookmark_tags (
  bookmark_id uuid REFERENCES bookmarks(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (bookmark_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE passphrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for bookmarks"
  ON bookmarks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for tags"
  ON tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for bookmark_tags"
  ON bookmark_tags
  FOR SELECT
  TO public
  USING (true);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookmarks_updated_at
  BEFORE UPDATE ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_title ON bookmarks USING gin (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_bookmarks_description ON bookmarks USING gin (to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags (name);