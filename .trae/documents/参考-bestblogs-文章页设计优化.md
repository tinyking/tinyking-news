# 参考 bestblogs.dev 文章页设计，优化文章页

## Summary

参考 bestblogs.dev 文章页的核心体验，改造本站文章页（`/posts/[slug]`）：

1. **桌面端双栏布局**：正文宽度保持 `max-w-3xl` 不变，右侧新增 sticky 目录（TOC），`xl:` 视口及以上生效，移动端维持现状单栏。
2. **元信息增强**：标题下方一行显示 日期 + 阅读时间 + 分类胶囊（对齐 bestblogs 的丰富元信息风格）。
3. **阅读时间自动计算**：新增本地 remark 插件，构建时统计字数（中文约 400 字/分钟），无需手改 frontmatter。
4. **文末相关文章推荐**：按同分类/同标签推荐 3 篇，放在"上/下一篇"导航之前。

不改动：正文宽度、列表页/首页卡片、评论区（范围外）、全局 `app-layout` utility（其他页面在用）。

## Current State Analysis

* 文章页实际实现于 `src/pages/posts/[...slug]/index.astro`（553 行）：单栏 `app-layout`（= `max-w-3xl mx-auto px-4`），区块为 BackButton → h1 → 日期行 → article → 标签/分类胶囊 → ShareLinks → AdjacentPostNav。

* 无 TOC 侧栏（remark-toc 只能在正文内生成内联目录，25 篇文章均未使用）、无阅读时间、无相关推荐。

* 页面底部已有 `is:inline data-astro-rerun` 脚本：进度条、标题锚点、代码复制、Lightbox（View Transitions 下每次 swap 重跑，新脚本沿用此模式）。

* `await render(post)` 目前只解构 `Content`；Astro 支持 `remarkPluginFrontmatter` 返回值，可拿到 remark 插件写入的 frontmatter 数据（不经过 zod schema）。

* i18n：所有 UI 文案经 `src/i18n/lang/zh.ts`（`en.ts` 同步），类型在 `src/i18n/types.ts`，支持 `{{var}}` 插值。

* 样式：Tailwind v4（无 config 文件），token 见 `src/styles/theme.css`（`text-accent`、`bg-muted`、`text-muted-foreground`、`border-border` 等），图标在 `src/assets/icons/*.svg` 直接 import。

* markdown 插件注册在 `astro.config.ts` 的 `markdown.processor`（unified）中。

## Proposed Changes

### 1. 新建 remark 阅读时间插件

**文件：`src/plugins/reading-time.ts`（新建）**

```ts
import type { Root } from "unist-util-visit"; // 实际用 lithtml 遍历或直接 file.value
```

实现要点：

* 导出 `remarkReadingTime` 插件：`(options?: { wpm?: number }) => (tree, file) => {...}`。

* 从 `file.value`（原始 markdown 字符串）统计：中文字符数（`/[\u4e00-\u9fa5]/g`）+ 英文单词数（连续拉丁字母串算 1 词）。

* 分钟数 `minutesRead = Math.max(1, Math.ceil((cjkChars + latinWords) / 400))`。

* 写入 `file.data.astro.frontmatter.minutesRead`（Astro 约定，`render()` 后可从 `remarkPluginFrontmatter.minutesRead` 读取）。

* 无外部依赖，不装 npm 包。

### 2. 注册插件

**文件：`astro.config.ts`**

* `import { remarkReadingTime } from "./src/plugins/reading-time";`

* `markdown.processor.unified.remarkPlugins` 数组中追加 `remarkReadingTime`（放在 remarkToc 之前/之后均可）。

### 3. 新建 TOC 组件

**文件：`src/pages/posts/[...slug]/_components/TableOfContents.astro`（新建）**

* 服务端只渲染容器：`<nav aria-label="目录">` + 标题"目录"（i18n）+ 空 `<ul id="toc-list">`。

* 内嵌 `is:inline data-astro-rerun` 脚本：

  * 从 `#article` 中取 `h2, h3`（与现有 addHeadingLinks 的选择器一致，跳过无 id 的），构建链接列表（h2 一级、h3 缩进二级），注入 `#toc-list`。

  * 用 `IntersectionObserver`（rootMargin 顶部偏移）高亮当前阅读位置的条目：当前项 `text-accent`，其余 `text-muted-foreground`。

  * 点击平滑滚动（依赖已有 `:target { scroll-margin-block: 1rem }`）。

* 样式全部用 Tailwind class：`sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto text-sm`，列表项左侧 2px 竖线（`border-s-2 border-transparent`，激活时 `border-accent`）。

* 无 h2/h3 时脚本自动隐藏整个 nav（`hidden`）。

### 4. 新建相关文章组件

**文件：`src/pages/posts/[...slug]/_components/RelatedPosts.astro`（新建）**

* Props：`posts: { title, pubDatetime, url }[]`（由页面计算后传入，组件纯展示）。

* 布局：`data-pagefind-ignore`（与 AdjacentPostNav 一致，避免污染搜索），标题"相关文章"（i18n）+ 3 列 grid（移动端 1 列），每项显示日期（复用 `Datetime` 组件 size="sm"）+ 标题（`text-accent/85` hover 变 accent）。

* 推荐逻辑写在 `index.astro` frontmatter 中：

  ```
  candidates = getSortedPosts(所有 posts) 排除当前文章
  score = (category 相同 ? 2 : 0) + 共享 tags 数
  按 score 降序、同分按时间新→旧，取前 3（score 为 0 的也保留，作为兜底）
  ```

### 5. 改造文章页布局与元信息

**文件：`src/pages/posts/[...slug]/index.astro`**

* `const { Content, remarkPluginFrontmatter } = await render(post);`，取 `remarkPluginFrontmatter.minutesRead`。

* **布局结构调整**：`main` 的 class 从 `app-layout` 改为自定义组合（不动全局 utility）：

  * `mx-auto w-full max-w-app px-4 xl:max-w-[72rem]`

  * 内部包一层 `xl:grid xl:grid-cols-[minmax(0,48rem)_15rem] xl:justify-between xl:gap-10`

  * 左列：现有全部内容（h1 → 元信息 → article → 标签 → 分享 → 相关文章 → 上下篇），正文仍受 `minmax(0,48rem)` 约束 = 现状 48rem 不变。

  * 右列：`<TableOfContents />`，外层 `hidden xl:block`，内部 sticky。

* **元信息行**（`h1` 下方现有 `div.my-2`）：在 `Datetime` 之后追加

  * `·` 分隔符 + `{{minutes}} 分钟阅读`（i18n，`text-muted-foreground text-sm`）

  * `·` 分隔符 + 分类胶囊（复用底部现有分类 `<a>` 样式，链接到 `/[category]`）。

  * 底部标签区保留 tags 胶囊，分类胶囊从底部移除（避免重复）。

* **相关文章**：在 `<ShareLinks />` 与 `<hr>` 之后、`AdjacentPostNav` 之前插入 `<RelatedPosts posts={relatedPosts} />`。

* 现有底部内联脚本（进度条/锚点/复制/Lightbox）不动。

### 6. 新增 i18n 文案

**文件：`src/i18n/types.ts`、`src/i18n/lang/zh.ts`、`src/i18n/lang/en.ts`**

`post` 命名空间追加：

| key               | zh                   | en                       |
| ----------------- | -------------------- | ------------------------ |
| `readingTime`     | `"约 {{minutes}} 分钟"` | `"{{minutes}} min read"` |
| `tableOfContents` | `"目录"`               | `"On this page"`         |
| `relatedPosts`    | `"相关文章"`             | `"Related posts"`        |

## Assumptions & Decisions

* 阅读速度按中文 400 字/分钟（拉丁词与中文字符等权计入分子），最少 1 分钟。

* TOC 仅在 `xl`（1280px+）显示；移动端已有标题锚点，不加折叠目录（保持简单）。

* 相关文章包含 score 为 0 的兜底文章，保证栏目不空（全站仅 26 篇，同分类基本够 3 篇）。

* sticky `top-24` 起步，实施时按 Header 实际高度微调。

* 不引入任何新 npm 依赖（reading-time 插件、TOC 脚本均为本地实现）。

* 列表页/首页卡片、评论区不在本次范围。

## Verification

1. `npx astro sync` — 类型校验通过。
2. `npm run dev`（后台）打开任一文章页（如 `/posts/ren-sheng-debug-20-dan-dian-gu-zhang/`）验证：

   * `xl` 视口：右侧出现 sticky TOC，滚动时当前标题高亮，点击可跳转；

   * 元信息行含日期、阅读时间、分类胶囊；

   * 文末出现 3 篇相关文章 + 原有上/下一篇；

   * 正文宽度与改造前一致（48rem）。

   * `<1280px` 视口：布局与改造前一致（单栏、无 TOC）。
3. 亮/暗色模式下 TOC、相关文章、元信息配色正常（用现有 token）。
4. View Transitions 下从列表页进入文章页、文章页之间跳转，TOC/进度条/复制按钮正常重初始化。
5. `npm run build` 通过（含 pagefind 索引，确认 TOC/相关文章带 `data-pagefind-ignore` 不污染索引）。

