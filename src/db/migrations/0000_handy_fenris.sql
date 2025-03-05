CREATE TABLE "consents" (
	"id" serial PRIMARY KEY NOT NULL,
	"services" json,
	"config" json,
	"domain" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"user_agent" varchar(255) NOT NULL,
	"user_ip" varchar(45) NOT NULL,
	"consent_logged_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "consents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "domain_idx" ON "consents" USING btree ("domain");