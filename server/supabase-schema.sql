-- =====================================================
-- SUPABASE MIGRATION SCHEMA FOR TRACKMATE
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ACCOUNTS TABLE (replaces Account model)
-- Links to auth.users for Supabase Auth
-- =====================================================
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_id VARCHAR(10) UNIQUE NOT NULL, -- Format: TM-XXXXX
    api_key VARCHAR(100) UNIQUE,
    api_key_created_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for accounts
CREATE INDEX idx_accounts_company_id ON accounts(company_id);
CREATE INDEX idx_accounts_api_key ON accounts(api_key);
CREATE INDEX idx_accounts_auth_user_id ON accounts(auth_user_id);

-- =====================================================
-- 2. PROFILES TABLE (replaces Profile model)
-- End-user profiles being tracked
-- =====================================================
CREATE TYPE profile_source AS ENUM ('form', 'api', 'webhook', 'manual', 'import');

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    company_id VARCHAR(10) NOT NULL,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    source profile_source DEFAULT 'api',
    list_id VARCHAR(20), -- LST-XXXXXX format
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Foreign key to accounts
    CONSTRAINT fk_profiles_company FOREIGN KEY (company_id)
        REFERENCES accounts(company_id) ON DELETE CASCADE
);

-- Indexes for profiles (matching MongoDB compound indexes)
CREATE UNIQUE INDEX idx_profiles_email_company ON profiles(email, company_id) WHERE email IS NOT NULL;
CREATE INDEX idx_profiles_company_created ON profiles(company_id, created_at DESC);
CREATE INDEX idx_profiles_company_last_active ON profiles(company_id, last_active DESC);

-- =====================================================
-- 3. EVENTS TABLES (replaces Event model)
-- Normalized from nested array structure
-- =====================================================
CREATE TABLE event_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    company_id VARCHAR(10) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    list_id VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_event_sessions_company FOREIGN KEY (company_id)
        REFERENCES accounts(company_id) ON DELETE CASCADE
);

-- Indexes for event_sessions
CREATE INDEX idx_event_sessions_session_company ON event_sessions(session_id, company_id);
CREATE INDEX idx_event_sessions_profile_company ON event_sessions(profile_id, company_id);
CREATE INDEX idx_event_sessions_session_company_profile ON event_sessions(session_id, company_id, profile_id);

-- Individual events within a session
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_session_id UUID NOT NULL REFERENCES event_sessions(id) ON DELETE CASCADE,
    event_type VARCHAR(255) NOT NULL,
    event_data JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX idx_events_session ON events(event_session_id);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX idx_events_type ON events(event_type);

-- =====================================================
-- 4. WEBHOOK_LOGS TABLE (replaces WebhookLog model)
-- =====================================================
CREATE TYPE http_method AS ENUM ('GET', 'POST', 'PUT', 'DELETE', 'PATCH');

CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id VARCHAR(10) NOT NULL,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    endpoint VARCHAR(500) NOT NULL,
    method http_method NOT NULL,
    status_code INTEGER NOT NULL,
    request_payload JSONB,
    response_payload JSONB,
    error_message TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_webhook_logs_company FOREIGN KEY (company_id)
        REFERENCES accounts(company_id) ON DELETE CASCADE
);

-- Indexes for webhook_logs
CREATE INDEX idx_webhook_logs_company_created ON webhook_logs(company_id, created_at DESC);
CREATE INDEX idx_webhook_logs_account_created ON webhook_logs(account_id, created_at DESC);
CREATE INDEX idx_webhook_logs_company_status_created ON webhook_logs(company_id, status_code, created_at DESC);
CREATE INDEX idx_webhook_logs_company_endpoint_created ON webhook_logs(company_id, endpoint, created_at DESC);

-- =====================================================
-- 5. TAGS TABLE (replaces Tag model)
-- =====================================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company_id VARCHAR(10) NOT NULL,
    color VARCHAR(20) DEFAULT '#3B82F6',
    description TEXT DEFAULT '',
    profile_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_tags_company FOREIGN KEY (company_id)
        REFERENCES accounts(company_id) ON DELETE CASCADE
);

-- Indexes for tags
CREATE UNIQUE INDEX idx_tags_name_company ON tags(name, company_id);
CREATE INDEX idx_tags_company_created ON tags(company_id, created_at DESC);

-- =====================================================
-- 6. PROFILE_TAGS TABLE (replaces ProfileTag model)
-- Junction table for many-to-many relationship
-- =====================================================
CREATE TYPE tag_added_by AS ENUM ('manual', 'automation', 'api', 'event', 'form');

CREATE TABLE profile_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    company_id VARCHAR(10) NOT NULL,
    added_by tag_added_by DEFAULT 'manual',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_profile_tags_company FOREIGN KEY (company_id)
        REFERENCES accounts(company_id) ON DELETE CASCADE
);

-- Indexes for profile_tags
CREATE UNIQUE INDEX idx_profile_tags_unique ON profile_tags(profile_id, tag_id, company_id);
CREATE INDEX idx_profile_tags_tag_company ON profile_tags(tag_id, company_id);
CREATE INDEX idx_profile_tags_profile_company ON profile_tags(profile_id, company_id);
CREATE INDEX idx_profile_tags_company_created ON profile_tags(company_id, created_at DESC);

-- =====================================================
-- 7. LISTS TABLE (replaces List model)
-- =====================================================
CREATE TYPE list_status AS ENUM ('active', 'archived');
CREATE TYPE tag_logic_type AS ENUM ('any', 'all');

CREATE TABLE lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id VARCHAR(20) UNIQUE NOT NULL, -- Format: LST-XXXXXX (auto-generated)
    company_id VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    tag_logic tag_logic_type DEFAULT 'any',
    profile_count INTEGER DEFAULT 0,
    status list_status DEFAULT 'active',
    created_by UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_lists_company FOREIGN KEY (company_id)
        REFERENCES accounts(company_id) ON DELETE CASCADE
);

-- Indexes for lists
CREATE INDEX idx_lists_company_created ON lists(company_id, created_at DESC);
CREATE INDEX idx_lists_company_status ON lists(company_id, status);

-- =====================================================
-- 8. LIST_TAGS TABLE (junction for List-Tag many-to-many)
-- Replaces the tags array in List model
-- =====================================================
CREATE TABLE list_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_list_tag UNIQUE (list_id, tag_id)
);

-- Indexes for list_tags
CREATE INDEX idx_list_tags_list ON list_tags(list_id);
CREATE INDEX idx_list_tags_tag ON list_tags(tag_id);

-- =====================================================
-- 9. CAMPAIGNS TABLE (replaces Campaign model)
-- =====================================================
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed', 'paused');

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',

    -- Email content
    subject VARCHAR(500) NOT NULL,
    preview_text VARCHAR(500) DEFAULT '',
    from_name VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    reply_to VARCHAR(255) DEFAULT '',
    html_content TEXT NOT NULL,
    text_content TEXT DEFAULT '',

    -- Target list
    list_id UUID NOT NULL REFERENCES lists(id) ON DELETE RESTRICT,

    -- Status and scheduling
    status campaign_status DEFAULT 'draft',
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,

    -- Statistics
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,

    -- Error tracking
    last_error TEXT,

    created_by UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_campaigns_company FOREIGN KEY (company_id)
        REFERENCES accounts(company_id) ON DELETE CASCADE
);

-- Indexes for campaigns
CREATE INDEX idx_campaigns_company_created ON campaigns(company_id, created_at DESC);
CREATE INDEX idx_campaigns_company_status ON campaigns(company_id, status);
CREATE INDEX idx_campaigns_list ON campaigns(list_id, company_id);
CREATE INDEX idx_campaigns_scheduled ON campaigns(scheduled_at, status);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to generate list_id (replaces pre-save hook)
CREATE OR REPLACE FUNCTION generate_list_id()
RETURNS TRIGGER AS $$
DECLARE
    new_id VARCHAR(20);
    chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    i INTEGER;
    attempts INTEGER := 0;
    max_attempts INTEGER := 10;
BEGIN
    IF NEW.list_id IS NULL OR NEW.list_id = '' THEN
        LOOP
            new_id := 'LST-';
            FOR i IN 1..6 LOOP
                new_id := new_id || substr(chars, floor(random() * 36 + 1)::integer, 1);
            END LOOP;

            -- Check if exists
            IF NOT EXISTS (SELECT 1 FROM lists WHERE list_id = new_id) THEN
                NEW.list_id := new_id;
                EXIT;
            END IF;

            attempts := attempts + 1;
            IF attempts >= max_attempts THEN
                RAISE EXCEPTION 'Failed to generate unique list_id';
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating list_id
CREATE TRIGGER trigger_generate_list_id
    BEFORE INSERT ON lists
    FOR EACH ROW
    EXECUTE FUNCTION generate_list_id();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER trigger_accounts_updated_at
    BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_tags_updated_at
    BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_lists_updated_at
    BEFORE UPDATE ON lists FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_campaigns_updated_at
    BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- HELPER FUNCTION FOR WEBHOOK STATS
-- =====================================================
CREATE OR REPLACE FUNCTION get_webhook_stats(p_company_id VARCHAR(10), p_days INTEGER DEFAULT 7)
RETURNS TABLE (
    total_requests BIGINT,
    successful_requests BIGINT,
    failed_requests BIGINT,
    avg_processing_time NUMERIC,
    success_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_requests,
        COUNT(*) FILTER (WHERE status_code < 400)::BIGINT as successful_requests,
        COUNT(*) FILTER (WHERE status_code >= 400)::BIGINT as failed_requests,
        ROUND(AVG(processing_time_ms)::NUMERIC, 2) as avg_processing_time,
        ROUND((COUNT(*) FILTER (WHERE status_code < 400)::NUMERIC / NULLIF(COUNT(*), 0) * 100), 2) as success_rate
    FROM webhook_logs
    WHERE company_id = p_company_id
      AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Helper function to get company_id for current user
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS VARCHAR(10) AS $$
    SELECT company_id FROM accounts WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Accounts: Users can only access their own account
CREATE POLICY "Users can view own account" ON accounts
    FOR SELECT USING (auth_user_id = auth.uid());
CREATE POLICY "Users can update own account" ON accounts
    FOR UPDATE USING (auth_user_id = auth.uid());

-- Profiles: Company-level access
CREATE POLICY "Company profiles select" ON profiles
    FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Company profiles insert" ON profiles
    FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Company profiles update" ON profiles
    FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Company profiles delete" ON profiles
    FOR DELETE USING (company_id = get_user_company_id());

-- Event sessions: Company-level access
CREATE POLICY "Company event_sessions select" ON event_sessions
    FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Company event_sessions insert" ON event_sessions
    FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Company event_sessions update" ON event_sessions
    FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Company event_sessions delete" ON event_sessions
    FOR DELETE USING (company_id = get_user_company_id());

-- Events: Through event_sessions (using subquery)
CREATE POLICY "Company events select" ON events
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM event_sessions WHERE id = events.event_session_id AND company_id = get_user_company_id())
    );
CREATE POLICY "Company events insert" ON events
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM event_sessions WHERE id = events.event_session_id AND company_id = get_user_company_id())
    );
CREATE POLICY "Company events update" ON events
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM event_sessions WHERE id = events.event_session_id AND company_id = get_user_company_id())
    );
CREATE POLICY "Company events delete" ON events
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM event_sessions WHERE id = events.event_session_id AND company_id = get_user_company_id())
    );

-- Webhook logs: Company-level access
CREATE POLICY "Company webhook_logs select" ON webhook_logs
    FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Company webhook_logs insert" ON webhook_logs
    FOR INSERT WITH CHECK (company_id = get_user_company_id());

-- Tags: Company-level access
CREATE POLICY "Company tags select" ON tags
    FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Company tags insert" ON tags
    FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Company tags update" ON tags
    FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Company tags delete" ON tags
    FOR DELETE USING (company_id = get_user_company_id());

-- Profile tags: Company-level access
CREATE POLICY "Company profile_tags select" ON profile_tags
    FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Company profile_tags insert" ON profile_tags
    FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Company profile_tags update" ON profile_tags
    FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Company profile_tags delete" ON profile_tags
    FOR DELETE USING (company_id = get_user_company_id());

-- Lists: Company-level access
CREATE POLICY "Company lists select" ON lists
    FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Company lists insert" ON lists
    FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Company lists update" ON lists
    FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Company lists delete" ON lists
    FOR DELETE USING (company_id = get_user_company_id());

-- List tags: Through lists
CREATE POLICY "Company list_tags select" ON list_tags
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM lists WHERE id = list_tags.list_id AND company_id = get_user_company_id())
    );
CREATE POLICY "Company list_tags insert" ON list_tags
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM lists WHERE id = list_tags.list_id AND company_id = get_user_company_id())
    );
CREATE POLICY "Company list_tags delete" ON list_tags
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM lists WHERE id = list_tags.list_id AND company_id = get_user_company_id())
    );

-- Campaigns: Company-level access
CREATE POLICY "Company campaigns select" ON campaigns
    FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Company campaigns insert" ON campaigns
    FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Company campaigns update" ON campaigns
    FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Company campaigns delete" ON campaigns
    FOR DELETE USING (company_id = get_user_company_id());

-- =====================================================
-- SERVICE ROLE BYPASS
-- The service_role key bypasses RLS by default in Supabase
-- This is used for:
-- - Tracking snippet (public event creation)
-- - Webhook endpoints (API key authenticated)
-- - Server-side operations
-- =====================================================

-- Grant necessary permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
