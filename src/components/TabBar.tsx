import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme/theme";

export type MainTab = "home" | "plans" | "history" | "settings";

const tabs: Array<{ key: MainTab; label: string }> = [
  { key: "home", label: "Home" },
  { key: "plans", label: "Planos" },
  { key: "history", label: "Historico" },
  { key: "settings", label: "Config" },
];

type TabBarProps = {
  activeTab: MainTab;
  onPress: (tab: MainTab) => void;
};

export function TabBar({ activeTab, onPress }: TabBarProps) {
  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            onPress={() => onPress(tab.key)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: colors.primary,
  },
  activeTabLabel: {
    color: colors.primaryText,
  },
  tab: {
    alignItems: "center",
    borderRadius: radius.full,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingVertical: spacing.xs,
  },
  tabLabel: {
    color: colors.textMuted,
    ...typography.labelSm,
  },
  tabs: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.xs,
  },
});
