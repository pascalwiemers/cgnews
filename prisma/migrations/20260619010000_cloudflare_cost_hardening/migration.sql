-- Drop single-column feed indexes superseded by composite cursor indexes.
DROP INDEX IF EXISTS "Story_createdAt_idx";
DROP INDEX IF EXISTS "Story_score_idx";
DROP INDEX IF EXISTS "Story_type_idx";
DROP INDEX IF EXISTS "Comment_storyId_idx";
DROP INDEX IF EXISTS "Comment_authorId_idx";

-- Public feed and search ordering.
CREATE INDEX "Story_createdAt_id_idx" ON "Story"("createdAt", "id");
CREATE INDEX "Story_score_createdAt_id_idx" ON "Story"("score", "createdAt", "id");
CREATE INDEX "Story_type_createdAt_id_idx" ON "Story"("type", "createdAt", "id");
CREATE INDEX "Story_type_score_createdAt_id_idx" ON "Story"("type", "score", "createdAt", "id");
CREATE INDEX "Story_authorId_createdAt_id_idx" ON "Story"("authorId", "createdAt", "id");
CREATE INDEX "Story_title_idx" ON "Story"("title");
CREATE INDEX "Story_url_idx" ON "Story"("url");

-- Comment thread and user activity reads.
CREATE INDEX "Comment_storyId_createdAt_id_idx" ON "Comment"("storyId", "createdAt", "id");
CREATE INDEX "Comment_authorId_createdAt_id_idx" ON "Comment"("authorId", "createdAt", "id");

-- User vote/favorite lists ordered by recent activity.
CREATE INDEX "Vote_userId_createdAt_storyId_idx" ON "Vote"("userId", "createdAt", "storyId");
CREATE INDEX "Favorite_userId_createdAt_storyId_idx" ON "Favorite"("userId", "createdAt", "storyId");
