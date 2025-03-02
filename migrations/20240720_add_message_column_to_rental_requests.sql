-- Add message column to rental_requests table
ALTER TABLE rental_requests 
ADD COLUMN IF NOT EXISTS message TEXT;

-- Migration info
COMMENT ON COLUMN rental_requests.message IS 'Optional message from requester to the owner'; 