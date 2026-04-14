-- 1. Drops CloudBlock / Blog Legacy Tables
DROP TABLE IF EXISTS public.blog_authors CASCADE;
DROP TABLE IF EXISTS public.blog_categories CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.blog_post_categories CASCADE;
DROP TABLE IF EXISTS public.blog_post_tags CASCADE;
DROP TABLE IF EXISTS public.blog_series CASCADE;
DROP TABLE IF EXISTS public.blog_series_posts CASCADE;
DROP TABLE IF EXISTS public.blog_tags CASCADE;
DROP TABLE IF EXISTS public.page_attachments CASCADE;
DROP TABLE IF EXISTS public.page_blocks CASCADE;

-- 2. Drops Video / Media Legacy Tables
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.video_assets CASCADE;
DROP TABLE IF EXISTS public.video_chapters CASCADE;
DROP TABLE IF EXISTS public.video_collections CASCADE;
DROP TABLE IF EXISTS public.video_collection_videos CASCADE;
DROP TABLE IF EXISTS public.video_progress CASCADE;
DROP TABLE IF EXISTS public.video_series CASCADE;

-- 3. Drops Support / Desk Legacy Tables
DROP TABLE IF EXISTS public.sw_ticket_tags CASCADE;
DROP TABLE IF EXISTS public.sw_ticket_messages CASCADE;
DROP TABLE IF EXISTS public.sw_ticket_attachments CASCADE;
DROP TABLE IF EXISTS public.sw_tickets CASCADE;

-- 4. Drops CRM Leads / SW Legacy Tables
DROP TABLE IF EXISTS public.sw_call_logs CASCADE;
DROP TABLE IF EXISTS public.sw_email_logs CASCADE;
DROP TABLE IF EXISTS public.sw_lead_activities CASCADE;
DROP TABLE IF EXISTS public.sw_tasks CASCADE;
DROP TABLE IF EXISTS public.sw_leads CASCADE;
DROP TABLE IF EXISTS public.sw_contacts CASCADE;
DROP TABLE IF EXISTS public.sw_pipelines CASCADE;
DROP TABLE IF EXISTS public.sw_pipeline_stages CASCADE;

-- 5. Drops Simwork Architecture Legacy Tables
DROP TABLE IF EXISTS public.sw_apps CASCADE;
DROP TABLE IF EXISTS public.sw_installed_apps CASCADE;
DROP TABLE IF EXISTS public.sw_workspace_apps CASCADE;
DROP TABLE IF EXISTS public.sw_workspaces CASCADE;

-- 6. Drops BioLink Legacy Tables
DROP TABLE IF EXISTS public.bio_links CASCADE;
DROP TABLE IF EXISTS public.bio_pages CASCADE;
DROP TABLE IF EXISTS public.bio_social_links CASCADE;
DROP TABLE IF EXISTS public.bio_analytics_events CASCADE;
DROP TABLE IF EXISTS public.bio_analytics_sessions CASCADE;
DROP TABLE IF EXISTS public.b_blocks CASCADE;
DROP TABLE IF EXISTS public.b_cards CASCADE;

-- 7. Drops E-commerce Legacy Tables
DROP TABLE IF EXISTS public.store_orders CASCADE;
DROP TABLE IF EXISTS public.store_order_items CASCADE;
DROP TABLE IF EXISTS public.store_products CASCADE;

-- 8. Drops Knowledgebase Legacy Tables (SW old style)
DROP TABLE IF EXISTS public.sw_kb_articles CASCADE;
DROP TABLE IF EXISTS public.sw_kb_categories CASCADE;

-- 9. Drops other orphaned tables
DROP TABLE IF EXISTS public.rss_feed_preferences CASCADE;
DROP TABLE IF EXISTS public.shared_links CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.item_tags CASCADE;
DROP TABLE IF EXISTS public.media_bank CASCADE;
DROP TABLE IF EXISTS public.user_organizations CASCADE;
DROP TABLE IF EXISTS public.organizations_old CASCADE;
