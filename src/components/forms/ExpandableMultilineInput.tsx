import { useEffect, useState } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppInput } from '../ui/AppInput';
import { AppText } from '../ui/AppText';
import { colors, radius, shadows, spacing } from '../../design-system';

export const DEFAULT_EXPAND_HINT_MIN_LENGTH = 48;
export const DEFAULT_EXPAND_TEXT_THRESHOLD = 40;
const PREVIEW_LINE_LIMIT = 2;

export interface ExpandableMultilineInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  tone?: 'default' | 'surface';
  maxLength?: number;
  sheetTitle?: string;
  sheetPlaceholder?: string;
  expandAccessibilityLabel?: string;
  expandHint?: string;
  expandHintMinLength?: number;
  compactLines?: number;
  style?: StyleProp<TextStyle>;
  alwaysShowExpandButton?: boolean;
}

export interface ExpandableMultilineTextProps {
  label?: string;
  value?: string | null;
  emptyLabel?: string;
  variant?: 'bodySmall' | 'bodyMedium' | 'h3';
  color?: 'textPrimary' | 'textSecondary';
  layout?: 'inline' | 'stacked';
  sheetTitle?: string;
  expandLabel?: string;
  expandThreshold?: number;
  maxLength?: number;
}

function ExpandableTextSheet({
  visible,
  title,
  value,
  editable,
  maxLength,
  placeholder,
  onChangeText,
  onClose,
}: {
  visible: boolean;
  title: string;
  value: string;
  editable: boolean;
  maxLength: number;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [draft, setDraft] = useState(value);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [value, visible]);

  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
      setShouldFocusInput(false);
      return;
    }

    const focusTimer = setTimeout(() => {
      setShouldFocusInput(true);
    }, 320);

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      clearTimeout(focusTimer);
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [visible]);

  const handleDone = () => {
    if (editable && onChangeText) {
      onChangeText(draft.slice(0, maxLength));
    }
    Keyboard.dismiss();
    onClose();
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const sheetMaxHeight =
    keyboardHeight > 0
      ? Math.max(240, windowHeight - keyboardHeight - insets.top - spacing.xl)
      : Math.round(windowHeight * 0.46);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.sheetHost}>
        <Pressable style={styles.sheetBackdrop} onPress={handleClose} accessibilityRole="button" />

        <View
          style={[
            styles.sheet,
            {
              maxHeight: sheetMaxHeight,
              marginBottom: keyboardHeight,
              paddingBottom: keyboardHeight > 0 ? spacing.md : insets.bottom + spacing.md,
            },
          ]}
        >
          <View style={styles.sheetHeader}>
            <Pressable accessibilityRole="button" onPress={handleClose} hitSlop={8} style={styles.sheetHeaderAction}>
              <AppText variant="bodyMedium" color="textLink">
                Close
              </AppText>
            </Pressable>
            <AppText variant="bodyMedium" style={styles.sheetTitle} numberOfLines={1}>
              {title}
            </AppText>
            {editable ? (
              <Pressable accessibilityRole="button" onPress={handleDone} hitSlop={8} style={styles.sheetHeaderAction}>
                <AppText variant="bodyMedium" color="textLink" style={styles.sheetHeaderDone}>
                  Done
                </AppText>
              </Pressable>
            ) : (
              <View style={styles.sheetHeaderAction} />
            )}
          </View>

          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheetScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {editable ? (
              <AppInput
                tone="surface"
                value={draft}
                onChangeText={setDraft}
                placeholder={placeholder}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={maxLength}
                autoFocus={shouldFocusInput}
                style={styles.sheetInput}
              />
            ) : (
              <AppText variant="body" style={styles.sheetReadOnlyText}>
                {value.trim() || '—'}
              </AppText>
            )}
          </ScrollView>

          {editable ? (
            <AppText variant="caption" color="textMuted" style={styles.sheetCharacterCount}>
              {draft.length}/{maxLength} characters
            </AppText>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

export function ExpandableMultilineInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  tone = 'surface',
  maxLength = 120,
  sheetTitle,
  sheetPlaceholder,
  expandAccessibilityLabel,
  expandHint,
  expandHintMinLength = DEFAULT_EXPAND_HINT_MIN_LENGTH,
  compactLines = 3,
  style,
  alwaysShowExpandButton = false,
}: ExpandableMultilineInputProps) {
  const [expanded, setExpanded] = useState(false);
  const trimmed = value.trim();
  const showExpandButton = alwaysShowExpandButton || Boolean(trimmed);
  const showExpandHint = Boolean(expandHint) && trimmed.length >= expandHintMinLength;
  const resolvedSheetTitle = sheetTitle ?? label?.replace(/\s*\*$/, '') ?? 'Text';

  return (
    <>
      <View style={styles.inputBlock}>
        {label ? (
          <View style={styles.labelRow}>
            <AppText variant="label" style={[styles.label, tone === 'surface' && styles.labelSurface]}>
              {label}
            </AppText>
            {showExpandButton ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={expandAccessibilityLabel ?? `View full ${resolvedSheetTitle.toLowerCase()}`}
                onPress={() => setExpanded(true)}
                hitSlop={8}
                style={styles.expandButton}
              >
                <Ionicons name="expand-outline" size={18} color={colors.primary} />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <AppInput
          tone={tone}
          label={undefined}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          maxLength={maxLength}
          error={error}
          multiline
          numberOfLines={compactLines}
          textAlignVertical="top"
          style={[styles.compactInput, style]}
        />

        {showExpandHint ? (
          <Pressable accessibilityRole="button" onPress={() => setExpanded(true)}>
            <AppText variant="caption" color="textLink" style={styles.expandHint}>
              {expandHint}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <ExpandableTextSheet
        visible={expanded}
        title={resolvedSheetTitle}
        value={value}
        editable
        maxLength={maxLength}
        placeholder={sheetPlaceholder ?? placeholder}
        onChangeText={onChangeText}
        onClose={() => setExpanded(false)}
      />
    </>
  );
}

export function ExpandableMultilineText({
  label,
  value,
  emptyLabel = '—',
  variant = 'bodySmall',
  color = 'textSecondary',
  layout = 'inline',
  sheetTitle,
  expandLabel = 'View full text',
  expandThreshold = DEFAULT_EXPAND_TEXT_THRESHOLD,
  maxLength = 120,
}: ExpandableMultilineTextProps) {
  const [expanded, setExpanded] = useState(false);
  const displayValue = value?.trim() || emptyLabel;
  const isExpandable = Boolean(value?.trim()) && value.trim().length > expandThreshold;
  const resolvedSheetTitle = sheetTitle ?? label?.replace(/\s*\*$/, '') ?? 'Text';

  return (
    <>
      <Pressable
        accessibilityRole="button"
        disabled={!isExpandable}
        onPress={() => setExpanded(true)}
        style={({ pressed }) => [
          layout === 'stacked' ? styles.previewStack : styles.previewRow,
          pressed && isExpandable && styles.inputPressed,
        ]}
      >
        {label && layout === 'stacked' ? (
          <AppText variant="caption" color="textMuted" style={styles.previewStackLabel}>
            {label}
          </AppText>
        ) : null}

        {label && layout === 'inline' ? (
          <AppText variant={variant} color={color}>
            {label}:{' '}
          </AppText>
        ) : null}

        <AppText
          variant={variant}
          color={color}
          numberOfLines={layout === 'stacked' ? 3 : PREVIEW_LINE_LIMIT}
          style={[styles.previewText, layout === 'stacked' && styles.previewStackText]}
        >
          {displayValue}
        </AppText>

        {isExpandable && expandLabel ? (
          <AppText variant="caption" color="textLink" style={styles.previewExpandLabel}>
            {expandLabel}
          </AppText>
        ) : null}
      </Pressable>

      <ExpandableTextSheet
        visible={expanded}
        title={resolvedSheetTitle}
        value={value?.trim() ?? ''}
        editable={false}
        maxLength={maxLength}
        onClose={() => setExpanded(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  inputBlock: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  label: {
    flex: 1,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  labelSurface: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  expandButton: {
    padding: spacing.xs,
  },
  compactInput: {
    minHeight: 88,
    paddingTop: spacing.md,
  },
  expandHint: {
    marginTop: -spacing.xs,
  },
  inputPressed: {
    opacity: 0.92,
  },
  previewRow: {
    gap: spacing.xs,
  },
  previewStack: {
    gap: spacing.xs,
  },
  previewStackLabel: {
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  previewStackText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  previewText: {
    flexShrink: 1,
  },
  previewExpandLabel: {
    fontWeight: '600',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
  },
  sheetHost: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
    ...shadows.floating,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sheetHeaderAction: {
    minWidth: 52,
  },
  sheetTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  sheetHeaderDone: {
    textAlign: 'right',
    fontWeight: '700',
  },
  sheetScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  sheetScrollContent: {
    gap: spacing.md,
  },
  sheetInput: {
    minHeight: 112,
    maxHeight: 180,
    paddingTop: spacing.md,
  },
  sheetReadOnlyText: {
    color: colors.textPrimary,
    lineHeight: 24,
  },
  sheetCharacterCount: {
    textAlign: 'right',
  },
});
