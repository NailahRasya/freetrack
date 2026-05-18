-- Migration: Fix projects stuck in "agreed" status → promote to "active"
-- Run this once in Supabase SQL Editor to fix existing data.
-- Date: 2026-05-18

UPDATE projects
SET status = 'active', updated_at = NOW()
WHERE status = 'agreed';
