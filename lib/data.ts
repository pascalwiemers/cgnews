import { prisma } from "./db"
import { sortByHot } from "./ranking"
import { HnItem, HnItemType } from "./hn-types"

type StoryTypeParam =
	| "topstories"
	| "newstories"
	| "beststories"
	| "askstories"
	| "showstories"
	| "jobstories"

type StoredStoryType = "LINK" | "ASK" | "SHOW" | "JOB"

const typeMap: Partial<Record<StoryTypeParam, StoredStoryType>> = {
	askstories: "ASK",
	showstories: "SHOW",
	jobstories: "JOB",
}

function storyWhere(storyType: StoryTypeParam) {
	const type = typeMap[storyType]
	return type ? { type } : {}
}

function toHnItem(story: any): HnItem {
	return {
		id: story.id,
		deleted: false,
		type: HnItemType.story,
		by: story.author.username,
		time: Math.floor(new Date(story.createdAt).getTime() / 1000),
		text: story.text ?? "",
		dead: false,
		parent: undefined,
		url: story.url ?? "",
		score: story.score ?? 0,
		title: story.title,
		descendants: story.descendants ?? story._count?.comments ?? 0,
	}
}

export async function listStories({
	storyType,
	page = 1,
	pageSize = 30,
	order = "hot",
}: {
	storyType: StoryTypeParam
	page?: number
	pageSize?: number
	order?: "hot" | "new" | "top"
}) {
	const skip = (page - 1) * pageSize
	const where = storyWhere(storyType)
	if (order === "new") {
		const stories = await prisma.story.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip,
			take: pageSize,
			include: { author: { select: { username: true } }, _count: { select: { comments: true } } },
		})
		return stories.map(toHnItem)
	}
	if (order === "top") {
		const stories = await prisma.story.findMany({
			where,
			orderBy: { score: "desc" },
			skip,
			take: pageSize,
			include: { author: { select: { username: true } }, _count: { select: { comments: true } } },
		})
		return stories.map(toHnItem)
	}
	// hot
	const stories = await prisma.story.findMany({
		where,
		orderBy: { createdAt: "desc" },
		// fetch a larger window then apply hot ranking client-side
		skip: 0,
		take: Math.max(pageSize * 3, 120),
		include: { author: { select: { username: true } }, _count: { select: { comments: true } } },
	})
	const ranked = sortByHot(stories)
	const pageSlice = ranked.slice(skip, skip + pageSize)
	return pageSlice.map(toHnItem)
}


export async function getStory(id: number): Promise<HnItem | null> {
	const story = await prisma.story.findUnique({
		where: { id },
		include: { author: { select: { username: true } }, _count: { select: { comments: true } } },
	})
	if (!story) return null
	return toHnItem(story)
}

export async function listStoryComments(storyId: number) {
	const comments = await prisma.comment.findMany({
		where: { storyId },
		orderBy: { createdAt: "asc" },
		include: { author: { select: { username: true } } },
	})
	return comments.map((c) => ({
		id: c.id,
		by: c.author.username,
		text: c.text,
		time: Math.floor(new Date(c.createdAt).getTime() / 1000),
	}))
}

