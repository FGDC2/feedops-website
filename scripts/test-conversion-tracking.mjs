#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import process from "node:process";

const ROOT = new URL("..", import.meta.url);
const BASE_URL = process.env.FEEDOPS_BASE_URL || "https://feedops.com";
const GTM_URL = "https://www.googletagmanager.com/gtm.js?id=GTM-KR4TR7B";
const MEASUREMENT_ID = "G-E0STBHGGMQ";
const DEFAULT_UTM = {
  source: "test-script-source",
  medium: "test-script-medium",
  campaign: "test-script-campaign",
};

const FLOWS = {
  meeting: {
    url: "/book-live-demo/",
    event: "FeedOps_Meeting_Booked",
    formId: null,
  },
  audit: {
    url: "/free-google-shopping-feed-audit/free-audit-form/",
    event: "FeedOps_Account_Created",
    formId: "34103a8f-c0af-4b86-9400-feb31017b795",
  },
  contact: {
    url: "/contact_us/",
    event: "FeedOps_Contact_Form",
    formId: "f6011325-2fe8-4cbf-8640-ba2ef4d67e00",
  },
};

const EXPECTED_EVENTS = Object.values(FLOWS).map((flow) => flow.event);

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

function arg(name, fallback = null) {
  const inlinePrefix = `--${name}=`;
  const inline = process.argv.find((value) => value.startsWith(inlinePrefix));
  if (inline) return inline.slice(inlinePrefix.length) || fallback;

  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1] || fallback;
}

function mode() {
  return arg("mode", "static");
}

function utmTags() {
  return {
    source: arg("utm-source", DEFAULT_UTM.source),
    medium: arg("utm-medium", DEFAULT_UTM.medium),
    campaign: arg("utm-campaign", DEFAULT_UTM.campaign),
  };
}

function debugSyntheticEvents() {
  return arg("debug", "true") !== "false";
}

function pageUrl(path) {
  const url = new URL(path, BASE_URL);
  const utm = utmTags();
  url.searchParams.set("utm_source", utm.source);
  url.searchParams.set("utm_medium", utm.medium);
  url.searchParams.set("utm_campaign", utm.campaign);
  return url.toString();
}

async function readRepoFile(path) {
  return readFile(new URL(path, ROOT), "utf8");
}

async function checkStaticSource() {
  const files = {
    demo: await readRepoFile("site/book-live-demo.js"),
    audit: await readRepoFile("site/free-google-shopping-feed-audit/free-audit-form/index.html"),
    contact: await readRepoFile("site/contact_us/index.html"),
  };

  const checks = [
    ["demo source emits the required event", files.demo.includes(`event: "${FLOWS.meeting.event}"`)],
    ["demo source does not send email to the data layer", !/event:\s*"FeedOps_Meeting_Booked"[\s\S]{0,300}email:\s*contact\.email/.test(files.demo)],
    ["audit source contains the correct HubSpot form", files.audit.includes(FLOWS.audit.formId)],
    ["audit source emits the required event", files.audit.includes(`event: 'FeedOps_Account_Created'`)],
    ["contact source contains the correct HubSpot form", files.contact.includes(FLOWS.contact.formId)],
    ["contact source emits the required event", files.contact.includes(`event: "FeedOps_Contact_Form"`)],
  ];

  for (const [description, result] of checks) {
    result ? pass(description) : fail(description);
  }
}

async function checkLiveGtmConfig() {
  const response = await fetch(GTM_URL);
  if (!response.ok) {
    fail(`could not download the live GTM container (${response.status})`);
    return;
  }

  const container = await response.text();
  pass("downloaded the live GTM container");

  if (container.includes(MEASUREMENT_ID)) {
    pass(`GTM contains the target GA4 measurement ID ${MEASUREMENT_ID}`);
  } else {
    fail(`GTM does not contain ${MEASUREMENT_ID}`);
  }

  for (const event of EXPECTED_EVENTS) {
    container.includes(event)
      ? pass(`GTM contains an event tag named ${event}`)
      : fail(`GTM does not contain an event tag named ${event}; publish the corresponding GA4 Event tag in GTM`);
  }
}

async function staticMode() {
  await checkStaticSource();
  await checkLiveGtmConfig();
}

function ga4EventFromRequest(request) {
  const requestUrl = new URL(request.url());
  const isGa4Collection = requestUrl.pathname === "/g/collect" && (
    requestUrl.hostname === "google-analytics.com" ||
    requestUrl.hostname === "www.google-analytics.com" ||
    requestUrl.hostname === "analytics.google.com" ||
    requestUrl.hostname.endsWith(".doubleclick.net")
  );
  if (!isGa4Collection) return null;

  const values = requestUrl.searchParams;
  if (request.method() === "POST" && request.postData()) {
    for (const [key, value] of new URLSearchParams(request.postData())) {
      values.set(key, value);
    }
  }

  return {
    measurementId: values.get("tid"),
    event: values.get("en"),
    debugMode: values.get("ep.debug_mode") ?? values.get("epn.debug_mode"),
  };
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    throw new Error("Playwright is not installed. Run: npm install");
  }
}

async function syntheticMode() {
  if (process.env.ALLOW_SYNTHETIC_EVENTS !== "1") {
    throw new Error("Synthetic events are opt-in. Set ALLOW_SYNTHETIC_EVENTS=1; they will be sent to the live GA4 property.");
  }

  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const ga4Events = [];

  page.on("request", (request) => {
    const event = ga4EventFromRequest(request);
    if (event?.event && EXPECTED_EVENTS.includes(event.event)) ga4Events.push(event);
  });

  const startingUrl = pageUrl("/");
  await page.goto(startingUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const loadedUrl = await page.url();
  const loadedQuery = new URL(loadedUrl).searchParams;
  for (const [key, value] of Object.entries(utmTags())) {
    const queryKey = `utm_${key}`;
    loadedQuery.get(queryKey) === value
      ? pass(`synthetic run retained ${queryKey}=${value}`)
      : fail(`synthetic run lost ${queryKey}=${value}`);
  }
  await page.evaluate(({ events, debug }) => {
    window.dataLayer = window.dataLayer || [];
    for (const event of events) {
      const payload = { event, test_run: true };
      if (debug) payload.debug_mode = true;
      window.dataLayer.push(payload);
    }
  }, { events: EXPECTED_EVENTS, debug: debugSyntheticEvents() });
  await page.waitForTimeout(5000);
  await browser.close();

  pass(`synthetic events sent with debug_mode=${debugSyntheticEvents()}`);

  for (const event of EXPECTED_EVENTS) {
    const request = ga4Events.find((candidate) => candidate.event === event && candidate.measurementId === MEASUREMENT_ID);
    request
      ? pass(`synthetic ${event} reached GA4 ${MEASUREMENT_ID}`)
      : fail(`synthetic ${event} did not produce a GA4 request for ${MEASUREMENT_ID}`);
    if (debugSyntheticEvents()) {
      request?.debugMode === "true"
        ? pass(`synthetic ${event} was marked for GA4 DebugView`)
        : fail(`synthetic ${event} reached GA4 without a usable debug_mode=true signal`);
    }
  }
}

async function liveMode() {
  if (process.env.ALLOW_LIVE_SUBMISSION !== "1") {
    throw new Error("Live mode is opt-in. Set ALLOW_LIVE_SUBMISSION=1; you must manually submit the selected live form.");
  }

  const flowName = arg("flow");
  const flow = FLOWS[flowName];
  if (!flow) throw new Error("Live mode requires --flow=meeting, --flow=audit, or --flow=contact");

  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const ga4Events = [];

  page.on("request", (request) => {
    const event = ga4EventFromRequest(request);
    if (event) ga4Events.push(event);
  });

  const startingUrl = pageUrl(flow.url);
  await page.goto(startingUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const loadedUrl = new URL(await page.url());
  for (const [key, value] of Object.entries(utmTags())) {
    const queryKey = `utm_${key}`;
    loadedUrl.searchParams.get(queryKey) === value
      ? pass(`live run started with ${queryKey}=${value}`)
      : fail(`live run did not retain ${queryKey}=${value}`);
  }
  console.log(`Submit the ${flowName} flow manually in the opened browser using controlled test data.`);
  console.log("The script will wait up to five minutes for the expected dataLayer/GA4 event.");

  const deadline = Date.now() + 5 * 60 * 1000;
  while (Date.now() < deadline) {
    const state = await page.evaluate(() => ({
      dataLayer: (window.dataLayer || []).map((item) => item?.event).filter(Boolean),
      url: window.location.href,
    }));
    const eventSeen = state.dataLayer.includes(flow.event) || ga4Events.some((event) => event.event === flow.event);
    if (eventSeen) {
      pass(`${flow.event} was observed`);
      const ga4 = ga4Events.find((event) => event.event === flow.event);
      ga4
        ? pass(`GA4 received ${flow.event} for ${ga4.measurementId}`)
        : fail(`${flow.event} was observed, but no GA4 request was captured`);
      await browser.close();
      return;
    }
    await page.waitForTimeout(1000);
  }

  fail(`timed out waiting for ${flow.event}`);
  await browser.close();
}

try {
  if (mode() === "static") await staticMode();
  else if (mode() === "synthetic") await syntheticMode();
  else if (mode() === "live") await liveMode();
  else throw new Error(`Unknown mode: ${mode()}`);
} catch (error) {
  fail(error.message);
}
