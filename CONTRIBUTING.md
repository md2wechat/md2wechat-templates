# Contributing Templates

感谢你想为 md2wechat-templates 贡献模板！

## 模板规范

每个模板必须：

1. **放在独立目录下**：`templates/[模板名]/template.md`
2. **包含 frontmatter**：
   ```yaml
   ---
   name: 模板英文名（与目录名一致）
   title: 模板中文名
   description: 适用场景说明
   theme: 推荐主题名
   requires: api
   ---
   ```
3. **包含注释**：文件开头需有 API 模式说明注释
4. **使用 :::block 语法**：至少使用 3 个不同的 :::block 模块
5. **有完整结构**：开篇、正文、结尾三段式
6. **使用 [占位符] 格式**：所有需要替换的内容用方括号标注

## PR 流程

1. Fork 本 repo
2. 创建 branch：`git checkout -b template/[模板名]`
3. 添加模板文件：`templates/[模板名]/template.md`
4. 在 README.md 的模板列表中添加一行
5. 提交 PR，标题格式：`feat: add [模板名] template`
