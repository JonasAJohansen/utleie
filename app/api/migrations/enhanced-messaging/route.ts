import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Enhancing messaging system...');
    
    // Add new columns to messages table for enhanced features
    await sql`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS file_url TEXT,
      ADD COLUMN IF NOT EXISTS file_name TEXT,
      ADD COLUMN IF NOT EXISTS file_size BIGINT,
      ADD COLUMN IF NOT EXISTS file_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 7),
      ADD COLUMN IF NOT EXISTS location_lng DECIMAL(10, 7),
      ADD COLUMN IF NOT EXISTS location_name TEXT,
      ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES messages(id),
      ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS is_template_response BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS template_id VARCHAR(100)
    `
    
    console.log('Creating message_attachments table...');
    
    // Create message attachments table for multiple file support
    await sql`
      CREATE TABLE IF NOT EXISTS message_attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        file_url TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        mime_type VARCHAR(200),
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_image BOOLEAN DEFAULT false,
        thumbnail_url TEXT,
        
        CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 104857600) -- 100MB limit
      )
    `
    
    console.log('Creating quick_response_templates table...');
    
    // Create quick response templates table
    await sql`
      CREATE TABLE IF NOT EXISTS quick_response_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(100) NOT NULL,
        template_text TEXT NOT NULL,
        usage_count INTEGER DEFAULT 0,
        is_system_template BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    console.log('Creating message_read_receipts table...');
    
    // Create read receipts table for detailed tracking
    await sql`
      CREATE TABLE IF NOT EXISTS message_read_receipts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(message_id, user_id)
      )
    `
    
    console.log('Creating typing_indicators table...');
    
    // Create typing indicators table
    await sql`
      CREATE TABLE IF NOT EXISTS typing_indicators (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_typing BOOLEAN DEFAULT true,
        last_typed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(conversation_id, user_id)
      )
    `
    
    console.log('Creating booking_notifications table...');
    
    // Create booking notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS booking_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID REFERENCES rental_requests(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        notification_type VARCHAR(100) NOT NULL, -- 'booking_confirmed', 'booking_reminder', 'return_reminder'
        delivery_method VARCHAR(50) NOT NULL, -- 'email', 'sms', 'in_app'
        recipient_contact TEXT NOT NULL, -- email or phone number
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'delivered'
        sent_at TIMESTAMP WITH TIME ZONE,
        delivered_at TIMESTAMP WITH TIME ZONE,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    console.log('Creating indexes...');
    
    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_file_type ON messages(file_type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_location ON messages(location_lat, location_lng)`
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_message_attachments_file_type ON message_attachments(file_type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_quick_templates_user_category ON quick_response_templates(user_id, category)`
    await sql`CREATE INDEX IF NOT EXISTS idx_read_receipts_message_user ON message_read_receipts(message_id, user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation ON typing_indicators(conversation_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_booking_notifications_status ON booking_notifications(status, created_at)`
    
    console.log('Inserting default quick response templates...');
    
    // Insert default system quick response templates
    await sql`
      INSERT INTO quick_response_templates (category, template_text, is_system_template) VALUES
      ('availability', 'Ja, den er tilgjengelig!', true),
      ('availability', 'Beklager, den er ikke tilgjengelig på de datoene.', true),
      ('availability', 'La meg sjekke kalenderen min og komme tilbake til deg.', true),
      ('scheduling', 'Hva med kl 14:00?', true),
      ('scheduling', 'Hvilken tid passer best for deg?', true),
      ('scheduling', 'Kan vi møtes i morgen?', true),
      ('scheduling', 'Er du ledig på lørdag?', true),
      ('location', 'Vi kan møtes på Jernbanetorget.', true),
      ('location', 'Jeg kan levere til Oslo sentrum.', true),
      ('location', 'Hvor ville du ønske å møtes?', true),
      ('pricing', 'Prisen er som oppgitt i annonsen.', true),
      ('pricing', 'Jeg kan gi deg en bedre pris for lengre leie.', true),
      ('pricing', 'Er du interessert i å leie for flere dager?', true),
      ('general', 'Takk for interessen!', true),
      ('general', 'Jeg sender deg flere bilder.', true),
      ('general', 'Kan jeg ringe deg?', true),
      ('general', 'Tusen takk!', true),
      ('booking', 'Bookingen er bekreftet!', true),
      ('booking', 'Jeg har sendt deg betalingsinformasjon.', true),
      ('booking', 'Husk å ta godt vare på gjenstanden.', true)
      ON CONFLICT DO NOTHING
    `
    
    console.log('Creating message update triggers...');
    
    // Create trigger to update read_at when message_read_receipts is inserted
    await sql`
      CREATE OR REPLACE FUNCTION update_message_read_status()
      RETURNS TRIGGER AS $$
      BEGIN
          UPDATE messages 
          SET read_at = NEW.read_at
          WHERE id = NEW.message_id 
          AND read_at IS NULL;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `
    
    await sql`
      DROP TRIGGER IF EXISTS trigger_update_message_read_status ON message_read_receipts;
      CREATE TRIGGER trigger_update_message_read_status
          AFTER INSERT ON message_read_receipts
          FOR EACH ROW
          EXECUTE FUNCTION update_message_read_status()
    `
    
    console.log('Enhanced messaging system migration completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Enhanced messaging system created successfully' 
    });
    
  } catch (error) {
    console.error('Error creating enhanced messaging system:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 