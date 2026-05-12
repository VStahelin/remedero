import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme/theme";

type Option = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  onChange: (value: string) => void;
  options: Option[];
  value: string;
};

export function SelectField({ onChange, options, value }: SelectFieldProps) {
  const selected = options.find((o) => o.value === value);
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={styles.field}
      >
        <Text style={styles.fieldText}>{selected?.label ?? value}</Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent visible={open}>
        <Pressable onPress={() => setOpen(false)} style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            {options.map((opt, i) => (
              <TouchableOpacity
                key={opt.value}
                accessibilityRole="button"
                onPress={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={[styles.option, i > 0 && styles.optionBorder]}
              >
                <Text style={[styles.optionText, opt.value === value && styles.optionTextSelected]}>
                  {opt.label}
                </Text>
                {opt.value === value && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  check: {
    color: colors.primary,
    ...typography.labelMd,
  },
  chevron: {
    color: colors.textSubtle,
    fontSize: 16,
  },
  field: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.base,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fieldText: {
    color: colors.text,
    ...typography.bodyMd,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: colors.border,
    borderRadius: radius.full,
    height: 4,
    marginBottom: spacing.sm,
    width: 40,
  },
  option: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  optionBorder: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  optionText: {
    color: colors.text,
    ...typography.bodyMd,
  },
  optionTextSelected: {
    color: colors.primarySoft,
    fontWeight: "700",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.6)",
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surfaceDim,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
