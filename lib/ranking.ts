type HotRankInput = {
  score: number | null
  createdAt: Date
  commentCount?: number | null
  latestCommentAt?: Date | null
  featuredAt?: Date | null
  curatorNote?: string | null
}

const COMMENT_WEIGHT = 0.35
const RECENT_COMMENT_WEIGHT = 0.6
const CURATOR_NOTE_BOOST = 0.3
const FEATURED_BOOST = 0.7

function hoursSince(date: Date, now: number) {
  return Math.max(0, (now - date.getTime()) / 3600e3)
}

// Feed callers keep discussion input bounded to comment counts today; richer freshness can move into a cached rankScore later.
export function hotRank(
  {
    score,
    createdAt,
    commentCount = 0,
    latestCommentAt,
    featuredAt,
    curatorNote,
  }: HotRankInput,
  gravity = 1.8,
  now = Date.now()
): number {
  const ageHours = hoursSince(createdAt, now)
  const points = Math.max(score ?? 0, 0)
  const discussionBoost =
    Math.log2(Math.max(commentCount ?? 0, 0) + 1) * COMMENT_WEIGHT
  const latestCommentAge = latestCommentAt
    ? hoursSince(latestCommentAt, now)
    : Infinity
  const recentCommentBoost =
    latestCommentAge <= 24
      ? (1 - latestCommentAge / 24) * RECENT_COMMENT_WEIGHT
      : 0
  const curationBoost =
    (curatorNote ? CURATOR_NOTE_BOOST : 0) + (featuredAt ? FEATURED_BOOST : 0)

  return (
    (points + discussionBoost + recentCommentBoost + curationBoost) /
    Math.pow(ageHours + 2, gravity)
  )
}

export function sortByHot<
  T extends {
    score: number | null
    createdAt: Date
    descendants?: number | null
    curatorNote?: string | null
    featuredAt?: Date | null
    _count?: { comments?: number }
  },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const rankA = hotRank({
      score: a.score,
      createdAt: a.createdAt,
      commentCount: a._count?.comments ?? a.descendants,
      curatorNote: a.curatorNote,
      featuredAt: a.featuredAt,
    })
    const rankB = hotRank({
      score: b.score,
      createdAt: b.createdAt,
      commentCount: b._count?.comments ?? b.descendants,
      curatorNote: b.curatorNote,
      featuredAt: b.featuredAt,
    })

    return rankB - rankA
  })
}
