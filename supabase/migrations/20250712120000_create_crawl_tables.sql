-- Create crawls table for site-wide crawling (Phase 2.1)
CREATE TABLE crawls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    root_url TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    pages_scanned INTEGER DEFAULT 0,
    total_pages_found INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Create crawl_pages table to track individual pages in a crawl
CREATE TABLE crawl_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crawl_id UUID NOT NULL REFERENCES crawls(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'scanning', 'completed', 'failed')),
    http_status INTEGER,
    scan_result_id UUID, -- FK to scans table (will be created when page is scanned)
    error_message TEXT,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scanned_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_crawls_user_id ON crawls(user_id);
CREATE INDEX idx_crawls_status ON crawls(status);
CREATE INDEX idx_crawl_pages_crawl_id ON crawl_pages(crawl_id);
CREATE INDEX idx_crawl_pages_status ON crawl_pages(status);
CREATE INDEX idx_crawl_pages_url ON crawl_pages(url);

-- Add RLS policies (Row Level Security)
ALTER TABLE crawls ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_pages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own crawls
CREATE POLICY "Users can view their own crawls" ON crawls
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own crawls" ON crawls
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own crawls" ON crawls
    FOR UPDATE USING (user_id = auth.uid());

-- Users can only see pages from their own crawls
CREATE POLICY "Users can view pages from their own crawls" ON crawl_pages
    FOR SELECT USING (
        crawl_id IN (SELECT id FROM crawls WHERE user_id = auth.uid())
    );

CREATE POLICY "System can insert crawl pages" ON crawl_pages
    FOR INSERT WITH CHECK (
        crawl_id IN (SELECT id FROM crawls WHERE user_id = auth.uid())
    );

CREATE POLICY "System can update crawl pages" ON crawl_pages
    FOR UPDATE USING (
        crawl_id IN (SELECT id FROM crawls WHERE user_id = auth.uid())
    );