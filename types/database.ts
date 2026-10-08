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
