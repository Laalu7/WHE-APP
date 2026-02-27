import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{
    subjectCode: string;
    subjectName: string;
    subjectNameGu: string;
  }>();

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [selectedForPdf, setSelectedForPdf] = useState<Record<string, boolean>>({});

  const colorSet = SubjectColors[params.subjectCode || 'JVN'] || SubjectColors.JVN;
  const isTablet = width >= 768;
  const contentMaxWidth = isTablet ? 600 : width;

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

  const togglePdfSelection = (qId: string) => {
    setSelectedForPdf((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const selectedCount = Object.values(selectedForPdf).filter(Boolean).length;

  const goNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleExportSelected = () => {
    const selectedIds = Object.entries(selectedForPdf)
      .filter(([_, v]) => v)
      .map(([id]) => id);

    router.push({
      pathname: '/(main)/pdf-export',
      params: {
        subjectCode: params.subjectCode,
        subjectName: params.subjectName,
        subjectNameGu: params.subjectNameGu,
        selectedIds: JSON.stringify(selectedIds),
      },
    });
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.emptyContainer}>
          <TouchableOpacity testID="back-btn-empty" onPress={() => router.back()} style={[styles.backBtnTop, { backgroundColor: colorSet.bg }]}>
            <Ionicons name="arrow-back" size={24} color={colorSet.accent} />
          </TouchableOpacity>
          <Ionicons name="document-text-outline" size={64} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No Questions Available</Text>
          <Text style={styles.emptySubtext}>Questions for {params.subjectCode} will be added soon.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentIndex];
  const selected = selectedOptions[currentIndex];
  const isPdfSelected = selectedForPdf[currentQ.id] || false;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={[styles.topBar, { backgroundColor: colorSet.accent }]}>
          <TouchableOpacity testID="back-btn-questions" onPress={() => router.back()} style={styles.topBackBtn}>
            <Ionicons name="arrow-back" size={20} color={Colors.surface} />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>{params.subjectCode} Practice</Text>
          </View>
          <View style={styles.questionCounter}>
            <Text style={styles.counterText}>{currentIndex + 1}/{questions.length}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${((currentIndex + 1) / questions.length) * 100}%`, backgroundColor: colorSet.accent }]} />
        </View>

        {/* Question Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Question header with select checkbox */}
          <View style={styles.qHeaderRow}>
            <View style={[styles.qNumberBadge, { backgroundColor: colorSet.bg }]}>
              <Text style={[styles.qNumberText, { color: colorSet.accent }]}>પ્રશ્ન {currentQ.question_number}</Text>
            </View>

            <TouchableOpacity
              testID="select-for-pdf-btn"
              style={[styles.selectPdfBtn, isPdfSelected && { backgroundColor: colorSet.accent, borderColor: colorSet.accent }]}
              onPress={() => togglePdfSelection(currentQ.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isPdfSelected ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={isPdfSelected ? Colors.surface : Colors.textLight}
              />
              <Text style={[styles.selectPdfText, isPdfSelected && { color: Colors.surface }]}>
                {isPdfSelected ? 'Selected' : 'Select for PDF'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Question Text */}
          <View style={styles.questionCard}>
            <Text style={styles.questionText} testID="question-text">{currentQ.question_text}</Text>
          </View>

          {/* Options */}
          {currentQ.options.map((opt) => {
            const isSelected = selected === opt.label;
            return (
              <TouchableOpacity
                key={opt.label}
                testID={`option-${opt.label.toLowerCase()}`}
                style={[
                  styles.optionCard,
                  isSelected && { backgroundColor: colorSet.bg, borderColor: colorSet.accent },
                ]}
                onPress={() => handleSelectOption(currentIndex, opt.label)}
                activeOpacity={0.7}
              >
                <View style={[styles.optionLabelCircle, isSelected && { backgroundColor: colorSet.accent }]}>
                  <Text style={[styles.optionLabel, isSelected && { color: Colors.surface }]}>{opt.label}</Text>
                </View>
                <Text style={[styles.optionText, isSelected && { color: colorSet.accent, fontWeight: '600' }]}>{opt.text}</Text>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color={colorSet.accent} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            testID="prev-question-btn"
            style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
            onPress={goPrev}
            disabled={currentIndex === 0}
          >
            <Ionicons name="chevron-back" size={18} color={currentIndex === 0 ? Colors.textLight : colorSet.accent} />
            <Text style={[styles.navBtnText, { color: currentIndex === 0 ? Colors.textLight : colorSet.accent }]}>Prev</Text>
          </TouchableOpacity>

          {/* Question dots */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dotsScroll} contentContainerStyle={styles.dotsContainer}>
            {questions.map((q, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setCurrentIndex(i)}
                style={[
                  styles.dot,
                  i === currentIndex && { backgroundColor: colorSet.accent, transform: [{ scale: 1.4 }] },
                  selectedOptions[i] && i !== currentIndex && { backgroundColor: Colors.success },
                  selectedForPdf[q.id] && i !== currentIndex && { borderWidth: 2, borderColor: colorSet.accent },
                ]}
              />
            ))}
          </ScrollView>

          <TouchableOpacity
            testID="next-question-btn"
            style={[styles.navBtn, currentIndex === questions.length - 1 && styles.navBtnDisabled]}
            onPress={goNext}
            disabled={currentIndex === questions.length - 1}
          >
            <Text style={[styles.navBtnText, { color: currentIndex === questions.length - 1 ? Colors.textLight : colorSet.accent }]}>Next</Text>
            <Ionicons name="chevron-forward" size={18} color={currentIndex === questions.length - 1 ? Colors.textLight : colorSet.accent} />
          </TouchableOpacity>
        </View>

        {/* Export FAB */}
        {selectedCount > 0 && (
          <TouchableOpacity
            testID="export-selected-fab"
            style={[styles.exportFab, { backgroundColor: colorSet.accent }]}
            onPress={handleExportSelected}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text" size={20} color={Colors.surface} />
            <Text style={styles.exportFabText}>PDF ({selectedCount})</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { marginTop: Spacing.m, color: Colors.textSecondary, fontSize: FontSizes.m },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxl, backgroundColor: Colors.background },
  backBtnTop: { position: 'absolute', top: Spacing.l, left: Spacing.l, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.l },
  emptySubtext: { fontSize: FontSizes.m, color: Colors.textSecondary, marginTop: Spacing.s, textAlign: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.m, paddingHorizontal: Spacing.l },
  topBackBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  topBarCenter: { flex: 1, marginLeft: Spacing.m },
  topBarTitle: { fontSize: FontSizes.m, fontWeight: '700', color: Colors.surface },
  questionCounter: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.m, paddingVertical: Spacing.xs },
  counterText: { fontSize: FontSizes.s, fontWeight: '700', color: Colors.surface },
  progressBarBg: { height: 3, backgroundColor: Colors.border },
  progressBarFill: { height: '100%', borderRadius: 2 },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.l, paddingBottom: 80 },
  qHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.m },
  qNumberBadge: { borderRadius: BorderRadius.full, paddingHorizontal: Spacing.m, paddingVertical: Spacing.xs },
  qNumberText: { fontSize: FontSizes.s, fontWeight: '700' },
  selectPdfBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.full, paddingHorizontal: Spacing.m, paddingVertical: Spacing.xs,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  selectPdfText: { fontSize: 11, fontWeight: '600', color: Colors.textLight, marginLeft: 4 },
  questionCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.l,
    marginBottom: Spacing.l, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  questionText: { fontSize: FontSizes.l, fontFamily: 'BGOT', color: Colors.textPrimary, lineHeight: 28 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl, padding: Spacing.l,
    borderWidth: 1.5, borderColor: Colors.border, marginBottom: Spacing.m,
  },
  optionLabelCircle: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.m,
  },
  optionLabel: { fontSize: FontSizes.s, fontWeight: '700', color: Colors.textSecondary },
  optionText: { flex: 1, fontSize: FontSizes.m, fontFamily: 'BGOT', color: Colors.textPrimary, lineHeight: 22 },
  bottomBar: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.m, backgroundColor: Colors.surface,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.s, paddingHorizontal: Spacing.s },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: FontSizes.xs, fontWeight: '600', marginHorizontal: 2 },
  dotsScroll: { flex: 1, marginHorizontal: Spacing.xs },
  dotsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.s },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border, marginHorizontal: 3 },
  exportFab: {
    position: 'absolute', bottom: 70, right: Spacing.l,
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.full, paddingHorizontal: Spacing.l, paddingVertical: Spacing.m,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  exportFabText: { color: Colors.surface, fontSize: FontSizes.s, fontWeight: '700', marginLeft: Spacing.xs },
});
