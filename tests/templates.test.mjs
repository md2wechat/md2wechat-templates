import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

let validator;
try {
  validator = await import("../scripts/validate-templates.mjs");
} catch {
  validator = null;
}

const root = path.resolve(import.meta.dirname, "..");
const expectedTemplates = [
  "company-announcement",
  "customer-case-study",
  "data-report",
  "employer-brand",
  "event-recap",
  "executive-opinion",
  "interview",
  "knowledge-science",
  "listicle",
  "meeting-to-public-brief",
  "newsletter",
  "opinion-piece",
  "product-launch",
  "quarterly-review",
  "tech-tutorial",
  "thread-summary",
  "whitepaper-summary",
  "weekly-digest",
];

const enterpriseTemplates = [
  "customer-case-study",
  "company-announcement",
  "executive-opinion",
  "meeting-to-public-brief",
  "event-recap",
  "quarterly-review",
  "whitepaper-summary",
  "employer-brand",
];

const validTemplate = `---
name: sample
title: 示例模板
description: 用于验证合同的示例
intent: 帮助读者理解一个可执行结论
audience: 需要结构化写作的公众号作者
theme: minimal-blue
requires: api
verifiedWith: v3.4.0
---

:::hero
eyebrow: 示例
title: [请填写文章标题]
:::

[请根据可核对的材料写导语]

:::quote
quote: [请填写原文引用]
source: [请填写公开来源]
:::

## 正文

[请展开证据和分析]

:::summary
eyebrow: 总结
highlight: [请填写读者要记住的结论]
body: [请说明结论与正文证据的关系]
:::
`;

async function withFixture(content, fn, { name = "sample" } = {}) {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "md2wechat-template-"));
  const file = path.join(fixtureRoot, "templates", name, "template.md");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
  try {
    return await fn(file, fixtureRoot);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
}

test("validator module is available", () => {
  assert.ok(validator, "scripts/validate-templates.mjs must exist");
});

test("all eighteen templates have complete executable contracts", async () => {
  assert.ok(validator);
  for (const name of expectedTemplates) {
    const result = await validator.validateTemplate(path.join(root, "templates", name, "template.md"));
    assert.deepEqual(result.errors, [], `${name}: ${result.errors.join("; ")}`);
    assert.ok(new Set(result.modules).size >= 3, `${name} must use at least 3 distinct modules`);
    assert.equal(result.frontmatter.name, name);
  }
});

test("the eight enterprise templates have distinct contracts and calls to action", async () => {
  assert.ok(validator);
  const intents = new Set();
  const audiences = new Set();
  const moduleCompositions = new Set();
  const callsToAction = new Set();

  for (const name of enterpriseTemplates) {
    const file = path.join(root, "templates", name, "template.md");
    const source = await readFile(file, "utf8");
    const result = await validator.validateTemplate(file);
    intents.add(result.frontmatter.intent);
    audiences.add(result.frontmatter.audience);
    moduleCompositions.add([...new Set(result.modules)].join(","));
    const cta = source.match(/:::cta(?:\[[^\]]*\])?\s*\n(?:[^\n]*\n)*?title:\s*([^\n]+)/);
    assert.ok(cta, `${name} must include a cta module with a title`);
    callsToAction.add(cta[1].trim());
  }

  assert.equal(intents.size, enterpriseTemplates.length, "enterprise template intents must be unique");
  assert.equal(audiences.size, enterpriseTemplates.length, "enterprise template audiences must be unique");
  assert.equal(moduleCompositions.size, enterpriseTemplates.length, "enterprise module compositions must be unique");
  assert.equal(callsToAction.size, enterpriseTemplates.length, "enterprise calls to action must be unique");
});

test("README groups all templates by publishing scenario", async () => {
  const readme = await readFile(path.join(root, "README.md"), "utf8");
  const expectedGroups = ["企业沟通", "研究洞察", "产品增长", "个人创作"];
  for (const group of expectedGroups) {
    assert.match(readme, new RegExp(`^### ${group}$`, "m"), `README must include ${group}`);
  }
});

test("rejects missing required frontmatter fields", async () => {
  assert.ok(validator);
  const content = validTemplate.replace("intent: 帮助读者理解一个可执行结论\n", "");
  await withFixture(content, async file => {
    const result = await validator.validateTemplate(file);
    assert.match(result.errors.join("\n"), /missing frontmatter key: intent/);
  });
});

test("enforces the schema length constraints", async () => {
  assert.ok(validator);
  const content = validTemplate.replace("intent: 帮助读者理解一个可执行结论", "intent: 短");
  await withFixture(content, async file => {
    const result = await validator.validateTemplate(file);
    assert.match(result.errors.join("\n"), /intent must contain at least 6 characters/);
  });
});

test("parses frontmatter as YAML and validates scalar types", async () => {
  assert.ok(validator);
  await withFixture(validTemplate.replace("title: 示例模板", "title: Foo: bar"), async file => {
    const result = await validator.validateTemplate(file);
    assert.match(result.errors.join("\n"), /invalid YAML frontmatter/);
  });
  await withFixture(validTemplate.replace("title: 示例模板", "title: null"), async file => {
    const result = await validator.validateTemplate(file);
    assert.match(result.errors.join("\n"), /title must be a string/);
  });
});

test("rejects a directory and name mismatch", async () => {
  assert.ok(validator);
  await withFixture(validTemplate, async file => {
    const result = await validator.validateTemplate(file);
    assert.match(result.errors.join("\n"), /must match directory/);
  }, { name: "different" });
});

test("rejects deprecated block syntax", async () => {
  assert.ok(validator);
  await withFixture(validTemplate.replace(":::quote", ":::block"), async file => {
    const result = await validator.validateTemplate(file);
    assert.match(result.errors.join("\n"), /:::block/);
  });
});

test("rejects unknown modules", async () => {
  assert.ok(validator);
  await withFixture(validTemplate.replace(":::quote", ":::not-a-module"), async file => {
    const result = await validator.validateTemplate(file);
    assert.match(result.errors.join("\n"), /unknown or non-recommended module/);
  });
});

test("rejects duplicate and unknown frontmatter keys", async () => {
  assert.ok(validator);
  const duplicate = validTemplate.replace("title: 示例模板", "title: 示例模板\ntitle: 重复标题");
  await withFixture(duplicate, async file => {
    const result = await validator.validateTemplate(file);
    assert.match(result.errors.join("\n"), /duplicate frontmatter key: title/);
  });
  const unknown = validTemplate.replace("title: 示例模板", "title: 示例模板\nowner: nobody");
  await withFixture(unknown, async file => {
    const result = await validator.validateTemplate(file);
    assert.match(result.errors.join("\n"), /unknown frontmatter key: owner/);
  });
});

test("rejects malformed module and Markdown fences", async () => {
  assert.ok(validator);
  await withFixture(validTemplate.replace(":::quote\n", ":::quote\n:::cta\n"), async file => {
    const result = await validator.validateTemplate(file);
    assert.match(result.errors.join("\n"), /nested module|unclosed module/);
  });
  await withFixture(`${validTemplate}\n\`\`\`bash\necho test\n`, async file => {
    const result = await validator.validateTemplate(file);
    assert.match(result.errors.join("\n"), /unclosed Markdown code fence/);
  });
});

test("ignores module-looking text in comments and code fences", async () => {
  assert.ok(validator);
  const content = validTemplate.replace(
    "## 正文",
    "<!-- :::unknown-comment -->\n\n```markdown\n:::unknown-example\n::: \n```\n\n## 正文",
  );
  await withFixture(content, async file => {
    const result = await validator.validateTemplate(file);
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.modules.sort(), ["hero", "quote", "summary"]);
  });
});

test("a shorter nested fence does not close a longer Markdown fence", async () => {
  assert.ok(validator);
  const content = `${validTemplate}\n\`\`\`\`markdown\n\`\`\`markdown\n:::unknown-example\n:::\n\`\`\`\n\`\`\`\`\n`;
  await withFixture(content, async file => {
    const result = await validator.validateTemplate(file);
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.modules.sort(), ["hero", "quote", "summary"]);
  });
});

test("rejects likely credentials but permits obvious placeholders", async () => {
  assert.ok(validator);
  await withFixture(`${validTemplate}\nAPI Key: sk-live_0123456789ABCDEFGHIJ\n`, async file => {
    const result = await validator.validateTemplate(file);
    assert.match(result.errors.join("\n"), /possible secret/);
  });
  await withFixture(`${validTemplate}\nAppSecret: [请填写 AppSecret]\nAPI Key: \${MD2WECHAT_API_KEY}\n`, async file => {
    const result = await validator.validateTemplate(file);
    assert.deepEqual(result.errors, []);
  });
});

test("rejects content marked confidential or unpublished", async () => {
  assert.ok(validator);
  await withFixture(`${validTemplate}\n内部机密：这是尚未发布的客户公告正文。\n`, async file => {
    const result = await validator.validateTemplate(file);
    assert.match(result.errors.join("\n"), /possible confidential or unpublished content/);
  });
});

test("rejects exact ecosystem lock drift and extra fields", async () => {
  assert.ok(validator);
  const lock = JSON.parse(await readFile(path.join(root, ".md2wechat", "ecosystem-facts.lock.json"), "utf8"));
  assert.deepEqual(validator.validateLock(lock), []);
  const drifted = structuredClone(lock);
  drifted.sources.runtime.sha = "0".repeat(40);
  assert.match(validator.validateLock(drifted).join("\n"), /runtime\.sha/);
  const extra = structuredClone(lock);
  extra.note = "not allowed";
  assert.match(validator.validateLock(extra).join("\n"), /unknown lock key: note/);
});

test("README lists every template exactly once", async () => {
  assert.ok(validator);
  assert.deepEqual(await validator.validateReadme(root), []);
  const readme = await readFile(path.join(root, "README.md"), "utf8");
  await withFixture(validTemplate, async (_file, fixtureRoot) => {
    await writeFile(path.join(fixtureRoot, "README.md"), readme.replace("templates/data-report/template.md", "templates/interview/template.md"));
    for (const name of expectedTemplates.filter(name => name !== "sample")) {
      const dir = path.join(fixtureRoot, "templates", name);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, "template.md"), validTemplate.replace("name: sample", `name: ${name}`));
    }
    const errors = await validator.validateReadme(fixtureRoot);
    assert.ok(errors.some(error => /data-report/.test(error)));
    assert.ok(errors.some(error => /interview/.test(error)));
  });
});
