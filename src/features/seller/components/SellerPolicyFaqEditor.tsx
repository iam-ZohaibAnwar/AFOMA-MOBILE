import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '../../../components/ui/AppButton';
import { AppInput } from '../../../components/ui/AppInput';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { SellerPolicyFaqEntry } from '../utils/sellerSetupForms';

export interface SellerPolicyFaqEditorProps {
  faqList: SellerPolicyFaqEntry[];
  draftQuestion: string;
  draftAnswer: string;
  onDraftQuestionChange: (value: string) => void;
  onDraftAnswerChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  error?: string | null;
  tone?: 'default' | 'surface';
}

export function SellerPolicyFaqEditor({
  faqList,
  draftQuestion,
  draftAnswer,
  onDraftQuestionChange,
  onDraftAnswerChange,
  onAdd,
  onRemove,
  error,
  tone = 'default',
}: SellerPolicyFaqEditorProps) {
  return (
    <View style={styles.container}>
      <AppText variant="bodyMedium" style={styles.title}>
        FAQs
      </AppText>
      <AppText variant="caption" color="textSecondary">
        Optional shop FAQs shown on your store policies.
      </AppText>

      <AppInput
        tone={tone}
        label="Question"
        value={draftQuestion}
        onChangeText={onDraftQuestionChange}
        placeholder="Enter a question"
      />
      <AppInput
        tone={tone}
        label="Answer"
        value={draftAnswer}
        onChangeText={onDraftAnswerChange}
        placeholder="Enter an answer"
        multiline
        numberOfLines={3}
      />

      <AppButton label="Add FAQ" variant="primary" onPress={onAdd} />

      {error ? (
        <AppText variant="caption" color="error">
          {error}
        </AppText>
      ) : null}

      {faqList.length > 0 ? (
        <View style={styles.list}>
          {faqList.map((faq, index) => (
            <View key={`${faq.question}-${index}`} style={styles.item}>
              <View style={styles.itemCopy}>
                <AppText variant="bodyMedium" style={styles.question}>
                  {faq.question}
                </AppText>
                <AppText variant="bodySmall" color="textSecondary">
                  {faq.answer}
                </AppText>
              </View>
              <Pressable accessibilityRole="button" onPress={() => onRemove(index)} style={styles.removeButton}>
                <AppText variant="bodySmall" color="error">
                  Remove
                </AppText>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  itemCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  question: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  removeButton: {
    paddingVertical: spacing.xs,
  },
});
