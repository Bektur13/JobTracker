-- DropIndex
DROP INDEX "Application_id_key";

-- AlterTable
CREATE SEQUENCE application_id_seq;
ALTER TABLE "Application" ADD COLUMN     "skills" TEXT[],
ALTER COLUMN "id" SET DEFAULT nextval('application_id_seq'),
ALTER COLUMN "status" SET DEFAULT 'applied',
ALTER COLUMN "date_applied" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "notes" DROP NOT NULL;
ALTER SEQUENCE application_id_seq OWNED BY "Application"."id";
