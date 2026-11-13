"use strict";

const $ = (id) => document.getElementById(id);
const names = {camera: "Camera", caption: "Caption", tag: "Tag"};
const cache = new Map();
let task = "camera", data, samples = [], index = 0, request = 0;
let cameraModel = "Gemma-4-E4B-it";

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function badge(decision, score) {
  const labels = {
    supported: "Supported", incorrect: "Incorrect", contradicted: "Contradicted",
    uncertain: "Uncertain", omitted: "Not mentioned / insufficient",
    target_action_missing: "Target action omitted", not_applicable: "Not applicable",
    no_omission_found: "No omission found", omission_found: "Omission found",
  };
  const good = ["supported", "no_omission_found"].includes(decision);
  const bad = ["incorrect", "contradicted", "target_action_missing", "omission_found"].includes(decision);
  const suffix = typeof score === "number" ? ` (${score > 0 ? "+" : ""}${score})` : "";
  return el("span", (labels[decision] || decision) + suffix, `badge ${good ? "good" : bad ? "bad" : "neutral"}`);
}

function evidence(parent, text) {
  parent.append(el("p", text || "No written explanation recorded.", text ? "evidence" : "evidence muted small"));
}

function origin(parent, value, label = "Judgment origin") {
  if (value) parent.append(el("p", `${label}: ${value === "human" ? "human" : value === "model" ? "model" : value}`, "origin"));
}

function checkCard(check) {
  const card = el("article", undefined, "check");
  const top = el("div", undefined, "check-top");
  const title = el("div");
  title.append(el("div", check.field, "field"), el("div", check.label, "label"));
  top.append(title, badge(check.decision));
  card.append(top);
  evidence(card, check.evidence);
  origin(card, check.judgment_origin);
  return card;
}

function renderCamera(sample, parent) {
  const buttons = el("div", undefined, "model-buttons");
  buttons.setAttribute("aria-label", "Camera annotation model");
  if (!sample.models[cameraModel]) cameraModel = Object.keys(sample.models)[0];
  for (const model of Object.keys(sample.models)) {
    const button = el("button", model);
    button.setAttribute("aria-pressed", String(model === cameraModel));
    button.onclick = () => { cameraModel = model; renderReview(sample); };
    buttons.append(button);
  }
  parent.append(buttons, el("p", "Each label is checked against the thumbnails. Uncertain judgments are excluded from the support-rate denominator.", "small muted"));
  sample.models[cameraModel].checks.forEach((check) => parent.append(checkCard(check)));
}

function renderCaption(sample, parent) {
  const arms = {with_camera: "With Camera", without_camera: "Without Camera"};
  const details = el("details");
  details.open = true;
  details.append(el("summary", "L3 captions · Qwen3.6-27B-FP8"));
  const texts = el("div", undefined, "columns");
  for (const [arm, title] of Object.entries(arms)) {
    const column = el("div");
    column.append(el("h4", title), el("p", sample.captions[arm], "caption-text"));
    texts.append(column);
  }
  details.append(texts);
  parent.append(details, el("h3", "Reference items & paired judgments"));
  parent.append(el("p", "References are checked against the thumbnails first. Contradicted or uncertain references are excluded from scores. Visual-content checks are supplementary.", "small muted"));
  const dimensions = {action: "Action", event: "Event", camera_movement: "Camera movement", dynamic_object_number: "Object count", visual_content: "Visual content · supplementary"};
  for (const question of sample.questions) {
    const excluded = question.reference_decision !== "supported";
    const card = el("article", undefined, `question${excluded ? " excluded" : ""}`);
    const top = el("div", undefined, "check-top");
    const time = typeof question.start_sec === "number" && typeof question.end_sec === "number"
      ? ` · ${question.start_sec.toFixed(2)}–${question.end_sec.toFixed(2)} s` : "";
    top.append(el("div", `${question.question_id} · ${dimensions[question.dimension] || question.dimension}${time}`, "field"));
    card.append(top, el("p", question.reference, "reference"));
    const ref = el("div");
    ref.append(el("span", "Reference: ", "small"), badge(question.reference_decision));
    if (excluded) ref.append(el("span", " · Excluded from scores", "small muted"));
    card.append(ref);
    origin(card, question.reference_origin, "Reference review origin");
    const answers = el("div", undefined, "columns");
    for (const [arm, title] of Object.entries(arms)) {
      const answer = question.answers[arm];
      const column = el("div");
      column.append(el("h4", title), badge(answer.decision, answer.score));
      evidence(column, answer.evidence);
      if (answer.quote) column.append(el("blockquote", answer.quote));
      origin(column, answer.judgment_origin);
      answers.append(column);
    }
    card.append(answers);
    parent.append(card);
  }
}

function renderTag(sample, parent) {
  parent.append(el("h3", "Original tags"));
  const tags = el("dl", undefined, "tag-list");
  for (const [field, labels] of Object.entries(sample.tags)) {
    tags.append(el("dt", field), el("dd", Array.isArray(labels) ? labels.join(", ") || "—" : labels));
  }
  parent.append(tags, el("h3", "Label judgments"));
  sample.checks.forEach((check) => parent.append(checkCard(check)));
  parent.append(el("h3", "Main subject & action coverage"));
  for (const omission of sample.omissions) {
    const card = el("article", undefined, "check");
    const top = el("div", undefined, "check-top");
    top.append(el("strong", omission.field), badge(omission.status));
    card.append(top);
    if (omission.missing_labels.length) card.append(el("p", `Missing: ${omission.missing_labels.join(", ")}`, "evidence"));
    evidence(card, omission.evidence);
    parent.append(card);
  }
}

function renderReview(sample) {
  const parent = $("review");
  parent.replaceChildren();
  ({camera: renderCamera, caption: renderCaption, tag: renderTag})[task](sample, parent);
}

function renderSample() {
  const sample = samples[index];
  $("sample").value = sample.sample_id;
  $("position").textContent = `${index + 1} / ${samples.length}`;
  $("previous").disabled = index === 0;
  $("next").disabled = index === samples.length - 1;
  $("status").textContent = `${names[task]} · Sample ${sample.sample_id} · ${sample.author_reviewed ? "Author-reviewed subset" : "Extended model review"}`;
  $("image-meta").textContent = `${data.frame_fps} fps · ${sample.images.length} sheets`;
  $("review-meta").textContent = sample.author_reviewed ? "Author reviewed" : "Model reviewed";
  const gallery = $("gallery");
  gallery.replaceChildren();
  if (!sample.images.length) gallery.append(el("p", "Thumbnails are shared for the 100 author-reviewed samples. This record belongs to the extended audit; its annotations and judgments are shown on the right.", "empty"));
  sample.images.forEach((path, n) => {
    const figure = el("figure");
    const img = el("img");
    img.src = path;
    img.alt = `${names[task]} sample ${sample.sample_id}, timestamped contact sheet ${n + 1}`;
    img.loading = n === 0 ? "eager" : "lazy";
    const caption = el("figcaption");
    const link = el("a", "Open full-size ↗");
    link.href = path; link.target = "_blank"; link.rel = "noopener";
    caption.append(el("span", `Sheet ${n + 1} / ${sample.images.length}`), link);
    img.onerror = () => { caption.append(el("span", "Image could not be loaded.", "muted")); };
    figure.append(img, caption); gallery.append(figure);
  });
  renderReview(sample);
  gallery.scrollTop = 0; $("review").scrollTop = 0;
  const params = new URLSearchParams({task, sample: sample.sample_id, scope: $("scope").value});
  history.replaceState(null, "", `#${params}`);
}

function selectSamples(preferred) {
  samples = data.samples.filter((s) => $("scope").value === "all" || s.images.length > 0);
  $("sample").replaceChildren(...samples.map((s) => {
    const option = el("option", `Sample ${s.sample_id}`); option.value = s.sample_id; return option;
  }));
  index = Math.max(0, samples.findIndex((s) => s.sample_id === preferred));
  renderSample();
}

async function loadTask(nextTask, preferred) {
  const token = ++request;
  task = nextTask;
  $("workspace").hidden = true;
  ["sample", "scope", "previous", "next"].forEach((id) => { $(id).disabled = true; });
  $("status").textContent = `Loading ${names[task]} records…`;
  document.querySelectorAll("[data-task]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.task === task)));
  $("download").href = `data/${task}.json`;
  try {
    if (!cache.has(task)) {
      const loadingTask = task;
      const response = await fetch(`data/${loadingTask}.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      cache.set(loadingTask, await response.json());
    }
    if (token !== request) return;
    data = cache.get(task);
    $("sample").disabled = false; $("scope").disabled = false;
    selectSamples(preferred);
    $("workspace").hidden = false;
  } catch (error) {
    if (token !== request) return;
    $("status").textContent = location.protocol === "file:"
      ? "To open the viewer locally, run python -m http.server 8000 in the repository folder, then visit http://localhost:8000/."
      : `Could not load ${names[task]} records (${error.message}). Select the tab to try again.`;
  }
}

document.querySelectorAll("[data-task]").forEach((button) => {
  button.onclick = () => loadTask(button.dataset.task, task !== "tag" && button.dataset.task !== "tag" ? $("sample").value : undefined);
});
$("scope").onchange = () => selectSamples($("sample").value);
$("sample").onchange = () => { index = samples.findIndex((s) => s.sample_id === $("sample").value); renderSample(); };
$("previous").onclick = () => { if (index > 0) { index--; renderSample(); } };
$("next").onclick = () => { if (index < samples.length - 1) { index++; renderSample(); } };
document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|SELECT|TEXTAREA|BUTTON|A)$/.test(event.target.tagName)) return;
  const button = event.key === "ArrowLeft" ? $("previous") : event.key === "ArrowRight" ? $("next") : null;
  if (button && !button.disabled) { event.preventDefault(); button.click(); }
});
const params = new URLSearchParams(location.hash.slice(1));
if (params.get("scope") === "all") $("scope").value = "all";
loadTask(Object.hasOwn(names, params.get("task")) ? params.get("task") : "camera", params.get("sample"));
