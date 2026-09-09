import { type PluginAgentPanelProps, type PluginTheme, useRpc } from "@getpaseo/plugin";
import * as PaseoNative from "@getpaseo/plugin/react-native";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { desktopViewer } from "./desktop.shared";

function useStyles(theme: PluginTheme) {
  return useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.colors.surface0 },
        toolbar: { flexDirection: "row", gap: 8, padding: 8, alignItems: "center" },
        back: { padding: 10 },
        connect: { padding: 10, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border },
        body: { padding: 12, gap: 8 },
        foreground: { color: theme.colors.foreground },
        muted: { color: theme.colors.foregroundMuted },
        loading: { color: theme.colors.foregroundMuted, padding: 12 },
        warning: { color: theme.colors.statusWarning },
        preview: { color: theme.colors.foregroundMuted, fontSize: 12 },
      }),
    [theme],
  );
}

function ConnectedDesktop({ agentId, workspaceId, theme }: PluginAgentPanelProps) {
  const styles = useStyles(theme);
  const getViewer = useRpc(desktopViewer);
  const viewer = useQuery({
    queryKey: ["native-desktop-viewer", workspaceId, agentId],
    queryFn: () => getViewer({ agentId, workspaceId }),
    retry: false,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (viewer.isPending) {
    return <Text style={styles.loading}>Connecting to desktop…</Text>;
  }
  if (viewer.isError) {
    return (
      <View style={styles.body}>
        <Text accessibilityLiveRegion="polite" style={styles.warning}>
          Desktop unavailable. Check that this conversation has an active phone viewer on its host,
          then disconnect and retry.
        </Text>
      </View>
    );
  }
  return <PaseoNative.DesktopView url={viewer.data.url} />;
}

function NativeDesktopPanel(props: PluginAgentPanelProps) {
  const { agentId, navigation, theme } = props;
  const styles = useStyles(theme);
  const [connected, setConnected] = useState(false);
  const returnToChat = useCallback(() => {
    setConnected(false);
    navigation?.openAgent({ agentId });
  }, [navigation, agentId]);
  const toggleConnection = useCallback(() => setConnected((value) => !value), []);
  return (
    <View style={styles.root}>
      <View style={styles.toolbar}>
        {navigation && (
          <Pressable accessibilityRole="button" onPress={returnToChat} style={styles.back}>
            <Text style={styles.foreground}>Back to chat</Text>
          </Pressable>
        )}
        <Pressable accessibilityRole="button" onPress={toggleConnection} style={styles.connect}>
          <Text style={styles.foreground}>{connected ? "Disconnect" : "Connect desktop"}</Text>
        </Pressable>
      </View>
      {connected ? (
        <ConnectedDesktop {...props} />
      ) : (
        <View style={styles.body}>
          <Text style={styles.muted}>
            Connect to view this computer inside the app. Desktop control stays in the viewer.
          </Text>
          <Text style={styles.preview}>Native preview · notifications not configured</Text>
        </View>
      )}
    </View>
  );
}

export function DesktopPanel(props: PluginAgentPanelProps) {
  const styles = useStyles(props.theme);
  // COMPAT(aigo-desktop-view): prototype added after v0.7.2; remove when the native fork is required.
  const hasDesktopView = typeof PaseoNative.DesktopView === "function";
  if (!hasDesktopView) {
    return (
      <Text style={styles.loading}>
        Embedded desktop requires the Aigo native test build. This Paseo client does not include it.
      </Text>
    );
  }
  return <NativeDesktopPanel key={`${props.workspaceId}:${props.agentId}`} {...props} />;
}
