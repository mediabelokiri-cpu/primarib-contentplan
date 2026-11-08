// ============================================================================
// PRIMA RIB CONTENT PLAN v1.0
// Database Entities & TypeScript Definitions (16 Public Tables)
// ============================================================================

export type RoleName =
  | "Admin"
  | "Content Planner"
  | "Copywriter"
  | "Designer"
  | "Video Editor"
  | "Reviewer";

export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH";

export type IdeaStatus = "NEW" | "SELECTED" | "PLANNED" | "ARCHIVED";

export type ContentStatus =
  | "PLANNED"
  | "BRIEF"
  | "PRODUCTION"
  | "REVIEW"
  | "REVISION"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHED"
  | "ARCHIVED";

export type AssignmentType =
  | "PLANNER"
  | "COPYWRITER"
  | "DESIGNER"
  | "VIDEO_EDITOR"
  | "REVIEWER";

export type AssetType =
  | "DESIGN"
  | "VIDEO"
  | "THUMBNAIL"
  | "DOCUMENT"
  | "OTHER";

export type ReviewDecision = "APPROVED" | "REVISION";

export type ActivityAction =
  | "CREATED"
  | "UPDATED"
  | "ASSIGNED"
  | "STATUS_CHANGED"
  | "ASSET_UPLOADED"
  | "REVIEWED"
  | "REVISION_REQUESTED"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHED"
  | "ANALYTICS_UPDATED";

// ----------------------------------------------------------------------------
// 1. profiles
// ----------------------------------------------------------------------------
export interface Profile {
  id: string;
  full_name: string;
  email?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles?: RoleName[];
}

// ----------------------------------------------------------------------------
// 2. roles
// ----------------------------------------------------------------------------
export interface Role {
  id: string;
  name: RoleName;
  description?: string | null;
  created_at: string;
}

// ----------------------------------------------------------------------------
// 3. user_roles
// ----------------------------------------------------------------------------
export interface UserRole {
  user_id: string;
  role_id: string;
  created_at: string;
}

// ----------------------------------------------------------------------------
// 4. programs
// ----------------------------------------------------------------------------
export interface Program {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// 5. content_pillars
// ----------------------------------------------------------------------------
export interface ContentPillar {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// 6. content_formats
// ----------------------------------------------------------------------------
export interface ContentFormat {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// 7. platforms
// ----------------------------------------------------------------------------
export interface Platform {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

// ----------------------------------------------------------------------------
// 8. campaigns
// ----------------------------------------------------------------------------
export interface Campaign {
  id: string;
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// 9. ideas
// ----------------------------------------------------------------------------
export type ContentSourceType = "MANUAL" | "AI_ASSISTED";

export interface Idea {
  id: string;
  title: string;
  description?: string | null;
  program_id?: string | null;
  pillar_id?: string | null;
  format_id?: string | null;
  talent_category?: string | null;
  source?: string | null;
  priority: PriorityLevel;
  status: IdeaStatus;
  source_type?: ContentSourceType | null;
  generation_log_id?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// 10. contents
// ----------------------------------------------------------------------------
export interface Content {
  id: string;
  content_code: string;
  title: string;
  short_title?: string | null;
  program_id?: string | null;
  pillar_id?: string | null;
  format_id?: string | null;
  talent_category?: string | null;
  campaign_id?: string | null;
  objective?: string | null;
  target_audience?: string | null;
  angle?: string | null;
  priority: PriorityLevel;
  status: ContentStatus;
  hook?: string | null;
  main_content?: string | null;
  cta?: string | null;
  caption?: string | null;
  hashtags?: string | null;
  script?: string | null;
  creative_brief?: string | null;
  scheduled_at?: string | null;
  source_idea_id?: string | null;
  source_type?: ContentSourceType | null;
  generation_log_id?: string | null;
  active_script_id?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// 11. content_platforms
// ----------------------------------------------------------------------------
export interface ContentPlatform {
  id: string;
  content_id: string;
  platform_id: string;
  scheduled_at?: string | null;
  published_at?: string | null;
  post_url?: string | null;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// 12. content_assignments
// ----------------------------------------------------------------------------
export interface ContentAssignment {
  id: string;
  content_id: string;
  user_id: string;
  assignment_type: AssignmentType;
  task_notes?: string | null;
  deadline?: string | null;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// 13. content_assets
// ----------------------------------------------------------------------------
export interface ContentAsset {
  id: string;
  content_id: string;
  asset_type: AssetType;
  file_name: string;
  file_path: string;
  file_url?: string | null;
  uploaded_by?: string | null;
  created_at: string;
}

// ----------------------------------------------------------------------------
// 14. content_reviews
// ----------------------------------------------------------------------------
export interface ContentReview {
  id: string;
  content_id: string;
  reviewer_id?: string | null;
  decision: ReviewDecision;
  comment?: string | null;
  created_at: string;
}

// ----------------------------------------------------------------------------
// 15. content_analytics
// ----------------------------------------------------------------------------
export interface ContentAnalytics {
  id: string;
  content_platform_id: string;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followers: number;
  engagement_rate: number;
  recorded_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// 16. content_activity
// ----------------------------------------------------------------------------
export interface ContentActivity {
  id: string;
  content_id: string;
  user_id?: string | null;
  action: ActivityAction;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

// ----------------------------------------------------------------------------
// Enriched / Joined View Models for UI
// ----------------------------------------------------------------------------
export interface ContentWithRelations extends Content {
  program?: Program | null;
  pillar?: ContentPillar | null;
  format?: ContentFormat | null;
  campaign?: Campaign | null;
  platforms?: (ContentPlatform & {
    platform: Platform;
    analytics?: ContentAnalytics | null;
  })[];
  assignments?: (ContentAssignment & { user: Profile })[];
  assets?: (ContentAsset & { uploader?: Profile | null })[];
  reviews?: (ContentReview & { reviewer?: Profile | null })[];
  activities?: (ContentActivity & { user?: Profile | null })[];
}

export interface IdeaWithRelations extends Idea {
  program?: Program | null;
  pillar?: ContentPillar | null;
  creator?: Profile | null;
}

// ============================================================================
// MODULE 01 — BRAND STUDIO ENTITIES (PRD Module 01 & ERD Domains 3 & 4)
// ============================================================================

export interface BrandProfile {
  id: string;
  brand_name: string;
  description: string;
  positioning: string;
  vision: string;
  mission: string;
  values: string[];
  tagline: string;
  website_url?: string | null;
  social_links: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    youtube?: string;
  };
  brand_status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

export interface BrandPersonality {
  id: string;
  brand_id: string;
  personality_name: string;
  description: string;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export interface BrandToneGuideline {
  id: string;
  brand_id: string;
  tone_name: string;
  formality_level: "Sangat Formal" | "Semi Formal" | "Santai / Kasual";
  description: string;
  writing_rules: string[];
  preferred_words: string[];
  prohibited_words: string[];
  cta_style: string;
  communication_boundaries: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandAudience {
  id: string;
  brand_id: string;
  audience_name: string;
  description: string;
  age_range: string;
  occupation: string[];
  interests: string[];
  problems: string[];
  needs: string[];
  motivations: string[];
  objections: string[];
  preferences: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandProduct {
  id: string;
  brand_id: string;
  product_name: string;
  category: "CPNS" | "SEKDIN" | "POLRI" | "GENERAL";
  description: string;
  features: string[];
  benefits: string[];
  target_audience_id?: string | null;
  price?: number | null;
  price_display?: string | null;
  promotion_details?: string | null;
  registration_info?: string | null;
  cta: string;
  official_reference?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandWritingGuideline {
  id: string;
  brand_id: string;
  guideline_type:
    | "HOOK"
    | "HEADLINE"
    | "CAPTION"
    | "REELS_SCRIPT"
    | "CAROUSEL"
    | "CTA"
    | "HASHTAG";
  title: string;
  content: string;
  rules: string[];
  examples?: { good: string; bad: string }[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandVisualGuideline {
  id: string;
  brand_id: string;
  guideline_name: string;
  color_palette: { name: string; hex: string; role: string }[];
  typography: { heading: string; body: string; notes?: string };
  visual_direction: string;
  do_rules: string[];
  dont_rules: string[];
  references: string[];
  created_at: string;
  updated_at: string;
}

export interface BrandDocument {
  id: string;
  brand_id: string;
  file_name: string;
  file_path?: string | null;
  file_type: "PDF" | "DOCX" | "TXT" | "OTHER";
  file_size: number;
  processing_status: "UPLOADED" | "PARSED" | "INDEXED" | "FAILED";
  extracted_text?: string | null;
  uploaded_by?: string | null;
  created_at: string;
  processed_at?: string | null;
}

export interface BrandKnowledge {
  id: string;
  brand_id: string;
  category:
    | "REGULASI_SELEKSI"
    | "INFO_BIMBEL"
    | "PROFIL_ALUMNI"
    | "TIPS_TRIK"
    | "FAQ";
  title: string;
  content: string;
  source_type: "MANUAL" | "DOCUMENT" | "IMPORT";
  source_id?: string | null;
  source_reference?: string | null;
  verification_status: "VERIFIED" | "PENDING" | "UNVERIFIED";
  valid_from?: string | null;
  valid_until?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// MODULE 02 — HYBRID AI INFRASTRUCTURE ENTITIES (PRD Module 02 & ERD Domain 5, 6, 7)
// ============================================================================

export type AiProviderCode = "GEMINI" | "OPENAI" | "CLAUDE" | "FALLBACK_MOCK";

export type AiTaskCode =
  | "CONTENT_STRATEGY"
  | "IDEA_GENERATION"
  | "SCRIPT_WRITING"
  | "COPYWRITING"
  | "CREATIVE_BRIEF"
  | "QUALITY_CHECK"
  | "CONTENT_ANALYSIS";

export interface AiProvider {
  id: string;
  provider_name: string;
  provider_code: AiProviderCode;
  adapter_key: string;
  api_base_url?: string | null;
  credential_env_key: string; // e.g. "GEMINI_API_KEY", "OPENAI_API_KEY"
  is_active: boolean;
  configuration?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AiModel {
  id: string;
  provider_id: string;
  provider_code: AiProviderCode;
  model_name: string;
  model_code: string; // e.g. "gemini-1.5-flash", "gemini-1.5-pro", "gpt-4o", "claude-3-5-sonnet-20241022"
  capabilities: string[]; // ["fast", "reasoning", "multimodal", "code"]
  context_window: number;
  input_price_per_m: number; // in USD per 1M tokens
  output_price_per_m: number;
  pricing_currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiTaskRoute {
  id: string;
  task_code: AiTaskCode;
  task_name: string;
  primary_model_id: string;
  fallback_model_id?: string | null;
  temperature?: number;
  max_tokens?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiPromptTemplate {
  id: string;
  prompt_code: string;
  prompt_name: string;
  task_code: AiTaskCode;
  description: string;
  current_version_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiPromptVersion {
  id: string;
  template_id: string;
  version_number: number;
  system_prompt: string;
  instruction_template: string;
  output_schema?: Record<string, unknown>;
  change_notes: string;
  created_by?: string | null;
  created_at: string;
}

export interface AiGenerationLog {
  id: string;
  user_id?: string | null;
  provider_code: AiProviderCode;
  model_code: string;
  task_code: AiTaskCode;
  prompt_version_id?: string | null;
  request_status: "SUCCESS" | "FALLBACK" | "FAILED";
  input_summary?: string | null;
  output_summary?: string | null;
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number;
  cost_currency: string;
  duration_ms: number;
  error_code?: string | null;
  error_message?: string | null;
  fallback_used: boolean;
  created_at: string;
  completed_at?: string | null;
}

// ============================================================================
// MODULE 04: AI SCRIPT BUILDER & SCRIPT VERSIONING
// ============================================================================
export type ScriptFormatType = "REELS" | "CAROUSEL" | "SINGLE_POST";

export interface ReelsScene {
  id: string;
  timecode: string; // e.g. "00:00 - 00:05"
  visual_direction: string;
  audio_dialogue: string;
  text_on_screen: string;
}

export interface CarouselSlide {
  id: string;
  slide_number: number;
  slide_type: "COVER" | "CONTENT" | "CTA";
  headline: string;
  body: string;
  visual_direction: string;
}

export interface ContentScript {
  id: string;
  content_id: string;
  format_type: ScriptFormatType;
  title: string;
  hook: string;
  reels_scenes?: ReelsScene[];
  carousel_slides?: CarouselSlide[];
  single_post_body?: string;
  caption: string;
  cta: string;
  hashtags: string;
  tone: string;
  version_number: number;
  status: "DRAFT" | "READY_FOR_REVIEW" | "APPROVED";
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScriptVersion {
  id: string;
  script_id: string;
  content_id: string;
  version_number: number;
  format_type: ScriptFormatType;
  snapshot: {
    title: string;
    hook: string;
    reels_scenes?: ReelsScene[];
    carousel_slides?: CarouselSlide[];
    single_post_body?: string;
    caption: string;
    cta: string;
    hashtags: string;
    tone: string;
  };
  change_summary: string;
  created_by?: string | null;
  created_at: string;
}

// ============================================================================
// MODULE 05: CREATIVE BRIEF GENERATOR & QUALITY CHECKER
// ============================================================================
export interface CreativeBrief {
  id: string;
  content_id: string;
  target_role: "DESIGNER" | "VIDEO_EDITOR" | "TALENT";
  visual_concept: string;
  color_palette: string[];
  typography_guidelines: string;
  asset_requirements: string[];
  layout_directions: string;
  dos_and_donts: {
    dos: string[];
    donts: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface ContentQualityCheck {
  id: string;
  content_id: string;
  script_id?: string | null;
  overall_score: number; // 0 - 100
  brand_consistency_score: number; // 0 - 100
  audience_relevance_score: number; // 0 - 100
  copywriting_score: number; // 0 - 100
  factual_accuracy_status: "VERIFIED" | "WARNING" | "UNVERIFIED";
  prohibited_words_found: string[];
  strengths: string[];
  issues: string[];
  recommendations: string[];
  created_at: string;
}



