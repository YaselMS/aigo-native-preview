import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { readViewer } from "./desktop.server";

test("viewer URL is disclosed only for its configured workspace and conversation", async () => {
  const directory = await mkdtemp(join(tmpdir(), "aigo-native-plugin-"));
  const sessionFile = join(directory, "session.json");
  const urlFile = join(directory, "phone-url.txt");
  const input = { agentId: "fixture-agent", workspaceId: "fixture-workspace" };
  const url = `https://fixture-native.trycloudflare.com/#${"a".repeat(64)}`;
  try {
    await writeFile(sessionFile, JSON.stringify({ ...input, viewerToken: "never-return-this" }));
    await writeFile(urlFile, `\uFEFF${url}\r\n`);
    assert.deepEqual(await readViewer(input, { sessionFile, urlFile }), { url });
    await assert.rejects(
      readViewer({ ...input, agentId: "different-agent" }, { sessionFile, urlFile }),
      /not enabled for this conversation and workspace/,
    );
    await assert.rejects(
      readViewer({ ...input, workspaceId: "different-workspace" }, { sessionFile, urlFile }),
      /not enabled for this conversation and workspace/,
    );
    assert.equal(
      await readFile(sessionFile, "utf8"),
      JSON.stringify({ ...input, viewerToken: "never-return-this" }),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("viewer rejects unrelated origins, credentials, query strings and malformed tokens", async () => {
  const directory = await mkdtemp(join(tmpdir(), "aigo-native-plugin-"));
  const sessionFile = join(directory, "session.json");
  const urlFile = join(directory, "phone-url.txt");
  const input = { agentId: "fixture-agent", workspaceId: "fixture-workspace" };
  const token = "a".repeat(64);
  const invalidUrls = [
    `http://fixture.trycloudflare.com/#${token}`,
    `https://fixture.trycloudflare.com.evil.example/#${token}`,
    `https://user:password@fixture.trycloudflare.com/#${token}`,
    `https://fixture.trycloudflare.com:443/#${token}`,
    `https://fixture.trycloudflare.com/path#${token}`,
    `https://fixture.trycloudflare.com/?next=other#${token}`,
    "https://fixture.trycloudflare.com/#too-short",
    `https://fixture.trycloudflare.com/#${token}extra`,
  ];
  try {
    await writeFile(sessionFile, JSON.stringify(input));
    for (const url of invalidUrls) {
      await writeFile(urlFile, url);
      await assert.rejects(readViewer(input, { sessionFile, urlFile }), {
        message: "The live desktop address is unavailable. Start the phone viewer on the host.",
      });
    }
    await writeFile(sessionFile, '{ "viewerToken": "private-value"');
    await assert.rejects(readViewer(input, { sessionFile, urlFile }), {
      message: "The desktop session is unavailable.",
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("configuration is explicit and does not infer paths", async () => {
  const input = { agentId: "fixture-agent", workspaceId: "fixture-workspace" };
  await assert.rejects(
    readViewer(input, { sessionFile: undefined, urlFile: undefined }),
    /not configured/,
  );
  await assert.rejects(
    readViewer(input, { sessionFile: "session.json", urlFile: "phone-url.txt" }),
    /absolute configuration paths/,
  );
});
