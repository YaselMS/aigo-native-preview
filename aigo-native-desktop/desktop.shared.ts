import { defineRpc } from "@getpaseo/plugin/server";
import { z } from "zod";

// The prototype accepts only its temporary HTTPS transport and a 256-bit hex capability.
export const viewerUrlSchema = z
  .string()
  .max(256)
  .regex(/^https:\/\/[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.trycloudflare\.com\/#([a-f0-9]{64})$/);

export const desktopViewer = defineRpc({
  name: "desktop.viewer",
  input: z.object({ agentId: z.string().min(1), workspaceId: z.string().min(1) }),
  output: z.object({ url: viewerUrlSchema }),
});
