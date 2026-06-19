import { HnItem, HnItemType } from "./hn-types"
import { HnWebStory } from "./hn-web-types"
import { inTwoWeeks, timeAgo } from "./time-utils"

export const site = (url?: string) => {
  if (!url) {
    return ""
  }

  try {
    // Check if the URL is valid before constructing it
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return ""
    }

    let { host, pathname } = new URL(url)
    if (host === "github.com" && pathname.includes("/")) {
      host += pathname.substring(0, pathname.indexOf("/", 1))
    }
    return host.replace(/^www\./, "")
  } catch (error) {
    // If URL construction fails, return empty string
    console.warn(`Invalid URL: ${url}`, error)
    return ""
  }
}

export const points = (score?: number): string => {
  if (score == null || Number.isNaN(score)) {
    return ""
  }
  if (score <= 0) {
    return "0 points"
  }
  return `${score} ${plural(score, "point")}`
}

export const ago = (time?: number): string => {
  if (time == null || Number.isNaN(time)) {
    return ""
  }
  return `${timeAgo(time)} ago`
}

export const commentCount = (descendants?: number) => {
  if (!descendants) {
    return "discuss"
  }
  return `${descendants} ${plural(descendants, " comment")}`
}

const plural = (n: number, s: string) => {
  return s + (n === 0 || n > 1 ? "s" : "")
}

export const replyableStroy = (story: HnItem) => {
  return story.type !== HnItemType.job && !story.dead && inTwoWeeks(story.time)
}

export const hnItem2HnWebStory = (hnItem: HnItem) => {
  return {
    id: hnItem.id,
    title: hnItem.title,
    url: hnItem.url,
    sitestr: site(hnItem.url),
    storyType: hnItem.storyType,
    score: points(hnItem.score),
    by: hnItem.by,
    age: `${timeAgo(hnItem.time)} ago`,
    comments: commentCount(hnItem.descendants),
    dead: hnItem.dead,
    isSelfPromo: hnItem.isSelfPromo,
    commercialDisclosure: hnItem.commercialDisclosure,
  } as HnWebStory
}

export const getVoteState = (pathname: string, hideVote: boolean) => {
  if (hideVote) {
    if (["/jobs", "/user/favorites", "/user/submitted"].includes(pathname)) {
      return "hidden"
    } else {
      return "invisible"
    }
  } else {
    return "visiable"
  }
}

export const hideVote = (type?: string) => {
  if (!type) {
    return false
  }
  return ["job"].includes(type)
}

export const hideScore = (type?: string) => {
  if (!type) {
    return false
  }
  return ["job"].includes(type)
}

export const hideUsername = (type?: string) => {
  if (!type) {
    return false
  }
  return ["job"].includes(type)
}

export const hideCommentCount = (type?: string) => {
  if (!type) {
    return false
  }
  return ["job"].includes(type)
}
