-- Reconcile existing denormalized counters before installing triggers.
UPDATE "Story"
SET "score" = (
  SELECT COUNT(*) FROM "Vote" WHERE "Vote"."storyId" = "Story"."id"
);

UPDATE "Story"
SET "descendants" = (
  SELECT COUNT(*) FROM "Comment" WHERE "Comment"."storyId" = "Story"."id"
);

CREATE TRIGGER IF NOT EXISTS "Vote_score_after_insert"
AFTER INSERT ON "Vote"
BEGIN
  UPDATE "Story"
  SET "score" = "score" + 1
  WHERE "id" = NEW."storyId";
END;

CREATE TRIGGER IF NOT EXISTS "Vote_score_after_delete"
AFTER DELETE ON "Vote"
BEGIN
  UPDATE "Story"
  SET "score" = MAX("score" - 1, 0)
  WHERE "id" = OLD."storyId";
END;

CREATE TRIGGER IF NOT EXISTS "Comment_descendants_after_insert"
AFTER INSERT ON "Comment"
BEGIN
  UPDATE "Story"
  SET "descendants" = "descendants" + 1
  WHERE "id" = NEW."storyId";
END;

CREATE TRIGGER IF NOT EXISTS "Comment_descendants_after_delete"
AFTER DELETE ON "Comment"
BEGIN
  UPDATE "Story"
  SET "descendants" = MAX("descendants" - 1, 0)
  WHERE "id" = OLD."storyId";
END;
