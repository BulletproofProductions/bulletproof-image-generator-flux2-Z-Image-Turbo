ALTER TABLE IF EXISTS "account" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "image_likes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "session" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "user_api_keys" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "verification" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE IF EXISTS "account" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "image_likes" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "session" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "user" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "user_api_keys" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "verification" CASCADE;--> statement-breakpoint
ALTER TABLE "avatars" DROP CONSTRAINT IF EXISTS "avatars_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "generations" DROP CONSTRAINT IF EXISTS "generations_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "presets" DROP CONSTRAINT IF EXISTS "presets_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "avatars_user_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "generated_images_is_public_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "generations_user_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "presets_user_id_idx";--> statement-breakpoint
ALTER TABLE "avatars" DROP COLUMN IF EXISTS "user_id";--> statement-breakpoint
ALTER TABLE "generated_images" DROP COLUMN IF EXISTS "is_public";--> statement-breakpoint
ALTER TABLE "generations" DROP COLUMN IF EXISTS "user_id";--> statement-breakpoint
ALTER TABLE "presets" DROP COLUMN IF EXISTS "user_id";