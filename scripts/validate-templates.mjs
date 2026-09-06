#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(await readFile(path.join(repositoryRoot, "template.schema.json"), "utf8"));
const requiredKeys = new Set(schema.required);
const allowedKeys = new Set(Object.keys(schema.properties));

const recommendedModules = new Set([
  "author-card", "people", "series", "subscribe",
  "cases", "checklist", "closing", "cta", "faq", "logos", "notice", "pricing", "specs", "summary", "toolbox",
  "figure-caption", "gallery-grid", "gallery-story", "image-annotate", "image-compare", "image-phone-shot", "image-steps", "image-text", "quote",
  "dialogue-pair", "flow", "matrix", "split",
  "compare", "infographic", "metrics", "steps", "timeline",
  "svg-reveal", "svg-swipe-gallery",
  "audience-fit", "bridge", "manifesto", "myth-fact", "verdict",
  "cards", "epilogue", "hero", "label-title", "part", "section-title", "toc",
  "callout", "changelog", "comparison-table", "definition", "question", "quote-card", "resource-list", "stat-row", "tweet",
]);

const openingModules = new Set(["hero", "label-title", "cards"]);
const endingModules = new Set(["checklist", "closing", "cta", "epilogue", "summary"]);

const exactLock = {
  schemaVersion: 1,
  reviewedAt: "2026-09-06",
  sources: {
    runtime: {
      repository: "geekjourneyx/md2wechat-skill",
      path: "VERSION",
      sha: "18091983f59ddde8105e566545a0d9e4a12a4f1c",
      schemaVersion: "v3.4.0",
    },
    products: {
      repository: "md2wechat/.github",
      path: "facts/product-routes.json",
      sha: "9b25b7142815876f44053cf819842db320408d2a",
      schemaVersion: 1,
    },
    platforms: {
      repository: "md2wechat/md2wechat-wiki",
      path: "evidence/agent-platforms.json",
      sha: "474ef8b8398e9b21b79ed937e24cb3c13ce1505d",
      schemaVersion: 1,
    },
  },
};

function parseFrontmatter(source) {
  const errors = [];
  const lines = source.replaceAll("\r\n", "\n").split("\n");
  if (lines[0] !== "---") return { frontmatter: {}, body: source, errors: ["missing opening frontmatter fence"] };
  const end = lines.indexOf("---", 1);
  if (end === -1) return { frontmatter: {}, body: "", errors: ["missing closing frontmatter fence"] };

  const yamlSource = lines.slice(1, end).join("\n");
  const seenKeys = new Set();
  for (const line of lines.slice(1, end)) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9]*):/);
    if (!match) continue;
    if (seenKeys.has(match[1])) errors.push(`duplicate frontmatter key: ${match[1]}`);
    seenKeys.add(match[1]);
  }

  const document = parseDocument(yamlSource, { prettyErrors: false, uniqueKeys: true });
  for (const error of document.errors) errors.push(`invalid YAML frontmatter: ${error.message.split("\n")[0]}`);
  let frontmatter = {};
  if (document.errors.length === 0) {
    const parsed = document.toJS({ maxAliasCount: 0 });
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) errors.push("frontmatter must be a YAML mapping");
    else frontmatter = parsed;
  }
  for (const key of Object.keys(frontmatter)) {
    if (!allowedKeys.has(key)) errors.push(`unknown frontmatter key: ${key}`);
  }
  return { frontmatter, body: lines.slice(end + 1).join("\n"), errors };
}

function inspectMarkdown(body) {
  const errors = [];
  const modules = [];
  const cleanBody = body.replace(/<!--[\s\S]*?-->/g, "");
  const lines = cleanBody.split("\n");
  let codeFence = null;
  let moduleName = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fence = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (fence) {
      const token = fence[1];
      const marker = token[0];
      if (!codeFence) codeFence = { marker, length: token.length };
      else if (codeFence.marker === marker && token.length >= codeFence.length && fence[2].trim() === "") codeFence = null;
      continue;
    }
    if (codeFence) continue;

    if (/^\s*:::\s*$/.test(line)) {
      if (!moduleName) errors.push(`unexpected module closing fence at line ${index + 1}`);
      moduleName = null;
      continue;
    }
    const opener = line.match(/^\s*:::([a-z0-9-]+)(?:\[[^\]]*\]|\{[^}]*\}|\s.*)?\s*$/);
    if (!opener) continue;
    const name = opener[1];
    if (moduleName) errors.push(`nested module ${name} inside ${moduleName} at line ${index + 1}`);
    else moduleName = name;
    modules.push(name);
    if (name === "block") errors.push("deprecated :::block syntax is not allowed");
    else if (!recommendedModules.has(name)) errors.push(`unknown or non-recommended module: ${name}`);
  }

  if (codeFence) errors.push("unclosed Markdown code fence");
  if (moduleName) errors.push(`unclosed module fence: ${moduleName}`);
  return { cleanBody, modules, errors };
}

function meaningfulPlaceholders(body) {
  const matches = [...body.matchAll(/\[([^\]\n]+)\](?!\()/g)].map(match => match[1].trim());
  return [...new Set(matches.filter(value =>
    value.length >= 2 &&
    !/^(?:todo|tbd|\.\.\.|https?:\/\/|url)$/i.test(value) &&
    !/^\d+$/.test(value)
  ))];
}

function containsPossibleSecret(source) {
  const scrubbed = source
    .replace(/\[[^\]\n]+\]/g, "[PLACEHOLDER]")
    .replace(/\$\{[A-Z0-9_]+\}/g, "ENV_PLACEHOLDER")
    .replace(/<(?:YOUR_)?[A-Z0-9_ -]+>/g, "ANGLE_PLACEHOLDER")
    .replace(/\b(?:YOUR|EXAMPLE|示例)_[A-Z0-9_]+\b/gi, "NAMED_PLACEHOLDER");
  return /\bsk-[A-Za-z0-9_-]{16,}\b/.test(scrubbed) ||
    /\bwx[0-9a-f]{16}\b/i.test(scrubbed) ||
    /\b(?:appsecret|api[_ -]?key|cookie|draft[_ -]?id|media[_ -]?id)\s*[:=]\s*(?!\s*(?:\[PLACEHOLDER\]|ENV_PLACEHOLDER|ANGLE_PLACEHOLDER|NAMED_PLACEHOLDER))\S{12,}/i.test(scrubbed);
}

function containsPossibleUnpublishedContent(source) {
  const scrubbed = source.replace(/\[[^\]\n]+\]/g, "[PLACEHOLDER]");
  return /内部机密|confidential|internal only|尚未发布.{0,20}(?:公告|稿|正文|材料)|未发布(?:的)?(?:客户|产品|文章|稿件|公告)/i.test(scrubbed);
}

function validateFrontmatter(frontmatter, directoryName) {
  const errors = [];
  for (const key of requiredKeys) {
    if (!Object.hasOwn(frontmatter, key)) errors.push(`missing frontmatter key: ${key}`);
  }
  for (const [key, value] of Object.entries(frontmatter)) {
    if (!allowedKeys.has(key)) continue;
    const rule = schema.properties[key];
    if (rule.type === "string" && typeof value !== "string") errors.push(`${key} must be a string`);
    if (typeof value !== "string") continue;
    if (!value.trim()) errors.push(`frontmatter value must not be empty: ${key}`);
    if (rule.minLength && [...value].length < rule.minLength) errors.push(`${key} must contain at least ${rule.minLength} characters`);
    if (rule.pattern && !(new RegExp(rule.pattern)).test(value)) errors.push(`${key} does not match ${rule.pattern}`);
    if (rule.enum && !rule.enum.includes(value)) errors.push(`${key} is not in the verified v3.4.0 set: ${value}`);
    if (Object.hasOwn(rule, "const") && value !== rule.const) errors.push(`${key} must equal ${rule.const}`);
  }
  if (frontmatter.name && frontmatter.name !== directoryName) errors.push(`frontmatter name ${frontmatter.name} must match directory ${directoryName}`);
  return errors;
}

export async function validateTemplate(file) {
  const source = await readFile(file, "utf8");
  const directoryName = path.basename(path.dirname(file));
  const parsed = parseFrontmatter(source);
  const inspected = inspectMarkdown(parsed.body);
  const placeholders = meaningfulPlaceholders(inspected.cleanBody);
  const errors = [
    ...parsed.errors,
    ...validateFrontmatter(parsed.frontmatter, directoryName),
    ...inspected.errors,
  ];
  const distinctModules = new Set(inspected.modules);
  if (distinctModules.size < 3) errors.push("template must use at least 3 distinct live modules");
  if (![...distinctModules].some(name => openingModules.has(name))) errors.push("template needs an opening module");
  if (![...distinctModules].some(name => !openingModules.has(name) && !endingModules.has(name))) errors.push("template needs a body or evidence module");
  if (![...distinctModules].some(name => endingModules.has(name))) errors.push("template needs an ending module");
  if (placeholders.length < 3) errors.push("template needs at least 3 meaningful bracket placeholders");
  if (containsPossibleSecret(source)) errors.push("possible secret, credential, Cookie, or draft identifier found");
  if (containsPossibleUnpublishedContent(source)) errors.push("possible confidential or unpublished content found");
  return { frontmatter: parsed.frontmatter, modules: inspected.modules, placeholders, errors };
}

function keysEqual(value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [`${label} must be an object`];
  const expectedKeys = Object.keys(expected).sort();
  const actualKeys = Object.keys(value).sort();
  const errors = [];
  for (const key of actualKeys.filter(key => !expectedKeys.includes(key))) errors.push(`unknown ${label} key: ${key}`);
  for (const key of expectedKeys.filter(key => !actualKeys.includes(key))) errors.push(`missing ${label} key: ${key}`);
  return errors;
}

export function validateLock(lock) {
  const errors = [...keysEqual(lock, exactLock, "lock")];
  if (!lock || typeof lock !== "object") return errors;
  if (lock.schemaVersion !== exactLock.schemaVersion) errors.push("lock.schemaVersion drift");
  if (lock.reviewedAt !== exactLock.reviewedAt) errors.push("lock.reviewedAt drift");
  errors.push(...keysEqual(lock.sources, exactLock.sources, "lock.sources"));
  for (const [name, expected] of Object.entries(exactLock.sources)) {
    const actual = lock.sources?.[name];
    errors.push(...keysEqual(actual, expected, `lock.sources.${name}`));
    for (const [key, expectedValue] of Object.entries(expected)) {
      if (actual?.[key] !== expectedValue) errors.push(`${name}.${key} must equal ${expectedValue}`);
    }
  }
  return errors;
}

async function templateNames(root) {
  const directory = path.join(root, "templates");
  const entries = await readdir(directory, { withFileTypes: true });
  return entries.filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
}

export async function validateReadme(root = repositoryRoot) {
  const readme = await readFile(path.join(root, "README.md"), "utf8");
  const names = await templateNames(root);
  const errors = [];
  for (const name of names) {
    const target = `templates/${name}/template.md`;
    const count = readme.split(target).length - 1;
    if (count !== 1) errors.push(`README must list ${name} exactly once; found ${count}`);
  }
  const listed = [...readme.matchAll(/templates\/([a-z0-9-]+)\/template\.md/g)].map(match => match[1]);
  for (const name of new Set(listed)) {
    if (!names.includes(name)) errors.push(`README lists missing template: ${name}`);
  }
  return errors;
}

export async function validateRepository(root = repositoryRoot) {
  const errors = [];
  let lock;
  try {
    lock = JSON.parse(await readFile(path.join(root, ".md2wechat", "ecosystem-facts.lock.json"), "utf8"));
  } catch (error) {
    errors.push(`cannot read ecosystem lock: ${error.message}`);
  }
  if (lock) errors.push(...validateLock(lock));
  errors.push(...await validateReadme(root));
  for (const name of await templateNames(root)) {
    const result = await validateTemplate(path.join(root, "templates", name, "template.md"));
    for (const error of result.errors) errors.push(`${name}: ${error}`);
  }
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = await validateRepository();
  if (errors.length) {
    for (const error of errors) console.error(`ERROR: ${error}`);
    process.exitCode = 1;
  } else {
    console.log("Validated 10 templates against the v3.4.0 contract.");
  }
}
