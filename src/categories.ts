export interface Category {
  slug: string;
  name: string;
  desc: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: "growth",
    name: "成长",
    desc: "关于学习、习惯、选择与自我迭代的记录",
  },
  {
    slug: "ai",
    name: "AI",
    desc: "AI 工具的实际用法、使用心得与趋势观察",
  },
  {
    slug: "work",
    name: "职场",
    desc: "沟通、协作、管理与职业路径上的经验和教训",
  },
  {
    slug: "think",
    name: "思考",
    desc: "对人、事、观念的独立思考，不求结论，求想明白",
  },
  {
    slug: "notes",
    name: "随记",
    desc: "读书、生活与碎片灵感",
  },
];

export const CATEGORY_SLUGS = CATEGORIES.map(c => c.slug) as [
  string,
  ...string[],
];
