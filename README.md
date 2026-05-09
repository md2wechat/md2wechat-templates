<div align="center">

# md2wechat-templates

**微信公众号 Markdown 文章模板库**

30+ 开箱即用模板 | 使用 [md2wechat](https://github.com/geekjourneyx/md2wechat-skill) 的 `:::block` 高级排版语法

</div>

---

## 使用方法

1. 找到适合你场景的模板目录
2. 复制 `template.md` 内容
3. 替换 `[占位符]` 为你的实际内容
4. 运行 `md2wechat draft your-article.md` 推送草稿

> ⚠️ **注意**：所有模板使用 `:::block` 高级排版语法，需要 **API 模式** 解锁完整效果。  
> [申请 API 访问权限 →](https://github.com/geekjourneyx/md2wechat-skill#api)

---

## 模板列表

| 模板 | 适用场景 | 推荐主题 |
|---|---|---|
| [tech-tutorial](templates/tech-tutorial/template.md) | 工具教程、技术干货、How-to | focus |
| [opinion-piece](templates/opinion-piece/template.md) | 观点文章、深度思考、行业洞察 | elegant |
| [weekly-digest](templates/weekly-digest/template.md) | 内容策展、信息汇总、行业周报 | minimal |
| [product-launch](templates/product-launch/template.md) | 新功能发布、版本更新、产品公告 | bold |
| [data-report](templates/data-report/template.md) | 数据报告、调研结果、数字说话 | focus |
| [knowledge-science](templates/knowledge-science/template.md) | 概念解释、原理讲解、入门科普 | elegant |
| [thread-summary](templates/thread-summary/template.md) | 推文整理、帖子精华、长文总结 | minimal |
| [interview](templates/interview/template.md) | 人物访谈、对话录、Q&A | elegant |
| [listicle](templates/listicle/template.md) | X 个方法 / 工具 / 建议 爆款格式 | focus |
| [newsletter](templates/newsletter/template.md) | 品牌周刊、Newsletter、有固定读者 | minimal |

---

## :::block 语法速查

```markdown
:::hero           → 开篇大标题卡片
:::callout        → 强调框（tip/insight/warning/info）
:::verdict        → 核心观点声明
:::stat-row       → 数据指标行
:::quote-card     → 引用卡片
:::step-list      → 步骤列表
:::checklist      → 清单
:::faq            → 常见问题
:::changelog      → 更新日志
:::comparison-table → 对比表格
:::cta            → 行动召唤按钮
```

完整 43 个模块文档 → [LAYOUT.md](https://github.com/geekjourneyx/md2wechat-skill/blob/main/docs/LAYOUT.md)

---

## 贡献模板

欢迎提交你的模板！详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 相关资源

- [md2wechat-skill](https://github.com/geekjourneyx/md2wechat-skill) — 主工具 CLI
- [awesome-wechat-markdown](https://github.com/md2wechat/awesome-wechat-markdown) — 公众号生态工具列表
- [md2wechat org](https://github.com/md2wechat) — 品牌主页
