-- Healthcare Companion Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'senior', -- 'senior' | 'caregiver'
    email VARCHAR(255) UNIQUE,
    linked_senior_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    senior_id UUID NOT NULL REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active' -- 'active' | 'completed'
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    role VARCHAR(20) NOT NULL, -- 'user' | 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    senior_id UUID NOT NULL REFERENCES users(id),
    signal_type VARCHAR(100) NOT NULL, -- 'loneliness' | 'poor_sleep' | 'pain' | etc.
    severity VARCHAR(20) DEFAULT 'low', -- 'low' | 'medium' | 'high'
    description TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    senior_id UUID NOT NULL REFERENCES users(id),
    conversation_date DATE NOT NULL,
    mood VARCHAR(50),
    sleep_issue BOOLEAN DEFAULT FALSE,
    loneliness BOOLEAN DEFAULT FALSE,
    pain BOOLEAN DEFAULT FALSE,
    medication_issue BOOLEAN DEFAULT FALSE,
    anxiety BOOLEAN DEFAULT FALSE,
    confusion BOOLEAN DEFAULT FALSE,
    social_isolation BOOLEAN DEFAULT FALSE,
    risk_level VARCHAR(20) DEFAULT 'low', -- 'low' | 'medium' | 'high'
    summary_text TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS escalations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    senior_id UUID NOT NULL REFERENCES users(id),
    priority VARCHAR(20) NOT NULL, -- 'low' | 'medium' | 'high'
    reason TEXT NOT NULL,
    action_required TEXT NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed demo data
INSERT INTO users (id, name, role, email) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Margaret Wilson', 'senior', 'margaret@example.com'),
    ('22222222-2222-2222-2222-222222222222', 'Robert Thompson', 'senior', 'robert@example.com'),
    ('33333333-3333-3333-3333-333333333333', 'Dr. Sarah Johnson', 'caregiver', 'sarah.johnson@care.com')
ON CONFLICT DO NOTHING;

UPDATE users SET linked_senior_id = '11111111-1111-1111-1111-111111111111' WHERE id = '33333333-3333-3333-3333-333333333333';

-- Seed the conversation the summary below references (must exist for the FK)
INSERT INTO conversations (id, senior_id, started_at, ended_at, status) VALUES
    ('00000000-0000-0000-0000-000000000001',
     '11111111-1111-1111-1111-111111111111',
     NOW() - INTERVAL '1 day',
     NOW() - INTERVAL '1 day' + INTERVAL '15 minutes',
     'completed')
ON CONFLICT DO NOTHING;

-- Seed a sample completed conversation summary
INSERT INTO summaries (conversation_id, senior_id, conversation_date, mood, sleep_issue, loneliness, pain, medication_issue, risk_level, summary_text)
SELECT 
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE - INTERVAL '1 day',
    'slightly_negative',
    TRUE,
    TRUE,
    FALSE,
    FALSE,
    'medium',
    'Margaret mentioned she had trouble sleeping last night and expressed feelings of loneliness. She mentioned her daughter has not visited recently.'
WHERE NOT EXISTS (SELECT 1 FROM summaries WHERE conversation_id = '00000000-0000-0000-0000-000000000001');
