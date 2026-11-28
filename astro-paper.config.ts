import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://www.wangjianchao.cn/",
    title: "语霖｜人生Debug",
    description:
      "40岁程序员 / 技术管理。用代码思维 Debug 人生：技术债、单点故障、灰度发布。公众号「爱语霖爱生活」｜执笔为语，心落成霖",
    author: "语霖",
    profile: "https://www.wangjianchao.cn/",
    lang: "zh",
    timezone: "Asia/Shanghai",
    dir: "ltr",
    adsenseClient: "ca-pub-9508321495212724",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
    ads: {
      enabled: true,
      slots: {
        // 广告只出现在文章末尾。在 AdSense 后台创建一个「展示广告/信息流广告」单元，
        // 把它的槽位 ID（data-ad-slot，纯数字）填到下面即可生效；留空则不渲染任何广告。
        // 同时请在 AdSense 后台关闭该站点的「自动广告（Auto ads）」，否则 Google 会在
        // 每个加载了 AdSense 脚本的页面自动插入广告。
        inArticle: "5865445358",
      },
      // Adsterra 横幅：src 为后台给的 loader 脚本地址，containerId 为它要填充的 div id。
      // 渲染在文章末尾，同样只在文章页加载。
      banner: {
        src: "https://bicea.org/21/117598a0d78b14117f84804c1d91b763",
        containerId: "container-117598a0d78b14117f84804c1d91b763",
      },
    },
  },
  socials: [
    { name: "x", url: "https://x.com/tinyking86" },
    { name: "mail", url: "mailto:tinyking86@gmail.com" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});