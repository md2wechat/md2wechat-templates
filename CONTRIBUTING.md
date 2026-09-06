# 贡献模板

欢迎补充真实、可复用的公众号写作场景。一个模板应当帮助作者安排材料和论证，而不是承诺阅读量、转化率或传播效果。

## 新增模板

1. 新建 `templates/<name>/template.md`，目录名使用小写 kebab-case。
2. 在 README 的模板表格中添加一次链接，并说明“适合写什么”和“结构重点”。
3. 使用下面的完整 frontmatter；`name` 必须与目录名一致：

   ```yaml
   ---
   name: example-template
   title: 示例模板
   description: 说明这个模板适合处理的材料和文章类型
   intent: 说明读者看完后应该理解或能够完成什么
   audience: 说明文章面向的主要读者
   theme: minimal-blue
   requires: api
   verifiedWith: v3.4.0
   ---
   ```

4. 保留开篇、正文和结尾，至少使用 3 种不同的推荐模块。需要替换的内容写成有意义的方括号提示，例如 `[请填写公开数据来源]`。
5. 引用要注明来源；数据要交代时间、口径和限制；不要放入未发布稿件或真实凭证。

## 选择模块和主题

不要凭名称猜字段，也不要使用 `:::block`。先从当前 CLI 读取可用项和完整示例：

```bash
md2wechat themes list --json
md2wechat layout list --json
md2wechat layout show <name> --json
```

新内容只使用 `layout list --json` 默认返回的推荐模块。复制 `layout show` 的 canonical `Example` 后再替换正文，避免沿用仅供旧稿迁移的兼容写法。

## 本地检查

```bash
node --test tests/*.test.mjs
node scripts/validate-templates.mjs
md2wechat layout validate --file templates/<name>/template.md --json
git diff --check
```

前三项都通过后再提交 PR。`layout validate` 证明本地 v3.4.0 语法可被接受；最终排版效果仍需通过 Convert API 预览并人工检查。

## 敏感信息

模板只保留占位符。不要提交真实 API Key、AppID、AppSecret、Cookie、草稿 ID、媒体 ID、客户资料或尚未公开的文章内容。测试示例也遵守同一规则。
