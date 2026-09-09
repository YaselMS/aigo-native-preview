import type { PluginContext } from "@getpaseo/plugin";
import { DesktopPanel } from "./desktop.client";
import { getViewer } from "./desktop.server";
import { desktopViewer } from "./desktop.shared";

export default function contribute(plugin: PluginContext) {
  plugin.handle(desktopViewer, getViewer);
  plugin.addWorkspacePanel({
    id: "live-desktop",
    title: "Live desktop",
    icon: "Monitor",
    context: "agent",
    Component: DesktopPanel,
  });
  plugin.addCommandCenterItem({
    id: "open-live-desktop",
    title: "Open live desktop",
    icon: "Monitor",
    context: "agent",
    onSelect({ openPanel }) {
      openPanel("live-desktop");
    },
  });
  return () => {};
}
