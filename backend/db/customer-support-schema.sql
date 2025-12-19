-- Customer Support System Schema

-- Contact Form Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(100) NOT NULL, -- 'General', 'Order Issue', 'Custom Request', 'Feedback'
    message TEXT NOT NULL,
    attachment_url TEXT, -- URL to uploaded image/file
    order_number VARCHAR(50), -- If related to an order
    status VARCHAR(20) NOT NULL DEFAULT 'new', -- 'new', 'read', 'responded', 'resolved'
    ip_address VARCHAR(45), -- IPv4 or IPv6
    user_agent TEXT,
    is_spam BOOLEAN NOT NULL DEFAULT false,
    admin_notes TEXT,
    responded_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Issues Table
CREATE TABLE IF NOT EXISTS order_issues (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    customer_id INTEGER,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    issue_category VARCHAR(50) NOT NULL, -- 'Wrong order', 'Quality issue', 'Late delivery', 'Other'
    issue_description TEXT NOT NULL,
    photo_urls TEXT[], -- Array of photo URLs
    status VARCHAR(20) NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'closed'
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    admin_response TEXT,
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Response Templates Table (for admin quick replies)
CREATE TABLE IF NOT EXISTS response_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'contact', 'order_issue', 'general'
    subject_en VARCHAR(255) NOT NULL,
    subject_es VARCHAR(255),
    body_en TEXT NOT NULL,
    body_es TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FAQ Feedback Table (track helpful/not helpful votes)
CREATE TABLE IF NOT EXISTS faq_feedback (
    id SERIAL PRIMARY KEY,
    faq_id INTEGER NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    feedback_text TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faq_id) REFERENCES faqs(id) ON DELETE CASCADE
);

-- Rate Limiting Table (for contact form spam protection)
CREATE TABLE IF NOT EXISTS contact_rate_limits (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    submission_count INTEGER NOT NULL DEFAULT 1,
    first_submission_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_submission_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ip_address)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_order_number ON contact_submissions(order_number);
CREATE INDEX IF NOT EXISTS idx_order_issues_order_id ON order_issues(order_id);
CREATE INDEX IF NOT EXISTS idx_order_issues_status ON order_issues(status);
CREATE INDEX IF NOT EXISTS idx_order_issues_created_at ON order_issues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_faq_feedback_faq_id ON faq_feedback(faq_id);
CREATE INDEX IF NOT EXISTS idx_response_templates_category ON response_templates(category);
CREATE INDEX IF NOT EXISTS idx_contact_rate_limits_ip ON contact_rate_limits(ip_address);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_issues_updated_at BEFORE UPDATE ON order_issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_response_templates_updated_at BEFORE UPDATE ON response_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

