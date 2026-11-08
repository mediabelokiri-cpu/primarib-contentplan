-- ============================================================================
-- PRIMA RIB CONTENT PLAN — MODULE 01: BRAND STUDIO MIGRATION
-- Migration: 20261106_brand_studio.sql
-- ERD Domains: Domain 3 (Brand Management) & Domain 4 (Brand Knowledge)
-- ============================================================================

-- 1. BRAND_PROFILES
CREATE TABLE IF NOT EXISTS public.brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name VARCHAR NOT NULL,
  description TEXT,
  positioning TEXT,
  vision TEXT,
  mission TEXT,
  values JSONB DEFAULT '[]'::jsonb,
  tagline VARCHAR,
  website_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  brand_status VARCHAR NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. BRAND_PERSONALITIES
CREATE TABLE IF NOT EXISTS public.brand_personalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  personality_name VARCHAR NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. BRAND_TONE_GUIDELINES
CREATE TABLE IF NOT EXISTS public.brand_tone_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  tone_name VARCHAR NOT NULL,
  formality_level VARCHAR NOT NULL DEFAULT 'Semi Formal',
  description TEXT,
  writing_rules JSONB DEFAULT '[]'::jsonb,
  preferred_words JSONB DEFAULT '[]'::jsonb,
  prohibited_words JSONB DEFAULT '[]'::jsonb,
  cta_style TEXT,
  communication_boundaries JSONB DEFAULT '[]'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. BRAND_AUDIENCES
CREATE TABLE IF NOT EXISTS public.brand_audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  audience_name VARCHAR NOT NULL,
  description TEXT,
  age_range VARCHAR,
  occupation JSONB DEFAULT '[]'::jsonb,
  interests JSONB DEFAULT '[]'::jsonb,
  problems JSONB DEFAULT '[]'::jsonb,
  needs JSONB DEFAULT '[]'::jsonb,
  motivations JSONB DEFAULT '[]'::jsonb,
  objections JSONB DEFAULT '[]'::jsonb,
  preferences JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. BRAND_PRODUCTS
CREATE TABLE IF NOT EXISTS public.brand_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  product_name VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  target_audience_id UUID REFERENCES public.brand_audiences(id) ON DELETE SET NULL,
  price NUMERIC,
  price_display VARCHAR,
  promotion_details TEXT,
  registration_info TEXT,
  cta TEXT NOT NULL,
  official_reference TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. EXTEND EXISTING CONTENT_PILLARS (NON-DESTRUCTIVE)
ALTER TABLE public.content_pillars
  ADD COLUMN IF NOT EXISTS brand_id UUID,
  ADD COLUMN IF NOT EXISTS objectives JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recommended_topics JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recommended_formats JSONB DEFAULT '[]'::jsonb;

-- 7. BRAND_WRITING_GUIDELINES
CREATE TABLE IF NOT EXISTS public.brand_writing_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  guideline_type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  rules JSONB DEFAULT '[]'::jsonb,
  examples JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. BRAND_VISUAL_GUIDELINES
CREATE TABLE IF NOT EXISTS public.brand_visual_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  guideline_name VARCHAR NOT NULL,
  color_palette JSONB DEFAULT '[]'::jsonb,
  typography JSONB DEFAULT '{}'::jsonb,
  visual_direction TEXT,
  do_rules JSONB DEFAULT '[]'::jsonb,
  dont_rules JSONB DEFAULT '[]'::jsonb,
  references JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. BRAND_DOCUMENTS
CREATE TABLE IF NOT EXISTS public.brand_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  file_name VARCHAR NOT NULL,
  file_path TEXT,
  file_type VARCHAR NOT NULL DEFAULT 'PDF',
  file_size BIGINT NOT NULL DEFAULT 0,
  processing_status VARCHAR NOT NULL DEFAULT 'UPLOADED',
  extracted_text TEXT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- 10. BRAND_KNOWLEDGE
CREATE TABLE IF NOT EXISTS public.brand_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  category VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  source_type VARCHAR NOT NULL DEFAULT 'MANUAL',
  source_id UUID,
  source_reference TEXT,
  verification_status VARCHAR NOT NULL DEFAULT 'VERIFIED',
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. BRAND_DOCUMENT_CHUNKS (RAG TEXT CHUNKS)
CREATE TABLE IF NOT EXISTS public.brand_document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.brand_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_personalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_tone_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_writing_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_visual_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_document_chunks ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated & public
CREATE POLICY "Allow select on brand tables for all users"
  ON public.brand_profiles FOR SELECT USING (true);
CREATE POLICY "Allow select on brand personalities"
  ON public.brand_personalities FOR SELECT USING (true);
CREATE POLICY "Allow select on brand tone"
  ON public.brand_tone_guidelines FOR SELECT USING (true);
CREATE POLICY "Allow select on brand audiences"
  ON public.brand_audiences FOR SELECT USING (true);
CREATE POLICY "Allow select on brand products"
  ON public.brand_products FOR SELECT USING (true);
CREATE POLICY "Allow select on brand writing guidelines"
  ON public.brand_writing_guidelines FOR SELECT USING (true);
CREATE POLICY "Allow select on brand visual guidelines"
  ON public.brand_visual_guidelines FOR SELECT USING (true);
CREATE POLICY "Allow select on brand documents"
  ON public.brand_documents FOR SELECT USING (true);
CREATE POLICY "Allow select on brand knowledge"
  ON public.brand_knowledge FOR SELECT USING (true);
CREATE POLICY "Allow select on brand document chunks"
  ON public.brand_document_chunks FOR SELECT USING (true);
