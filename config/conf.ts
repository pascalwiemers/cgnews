import { HnStoryType } from "@/lib/hn-types"

export type StoryFeedNavItem = {
  name: string
  link: string
  type: HnStoryType
}

type NavItem = StoryFeedNavItem | { name: string; link: string }

export const storyNavConfig: NavItem[] = [
  {
    name: "Top",
    link: "/top",
    type: HnStoryType.topstories,
  },
  {
    name: "New",
    link: "/new",
    type: HnStoryType.newstories,
  },
  {
    name: "Best",
    link: "/best",
    type: HnStoryType.beststories,
  },
  {
    name: "Ask",
    link: "/ask",
    type: HnStoryType.askstories,
  },
  {
    name: "Show",
    link: "/show",
    type: HnStoryType.showstories,
  },
  {
    name: "Jobs",
    link: "/jobs",
    type: HnStoryType.jobstories,
  },
  {
    name: "Submit",
    link: "/submit",
  },
]

export const storyFeedNavConfig = storyNavConfig.filter(
  (item): item is StoryFeedNavItem => "type" in item
)

export const showStoryNav = (pathname: string) => {
  return !["/login", "/signup"].includes(pathname)
}

export const profileTabs = [
  {
    label: "About",
    public: true,
  },
  {
    label: "Submitted",
    public: true,
  },
  {
    label: "Comments",
    public: true,
  },
  {
    label: "Favorites",
    public: true,
  },
  {
    label: "Upvoted",
    public: false,
  },
]

export const siteConf = {
  title: "CGNews",
  description:
    "CGNews is a minimal community site for CG, VFX, animation, tools, and production work.",
  authors: [
    {
      name: "CGNews",
      url: "https://www.pascalwiemers.com",
    },
  ],
  links: {
    next: "https://nextjs.org",
    shadcn: "https://ui.shadcn.com",
  },
}
