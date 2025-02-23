-- Add is_read column to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE NOT is_read;

-- Update existing messages
UPDATE messages 
SET is_read = false
WHERE is_read IS NULL; 