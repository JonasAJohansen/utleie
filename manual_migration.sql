    -- Manual Database Migration for Sponsored Listings
    -- Run these statements in order in your PostgreSQL database

    -- 1. Create sponsorship packages table
    CREATE TABLE IF NOT EXISTS sponsorship_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_nok DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 30,
    stripe_price_id VARCHAR(255),
    position_priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Create payments table
    CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    package_id UUID REFERENCES sponsorship_packages(id),
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255),
    amount_nok DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NOK',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method_type VARCHAR(50),
    stripe_webhook_received BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Create sponsored listings table
    CREATE TABLE IF NOT EXISTS sponsored_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id),
    package_id UUID NOT NULL REFERENCES sponsorship_packages(id),
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
    category_id VARCHAR(255) REFERENCES categories(name),
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    position_priority INTEGER DEFAULT 1,
    impressions_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Add sponsored listing columns to listings table
    ALTER TABLE listings 
    ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT false;

    ALTER TABLE listings 
    ADD COLUMN IF NOT EXISTS sponsored_until TIMESTAMP WITH TIME ZONE;

    -- 5. Add missing columns to categories table
    ALTER TABLE categories 
    ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;

    ALTER TABLE categories 
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

    -- 6. Create quick response templates table
    CREATE TABLE IF NOT EXISTS quick_response_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id),
    category VARCHAR(100) NOT NULL,
    template_text TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    is_system_template BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 7. Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
    CREATE INDEX IF NOT EXISTS idx_payments_listing_id ON payments(listing_id);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);

    CREATE INDEX IF NOT EXISTS idx_sponsored_listings_listing_id ON sponsored_listings(listing_id);
    CREATE INDEX IF NOT EXISTS idx_sponsored_listings_category_id ON sponsored_listings(category_id);
    CREATE INDEX IF NOT EXISTS idx_sponsored_listings_expires_at ON sponsored_listings(expires_at);
    CREATE INDEX IF NOT EXISTS idx_sponsored_listings_is_active ON sponsored_listings(is_active);
    CREATE INDEX IF NOT EXISTS idx_sponsored_listings_priority ON sponsored_listings(position_priority);

    CREATE INDEX IF NOT EXISTS idx_listings_is_sponsored ON listings(is_sponsored);
    CREATE INDEX IF NOT EXISTS idx_listings_sponsored_until ON listings(sponsored_until);

    CREATE INDEX IF NOT EXISTS idx_quick_response_templates_user_id ON quick_response_templates(user_id);
    CREATE INDEX IF NOT EXISTS idx_quick_response_templates_category ON quick_response_templates(category);

    -- 8. Insert default sponsorship packages
    INSERT INTO sponsorship_packages (name, description, price_nok, duration_days, position_priority) 
    VALUES 
    ('Basic Sponsorship', 'Featured placement for 7 days in your category', 199.00, 7, 1),
    ('Premium Sponsorship', 'Top placement for 30 days with enhanced visibility', 699.00, 30, 2),
    ('Extended Sponsorship', 'Maximum visibility for 90 days with priority positioning', 1899.00, 90, 3)
    ON CONFLICT DO NOTHING;

    -- 9. Add is_admin column to users table
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

    -- 10. Insert default quick response templates
    INSERT INTO quick_response_templates (category, template_text, is_system_template) 
    VALUES 
    ('General', 'Hei! Er denne gjenstanden fortsatt tilgjengelig?', true),
    ('General', 'Takk for meldingen! Jeg svarer så snart som mulig.', true),
    ('General', 'Kan vi avtale en tid for å hente/levere?', true),
    ('General', 'Perfekt! Når passer det best for deg?', true),
    ('General', 'Beklager, men denne er ikke tilgjengelig lenger.', true),
    ('Rental', 'Hvor lenge trenger du å leie denne?', true),
    ('Rental', 'Kan du hente den i dag?', true),
    ('Rental', 'Hva er din adresse for levering?', true),
    ('Rental', 'Takk for at du leide hos meg!', true),
    ('Inquiry', 'Kan du fortelle meg mer om tilstanden?', true),
    ('Inquiry', 'Har du flere bilder?', true),
    ('Inquiry', 'Hvor gammel er denne gjenstanden?', true)
    ON CONFLICT DO NOTHING;

    -- 7. Create function to update listing sponsorship status
    CREATE OR REPLACE FUNCTION update_listing_sponsorship_status()
    RETURNS TRIGGER AS $$
    BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE listings 
        SET 
        is_sponsored = CASE 
            WHEN NEW.is_active AND NEW.expires_at > CURRENT_TIMESTAMP THEN true
            ELSE false
        END,
        sponsored_until = CASE 
            WHEN NEW.is_active AND NEW.expires_at > CURRENT_TIMESTAMP THEN NEW.expires_at
            ELSE NULL
        END
        WHERE id = NEW.listing_id;
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE listings 
        SET is_sponsored = false, sponsored_until = NULL
        WHERE id = OLD.listing_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    -- 8. Create trigger to automatically update listing sponsorship status
    DROP TRIGGER IF EXISTS trigger_update_listing_sponsorship ON sponsored_listings;
    CREATE TRIGGER trigger_update_listing_sponsorship
    AFTER INSERT OR UPDATE OR DELETE ON sponsored_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_listing_sponsorship_status();

    -- 9. Create function to clean up expired sponsorships
    CREATE OR REPLACE FUNCTION cleanup_expired_sponsorships()
    RETURNS INTEGER AS $$
    DECLARE
    updated_count INTEGER;
    BEGIN
    UPDATE sponsored_listings 
    SET is_active = false 
    WHERE is_active = true 
        AND expires_at <= CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    UPDATE listings 
    SET is_sponsored = false, sponsored_until = NULL
    WHERE is_sponsored = true 
        AND (sponsored_until IS NULL OR sponsored_until <= CURRENT_TIMESTAMP);
    
    RETURN updated_count;
    END;
    $$ LANGUAGE plpgsql;

    -- 10. Create function to get random sponsored listing for a category
    CREATE OR REPLACE FUNCTION get_random_sponsored_listing_for_category(target_category VARCHAR(255))
    RETURNS TABLE(listing_id UUID, priority INTEGER) AS $$
    BEGIN
    RETURN QUERY
    SELECT 
        sl.listing_id,
        sl.position_priority as priority
    FROM sponsored_listings sl
    JOIN listings l ON sl.listing_id = l.id
    WHERE sl.is_active = true
        AND sl.expires_at > CURRENT_TIMESTAMP
        AND (sl.category_id = target_category OR sl.category_id IS NULL)
        AND l.status = 'active'
    ORDER BY 
        sl.position_priority DESC,
        RANDOM()
    LIMIT 1;
    END;
    $$ LANGUAGE plpgsql;

    -- 11. Add comments for documentation
    COMMENT ON TABLE sponsorship_packages IS 'Defines available sponsorship tiers and pricing';
    COMMENT ON TABLE payments IS 'Tracks all Stripe payment transactions';
    COMMENT ON TABLE sponsored_listings IS 'Active sponsored listings with expiration and analytics';
    COMMENT ON COLUMN payments.stripe_payment_intent_id IS 'Stripe PaymentIntent ID for webhook verification';
    COMMENT ON COLUMN sponsored_listings.impressions_count IS 'Number of times the sponsored listing was displayed';
    COMMENT ON COLUMN sponsored_listings.clicks_count IS 'Number of times the sponsored listing was clicked';
    COMMENT ON FUNCTION cleanup_expired_sponsorships IS 'Utility function to deactivate expired sponsorships (run via cron)';
    COMMENT ON FUNCTION get_random_sponsored_listing_for_category IS 'Returns a random active sponsored listing for the given category';

    -- Migration complete! 
    -- You can verify the tables were created by running:
    -- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('sponsorship_packages', 'payments', 'sponsored_listings');
