-- 📄 PDF Pipeline Cleanup - Development Phase
-- Doel: Markeer alle bestaande scans als development (geen PDF nodig)
-- Nieuwe scans krijgen wel PDFs volgens tier

-- 1. Markeer basic tier scans als 'N/A' (geen PDF verwacht)
UPDATE scans 
SET pdf_generation_status = 'N/A',
    last_pdf_generated_at = NULL,
    pdf_url = NULL
WHERE tier = 'basic' OR tier IS NULL;

-- 2. Markeer alle bestaande paid tier scans als 'development' 
-- (test scans die geen PDF nodig hebben)
UPDATE scans 
SET pdf_generation_status = 'development',
    last_pdf_generated_at = NULL,
    pdf_url = NULL
WHERE tier IN ('starter', 'business', 'enterprise') 
AND created_at < NOW();

-- 3. Reset alle 'failed' status naar 'development' voor test scans
UPDATE scans 
SET pdf_generation_status = 'development',
    last_pdf_generated_at = NULL,
    pdf_url = NULL
WHERE pdf_generation_status = 'failed';

-- 4. Check resultaat
SELECT 
  tier,
  pdf_generation_status,
  COUNT(*) as count,
  MAX(created_at) as latest_scan
FROM scans 
GROUP BY tier, pdf_generation_status
ORDER BY tier, pdf_generation_status;

-- Verwacht resultaat:
-- basic     | N/A         | XX scans
-- business  | development | XX scans  
-- enterprise| development | XX scans
-- starter   | development | XX scans

-- Nieuwe scans vanaf nu krijgen automatisch 'pending' status via default waarde