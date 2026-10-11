-- Add fields for unique visitor tracking, geolocation, and future analytics enhancements
-- These columns are nullable to maintain backward compatibility

-- Unique visitor tracking: hashed visitor token from first-party cookie
ALTER TABLE "analytics" ADD COLUMN "visitorToken" VARCHAR(255);

-- Geolocation: country code (e.g., "US", "GB") or "Unknown" for undetected visitors
ALTER TABLE "analytics" ADD COLUMN "country" VARCHAR(10) NOT NULL DEFAULT 'Unknown';

-- Add indexes for efficient aggregations
CREATE INDEX "idx_analytics_urlid_createdat" ON "analytics"("urlId", "createdAt");
CREATE INDEX "idx_analytics_visitortoken_urlid_createdat" ON "analytics"("visitorToken", "urlId", "createdAt");
