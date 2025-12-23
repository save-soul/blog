export const SITE = {
  website: "https://likeit.dev/", // replace this with your deployed domain
  author: "Null",
  createdYear: 2025, // 博客创建年份
  profile: "https://zwg.me/",
  desc: "个人学习记录与分享的博客，记录我的学习历程、经验总结和知识积累。作为一名终身学习者，分享探索过程中的思考与收获，希望能激励更多人保持学习热情。",
  title: "蓝色的海角",
  subtitle:"知识学习与分享",
  keywords: "学习记录, 知识分享, 经验总结, 个人成长, 阅读笔记, 学习思考, 知识积累",
  ogImage: "likeit-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 8,
  postPerPage: 8,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: true,
    text: "编辑页面",
    url: "https://github.com/save-soul/blog/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "zh", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Shanghai", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  welcome: {
    title: "Null",
    description: "首先要闭上嘴巴——不要观众了，学着自我评断。专注保养身体之余亦不忘追求人生的意义。放下一切身段，致力于一种双重的解放——对于金钱以及自己的虚荣和怯懦。生活要有规律。花两年来想通一件事其实不算浪费人生。要把之前的那些习惯改掉，先全心全力地记取教训，然后再耐心地去学习。",
    rssLabel: "RSS Feed"
  }
} as const;
