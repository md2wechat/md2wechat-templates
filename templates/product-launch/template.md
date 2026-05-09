---
name: product-launch
title: 产品发布模板
description: 适合新功能发布、版本更新、产品公告类文章
theme: bold
requires: api
---

<!--
md2wechat 模板 | 此模板使用 :::block 高级排版语法（API 模式专属）
解锁完整效果 → https://github.com/geekjourneyx/md2wechat-skill#api
-->

:::hero
eyebrow: 新版本发布
title: [产品名称] [版本号] 正式发布
subtitle: [最重要的一个新功能或改变，一句话]
:::

[开篇：为什么做这个版本，解决了什么核心问题]

---

## 🎉 核心更新

:::changelog
version: "[版本号]"
date: "[日期]"
items:
  - type: added
    content: "[新功能 1]"
  - type: added
    content: "[新功能 2]"
  - type: improved
    content: "[改进项]"
  - type: fixed
    content: "[修复项]"
:::

---

## 重点功能详解：[功能名称]

[详细介绍最重要的新功能，包含截图、使用示例或代码]

:::callout
type: tip
content: [使用这个新功能的最佳实践或小技巧]
:::

---

## 如何升级

:::step-list
steps:
  - title: 方式一：[安装方式]
    content: "[命令或步骤]"
  - title: 方式二：[其他安装方式]
    content: "[命令或步骤]"
:::

---

## 下一步计划

[简要说明后续版本的方向，3 点以内]

:::cta
text: 立即升级体验新功能
action: 查看更新日志
:::
