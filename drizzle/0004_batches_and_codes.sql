CREATE TABLE "batch" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_by" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"code_length" integer,
	"quantity" integer,
	"prefix" text,
	"suffix" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "batch_name_idx" ON "batch" ("name");
--> statement-breakpoint

CREATE TABLE "promo_code" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"batch_id" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"redeemed_at" timestamp,
	"verified_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "promo_code_code_unique" ON "promo_code" ("code");
--> statement-breakpoint
CREATE INDEX "promo_code_code_idx" ON "promo_code" ("code");
--> statement-breakpoint
CREATE INDEX "promo_code_batch_idx" ON "promo_code" ("batch_id");