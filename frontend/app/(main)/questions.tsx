import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSizes, SubjectColors } from '../../constants/Theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface QuestionOption {
  label: string;
  text: string;
}

interface QuestionData {
  id: string;
  question_number: number;
  question_text: string;
  options: QuestionOption[];
  subject: string;
}

export default function QuestionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    subjectCode: string;
    subjectName: string;
    subjectNameGu: string;
  }>();

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});

  const colorSet = SubjectColors[params.subjectCode || 'JVN'] || SubjectColors.JVN;

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/questions/${params.subjectCode}`);
      const data = await res.json();
      setQuestions(data);
    } catch (e) {
      console.error('Error fetching questions:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIndex: number, label: string) => {
    setSelectedOptions((prev) => ({ ...prev, [qIndex]: label }));
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colorSet.accent} />
        <Text style={styles.loadingText}>Loading Questions...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <TouchableOpacity
            testID="back-btn-empty"
            onPress={() => router.back()}
            style={[styles.backBtnTop, { backgroundColor: colorSet.bg }]}
          >
            <Ionicons name="arrow-back" size={24} color={colorSet.accent} />
          </TouchableOpacity>
          <Ionicons name="document-text-outline" size={64} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No Questions Available</Text>
          <Text style={styles.emptySubtext}>
            Questions for {params.subjectCode} will be added soon.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentIndex];
  const selected = selectedOptions[currentIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={[styles.topBar, { backgroundColor: colorSet.accent }]}>
          <TouchableOpacity
            testID="back-btn-questions"
            onPress={() => router.back()}
            style={styles.topBackBtn}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.surface} />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>{params.subjectCode} Practice</Text>
            <Text style={styles.topBarSub}>{params.subjectNameGu}</Text>
          </View>
          <View style={styles.questionCounter}>
            <Text style={styles.counterText}>
              {currentIndex + 1}/{questions.length}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
                backgroundColor: colorSet.accent,
              },
            ]}
          />
        </View>

        {/* Question Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Number Badge */}
          <View style={[styles.qNumberBadge, { backgroundColor: colorSet.bg }]}>
            <Text style={[styles.qNumberText, { color: colorSet.accent }]}>
              પ્રશ્ન {currentQ.question_number}
            </Text>
          </View>

          {/* Question Text */}
          <View style={styles.questionCard}>
            <Text style={styles.questionText} testID="question-text">
              {currentQ.question_text}
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQ.options.map((opt) => {
              const isSelected = selected === opt.label;
              return (
                <TouchableOpacity
                  key={opt.label}
                  testID={`option-${opt.label.toLowerCase()}`}
                  style={[
                    styles.optionCard,
                    isSelected && {
                      backgroundColor: colorSet.bg,
                      borderColor: colorSet.accent,
                    },
                  ]}
                  onPress={() => handleSelectOption(currentIndex, opt.label)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.optionLabelCircle,
                      isSelected && { backgroundColor: colorSet.accent },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && { color: Colors.surface },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && { color: colorSet.accent, fontWeight: '600' },
                    ]}
                  >
                    {opt.text}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colorSet.accent}
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            testID="prev-question-btn"
            style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
            onPress={goPrev}
            disabled={currentIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentIndex === 0 ? Colors.textLight : colorSet.accent}
            />
            <Text
              style={[
                styles.navBtnText,
                { color: currentIndex === 0 ? Colors.textLight : colorSet.accent },
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          {/* Question dots */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dotsScroll}
            contentContainerStyle={styles.dotsContainer}
          >
            {questions.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setCurrentIndex(i)}
                style={[
                  styles.dot,
                  i === currentIndex && { backgroundColor: colorSet.accent, transform: [{ scale: 1.3 }] },
                  selectedOptions[i] && i !== currentIndex && { backgroundColor: Colors.success },
                ]}
              />
            ))}
          </ScrollView>

          <TouchableOpacity
            testID="next-question-btn"
            style={[
              styles.navBtn,
              currentIndex === questions.length - 1 && styles.navBtnDisabled,
            ]}
            onPress={goNext}
            disabled={currentIndex === questions.length - 1}
          >
            <Text
              style={[
                styles.navBtnText,
                {
                  color:
                    currentIndex === questions.length - 1
                      ? Colors.textLight
                      : colorSet.accent,
                },
              ]}
            >
              Next
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={
                currentIndex === questions.length - 1
                  ? Colors.textLight
                  : colorSet.accent
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.m,
    color: Colors.textSecondary,
    fontSize: FontSizes.m,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
    backgroundColor: Colors.background,
  },
  backBtnTop: {
    position: 'absolute',
    top: Spacing.l,
    left: Spacing.l,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.l,
  },
  emptySubtext: {
    fontSize: FontSizes.m,
    color: Colors.textSecondary,
    marginTop: Spacing.s,
    textAlign: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
  },
  topBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarCenter: {
    flex: 1,
    marginLeft: Spacing.m,
  },
  topBarTitle: {
    fontSize: FontSizes.l,
    fontWeight: '700',
    color: Colors.surface,
  },
  topBarSub: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  questionCounter: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
  },
  counterText: {
    fontSize: FontSizes.s,
    fontWeight: '700',
    color: Colors.surface,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.border,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  qNumberBadge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.s,
    marginBottom: Spacing.l,
  },
  qNumberText: {
    fontSize: FontSizes.s,
    fontWeight: '700',
  },
  questionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  questionText: {
    fontSize: FontSizes.l,
    fontFamily: 'BGOT',
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: Spacing.m,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.l,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.m,
  },
  optionLabelCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  optionLabel: {
    fontSize: FontSizes.s,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  optionText: {
    flex: 1,
    fontSize: FontSizes.m,
    fontFamily: 'BGOT',
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  checkIcon: {
    marginLeft: Spacing.s,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.m,
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnText: {
    fontSize: FontSizes.s,
    fontWeight: '600',
    marginHorizontal: Spacing.xs,
  },
  dotsScroll: {
    flex: 1,
    marginHorizontal: Spacing.s,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.s,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 3,
  },
});
