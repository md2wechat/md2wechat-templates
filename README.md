<div align="center">

# 公众号文章结构模板

用清楚的内容骨架，把材料整理成适合公众号阅读的文章。

</div>

Agent 根据你提供的事实、观点和引用来写作；这里的模板负责安排开篇、证据、正文与结尾；md2wechat 负责高级排版、预览和后续草稿流程。模板本身不会替你核实材料，也不会直接发布文章。

当前 18 个模板都使用 API 高级排版模块。使用前需要安装 md2wechat CLI，并开通 [Convert API](https://www.md2wechat.cn/api-docs)。Convert API 负责把 Markdown 转为 HTML，不会创建公众号草稿；需要创建草稿时，请另外配置 [Publishing API](https://md2wechat.com/api/v1)。创建草稿不等于群发。

## 选择模板

### 企业沟通

| 模板 | 适合写 | 结构重点 |
|---|---|---|
| [company-announcement](templates/company-announcement/template.md) | 公司事项、服务调整 | 生效安排、影响范围与官方入口 |
| [meeting-to-public-brief](templates/meeting-to-public-brief/template.md) | 会议公开简报、项目同步 | 公开边界、已确认事项与后续节点 |
| [event-recap](templates/event-recap/template.md) | 会议、沙龙或发布会复盘 | 现场进程、授权引用与后续资源 |
| [quarterly-review](templates/quarterly-review/template.md) | 团队或项目季度回顾 | 指标口径、目标偏差与下季安排 |
| [employer-brand](templates/employer-brand/template.md) | 团队故事、招聘沟通 | 工作实践、成员视角与岗位匹配 |

### 研究洞察

| 模板 | 适合写 | 结构重点 |
|---|---|---|
| [data-report](templates/data-report/template.md) | 调研报告、数据解读 | 口径、指标、发现与局限 |
| [whitepaper-summary](templates/whitepaper-summary/template.md) | 白皮书摘要、研究解读 | 原文定义、研究方法与引用页码 |
| [executive-opinion](templates/executive-opinion/template.md) | 管理者署名观点 | 判断、证据、异议与行动依据 |
| [knowledge-science](templates/knowledge-science/template.md) | 概念解释、入门科普 | 定义、原理、例子与误区 |
| [interview](templates/interview/template.md) | 人物访谈、问答整理 | 人物背景、原话与主题线索 |

### 产品增长

| 模板 | 适合写 | 结构重点 |
|---|---|---|
| [product-launch](templates/product-launch/template.md) | 产品发布、版本更新 | 变化、适用对象、升级步骤 |
| [customer-case-study](templates/customer-case-study/template.md) | 客户案例、方案验证 | 实施过程、结果口径与适用边界 |
| [tech-tutorial](templates/tech-tutorial/template.md) | 工具教程、操作指南 | 前提、步骤、验证与排错 |
| [listicle](templates/listicle/template.md) | 方法、工具或建议清单 | 入选标准、逐项证据与选择建议 |

### 个人创作

| 模板 | 适合写 | 结构重点 |
|---|---|---|
| [opinion-piece](templates/opinion-piece/template.md) | 行业观点、深度评论 | 立场、证据、异议与建议 |
| [weekly-digest](templates/weekly-digest/template.md) | 行业周报、内容策展 | 筛选依据、来源与编辑总结 |
| [thread-summary](templates/thread-summary/template.md) | 公开帖子整理、长文重构 | 来源、原意、脉络与补充 |
| [newsletter](templates/newsletter/template.md) | 品牌周刊、固定栏目 | 编辑视角、推荐理由与读者互动 |

## 模板与主题有什么区别

- 模板决定文章讲什么、按什么顺序讲，例如先给结论，再放证据，最后给出下一步。
- 主题决定文章的视觉风格，例如 `minimal-blue` 或 `elegant-gold`。

换主题不会替代内容结构；换模板也不会自动改变事实和观点。

## 使用步骤

1. 在上表选择最接近写作任务的模板，复制对应的 `template.md`。
2. 把方括号中的提示替换成你的材料；引用、数据和结论要保留来源。
3. 按 [md2wechat Guide](https://github.com/md2wechat/md2wechat-guide) 安装并配置 CLI。
4. 先检查结构，再转换预览：

   ```bash
   md2wechat layout validate --file article.md --json
   md2wechat convert article.md --output article.html
   ```

5. 人工复核标题、事实、链接、图片版权和行动说明。需要创建草稿时，再进入 Publishing API 流程。

模块名称和字段以 [v3.4.0 Layout 文档](https://github.com/geekjourneyx/md2wechat-skill/blob/v3.4.0/docs/LAYOUT.md) 及本机 `layout show <name> --json` 为准。

## 参与贡献

新增或修改模板前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。仓库会检查模板字段、模块语法、占位符、敏感信息和 README 清单是否同步。

## 相关资源

- [md2wechat CLI 与 Agent Skill](https://github.com/geekjourneyx/md2wechat-skill)
- [md2wechat Guide](https://github.com/md2wechat/md2wechat-guide)
- [awesome-wechat-markdown](https://github.com/md2wechat/awesome-wechat-markdown)
- [md2wechat 生态入口](https://github.com/md2wechat)
