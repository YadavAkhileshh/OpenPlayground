-- Create snippets table
CREATE TABLE IF NOT EXISTS snippets (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  language VARCHAR(50) DEFAULT 'javascript',
  is_favorite BOOLEAN DEFAULT FALSE,
  collection_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(20) DEFAULT '#6366f1'
);

-- Add foreign key
ALTER TABLE snippets 
ADD CONSTRAINT fk_collection 
FOREIGN KEY (collection_id) 
REFERENCES collections(id) 
ON DELETE SET NULL;

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Create bridge table for many-to-many relationship
CREATE TABLE IF NOT EXISTS snippet_tags (
  snippet_id INTEGER REFERENCES snippets(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (snippet_id, tag_id)
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_snippets_updated_at
BEFORE UPDATE ON snippets
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
