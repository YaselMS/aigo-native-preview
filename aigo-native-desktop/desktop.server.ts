import { readFile } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { z } from "zod";
import { desktopViewer, viewerUrlSchema } from "./desktop.shared";

const sessionSchema = z.object({
  agentId: z.string().min(1),
  workspaceId: z.string().min(1),
});

interface ViewerFiles {
  sessionFile: string | undefined;
  urlFile: string | undefined;
}

export async function readViewer(
  input: z.output<typeof desktopViewer.input>,
  { sessionFile, urlFile }: ViewerFiles,
) {
  if (!sessionFile || !urlFile) {
    throw new Error("The native desktop test is not configured on this host.");
  }
  if (!isAbsolute(sessionFile) || !isAbsolute(urlFile)) {
    throw new Error("The native desktop test requires absolute configuration paths.");
  }

  let session: z.output<typeof sessionSchema>;
  try {
    const text = await readFile(sessionFile, "utf8");
    session = sessionSchema.parse(JSON.parse(text.replace(/^\uFEFF/, "")));
  } catch {
    // Parsing errors can contain file contents. Keep session credentials out of RPC errors.
    throw new Error("The desktop session is unavailable.");
  }

  const matchesConversation = input.agentId === session.agentId;
  const matchesWorkspace = input.workspaceId === session.workspaceId;
  if (!matchesConversation || !matchesWorkspace) {
    throw new Error("Desktop access is not enabled for this conversation and workspace.");
  }

  try {
    const text = await readFile(urlFile, "utf8");
    const url = viewerUrlSchema.parse(text.replace(/^\uFEFF/, "").trim());
    return { url };
  } catch {
    // Neither the signed URL nor a parser error containing it crosses the error boundary.
    throw new Error("The live desktop address is unavailable. Start the phone viewer on the host.");
  }
}

export function getViewer(input: z.output<typeof desktopViewer.input>) {
  return readViewer(input, {
    sessionFile: process.env.AIGO_DESKTOP_SESSION_FILE,
    urlFile: process.env.AIGO_LIVE_URL_FILE,
  });
}
