-- ============================================================================
-- PRIMA RIB CONTENT PLAN — MODULE 02: HYBRID AI INFRASTRUCTURE MIGRATION
-- Migration: 20261106_hybrid_ai_infrastructure.sql
-- ERD Domains: Domain 5 (AI Provider), Domain 6 (Prompt Mgmt), Domain 7 (Monitoring)
-- ============================================================================

-- 1. AI_PROVIDERS
CREATE TABLE IF NOT EXISTS public.ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name VARCHAR NOT NULL,
  provider_code VARCHAR NOT NULL UNIQUE,
  adapter_key VARCHAR NOT NULL,
  api_base_url TEXT,
  credential_reference TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  configuration JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. AI_MODELS
CREATE TABLE IF NOT EXISTS public.ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.ai_providers(id) ON DELETE CASCADE,
  model_name VARCHAR NOT NULL,
  model_code VARCHAR NOT NULL UNIQUE,
  capabilities JSONB DEFAULT '[]'::jsonb,
  context_window INTEGER DEFAULT 128000,
  input_price NUMERIC(10, 4) DEFAULT 0,
  output_price NUMERIC(10, 4) DEFAULT 0,
  pricing_currency VARCHAR DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  model_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. AI_TASK_ROUTES
CREATE TABLE IF NOT EXISTS public.ai_task_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_code VARCHAR NOT NULL UNIQUE,
  task_name VARCHAR NOT NULL,
  primary_model_id UUID REFERENCES public.ai_models(id) ON DELETE SET NULL,
  fallback_model_id UUID REFERENCES public.ai_models(id) ON DELETE SET NULL,
  configuration JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. AI_PROMPT_TEMPLATES
CREATE TABLE IF NOT EXISTS public.ai_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_code VARCHAR NOT NULL UNIQUE,
  prompt_name VARCHAR NOT NULL,
  task_code VARCHAR NOT NULL,
  description TEXT,
  current_version_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. AI_PROMPT_VERSIONS
CREATE TABLE IF NOT EXISTS public.ai_prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.ai_prompt_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  system_prompt TEXT NOT NULL,
  instruction_template TEXT NOT NULL,
  output_schema JSONB DEFAULT '{}'::jsonb,
  change_notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (template_id, version_number)
);

-- 6. AI_GENERATION_LOGS
CREATE TABLE IF NOT EXISTS public.ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES public.ai_providers(id) ON DELETE SET NULL,
  model_id UUID REFERENCES public.ai_models(id) ON DELETE SET NULL,
  task_code VARCHAR NOT NULL,
  prompt_version_id UUID REFERENCES public.ai_prompt_versions(id) ON DELETE SET NULL,
  request_status VARCHAR NOT NULL DEFAULT 'SUCCESS',
  input_summary TEXT,
  output_summary TEXT,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  estimated_cost NUMERIC(10, 6) DEFAULT 0,
  cost_currency VARCHAR DEFAULT 'USD',
  duration_ms INTEGER DEFAULT 0,
  error_code VARCHAR,
  error_message TEXT,
  fallback_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 7. AI_USAGE_LIMITS
CREATE TABLE IF NOT EXISTS public.ai_usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  limit_scope VARCHAR NOT NULL DEFAULT 'GLOBAL',
  scope_reference UUID,
  max_requests INTEGER,
  max_tokens BIGINT,
  max_cost NUMERIC(10, 2),
  period_type VARCHAR NOT NULL DEFAULT 'MONTHLY',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. AI_FEEDBACK
CREATE TABLE IF NOT EXISTS public.ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_log_id UUID NOT NULL REFERENCES public.ai_generation_logs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_type VARCHAR,
  feedback_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_task_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Allow read on ai tables for authenticated users"
  ON public.ai_providers FOR SELECT USING (true);
CREATE POLICY "Allow read on ai models"
  ON public.ai_models FOR SELECT USING (true);
CREATE POLICY "Allow read on ai task routes"
  ON public.ai_task_routes FOR SELECT USING (true);
CREATE POLICY "Allow read on ai prompt templates"
  ON public.ai_prompt_templates FOR SELECT USING (true);
CREATE POLICY "Allow read on ai prompt versions"
  ON public.ai_prompt_versions FOR SELECT USING (true);
CREATE POLICY "Allow read on ai generation logs"
  ON public.ai_generation_logs FOR SELECT USING (true);
CREATE POLICY "Allow insert on ai generation logs"
  ON public.ai_generation_logs FOR INSERT WITH CHECK (true);
