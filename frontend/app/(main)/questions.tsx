import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
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
    sectionId: string;
    sectionName: string;
    sectionNameGu: string;
  }>();

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForPdf, setSelectedForPdf] = useState<Record<string, boolean>>({});
  const [generating, setGenerating] = useState(false);

  const colorSet = SubjectColors[params.subjectCode || 'JVN'] || SubjectColors.JVN;
  const isTablet = width >= 768;
  const contentMaxWidth = isTablet ? 600 : width;

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const sectionParam = params.sectionId ? `?section=${params.sectionId}` : '';
      const res = await fetch(`${BACKEND_URL}/api/questions/${params.subjectCode}${sectionParam}`);
      const data = await res.json();
      setQuestions(data);
    } catch (e) {
      console.error('Error fetching questions:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (qId: string) => {
    setSelectedForPdf((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const selectAll = () => {
    const allSelected: Record<string, boolean> = {};
    questions.forEach((q) => { allSelected[q.id] = true; });
    setSelectedForPdf(allSelected);
  };

  const deselectAll = () => {
    setSelectedForPdf({});
  };

  const selectedCount = Object.values(selectedForPdf).filter(Boolean).length;
  const allSelected = selectedCount === questions.length && questions.length > 0;

  const handleGeneratePDF = useCallback(async () => {
    if (selectedCount === 0) {
      Alert.alert('No Questions Selected', 'Please select at least one question to generate PDF.');
      return;
    }

    setGenerating(true);
    try {
      const selectedIds = Object.entries(selectedForPdf)
        .filter(([_, v]) => v)
        .map(([id]) => id);

      const title = `${params.subjectCode} - ${params.sectionName || params.subjectName}`;

      if (Platform.OS === 'web') {
        // Web: fetch POST and download blob
        const response = await fetch(`${BACKEND_URL}/api/generate-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject_code: params.subjectCode,
            title,
            selected_question_ids: selectedIds,
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${params.subjectCode}_${params.sectionId || 'all'}_questions.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          Alert.alert('Success', 'PDF downloaded successfully!');
        } else {
          Alert.alert('Error', 'Failed to generate PDF');
        }
      } else {
        // Mobile: Use GET endpoint with WebBrowser
        const idsParam = selectedIds.join(',');
        const pdfUrl = `${BACKEND_URL}/api/generate-pdf/${params.subjectCode}?selected_ids=${encodeURIComponent(idsParam)}&title=${encodeURIComponent(title)}`;
        await WebBrowser.openBrowserAsync(pdfUrl);
      }
    } catch (e) {
      console.error('PDF generation error:', e);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [selectedForPdf, selectedCount, params]);

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
          <TouchableOpacity testID="back-btn-empty" onPress={() => router.back()} style={[styles.backBtnAbs, { backgroundColor: colorSet.bg }]}>
            <Ionicons name="arrow-back" size={24} color={colorSet.accent} />
          </TouchableOpacity>
          <Ionicons name="document-text-outline" size={64} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No Questions Available</Text>
          <Text style={styles.emptySubtext}>Questions for {params.subjectCode} will be added soon.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={[styles.topBar, { backgroundColor: colorSet.accent }]}>
          <TouchableOpacity testID="back-btn-questions" onPress={() => router.back()} style={styles.topBackBtn}>
            <Ionicons name="arrow-back" size={20} color={Colors.surface} />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>{params.sectionName || params.subjectCode}</Text>
            <Text style={styles.topBarSub}>{params.sectionNameGu || params.subjectNameGu}</Text>
          </View>
          <Text style={styles.questionCountBadge}>{questions.length} Qs</Text>
        </View>

        {/* Select All Bar */}
        <View style={styles.selectBar}>
          <TouchableOpacity
            testID="toggle-select-all-btn"
            style={styles.selectAllBtn}
            onPress={allSelected ? deselectAll : selectAll}
          >
            <Ionicons
              name={allSelected ? 'checkbox' : 'square-outline'}
              size={22}
              color={allSelected ? colorSet.accent : Colors.textLight}
            />
            <Text style={[styles.selectAllText, allSelected && { color: colorSet.accent }]}>
              {allSelected ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.selectedCountText}>
            {selectedCount > 0 ? `${selectedCount} selected` : ''}
          </Text>
        </View>

        {/* Questions List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}
          showsVerticalScrollIndicator={false}
        >
          {questions.map((q) => {
            const isSelected = selectedForPdf[q.id] || false;
            return (
              <View
                key={q.id}
                testID={`question-item-${q.question_number}`}
                style={[styles.questionCard, isSelected && { borderColor: colorSet.accent, borderWidth: 2 }]}
              >
                {/* Question header with checkbox */}
                <View style={styles.qHeader}>
                  <TouchableOpacity
                    testID={`select-q-${q.question_number}`}
                    style={styles.checkboxRow}
                    onPress={() => toggleSelection(q.id)}
                  >
                    <Ionicons
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={24}
                      color={isSelected ? colorSet.accent : Colors.textLight}
                    />
                  </TouchableOpacity>
                  <View style={[styles.qBadge, { backgroundColor: colorSet.bg }]}>
                    <Text style={[styles.qBadgeText, { color: colorSet.accent }]}>
                      પ્રશ્ન {q.question_number}
                    </Text>
                  </View>
                </View>

                {/* Question Text */}
                <Text style={styles.questionText}>{q.question_text}</Text>

                {/* Options */}
                <View style={styles.optionsWrap}>
                  {q.options.map((opt) => (
                    <View key={opt.label} style={styles.optionRow}>
                      <View style={[styles.optLabel, { backgroundColor: colorSet.bg }]}>
                        <Text style={[styles.optLabelText, { color: colorSet.accent }]}>{opt.label}</Text>
                      </View>
                      <Text style={styles.optText}>{opt.text}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Bottom PDF Action Bar */}
        <View style={styles.bottomAction}>
          <TouchableOpacity
            testID="generate-pdf-btn"
            style={[
              styles.pdfButton,
              { backgroundColor: selectedCount > 0 ? colorSet.accent : Colors.textLight },
            ]}
            onPress={handleGeneratePDF}
            disabled={generating || selectedCount === 0}
            activeOpacity={0.8}
          >
            {generating ? (
              <ActivityIndicator color={Colors.surface} size="small" />
            ) : (
              <>
                <Ionicons name="document-text" size={20} color={Colors.surface} />
                <Text style={styles.pdfButtonText}>
                  {selectedCount > 0
                    ? `Convert to PDF (${selectedCount} Questions)`
                    : 'Select Questions for PDF'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  backBtnAbs: { position: 'absolute', top: Spacing.l, left: Spacing.l, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.l },
  emptySubtext: { fontSize: FontSizes.m, color: Colors.textSecondary, marginTop: Spacing.s, textAlign: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.m, paddingHorizontal: Spacing.l },
  topBackBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  topBarCenter: { flex: 1, marginLeft: Spacing.m },
  topBarTitle: { fontSize: FontSizes.m, fontWeight: '700', color: Colors.surface },
  topBarSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  questionCountBadge: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.surface, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: Spacing.m, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  selectBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.l, paddingVertical: Spacing.s,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  selectAllBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs },
  selectAllText: { fontSize: FontSizes.s, fontWeight: '600', color: Colors.textSecondary, marginLeft: Spacing.s },
  selectedCountText: { fontSize: FontSizes.xs, color: Colors.textLight },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.l, paddingBottom: 90 },
  questionCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.l, marginBottom: Spacing.l,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  qHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.m },
  checkboxRow: { padding: Spacing.xs, marginRight: Spacing.s },
  qBadge: { borderRadius: BorderRadius.full, paddingHorizontal: Spacing.m, paddingVertical: 3 },
  qBadgeText: { fontSize: 12, fontWeight: '700' },
  questionText: { fontSize: FontSizes.l, fontFamily: 'BGOT', color: Colors.textPrimary, lineHeight: 28, marginBottom: Spacing.m },
  optionsWrap: { gap: Spacing.s },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs },
  optLabel: {
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.m,
  },
  optLabelText: { fontSize: 12, fontWeight: '700' },
  optText: { flex: 1, fontSize: FontSizes.m, fontFamily: 'BGOT', color: Colors.textPrimary, lineHeight: 22 },
  bottomAction: {
    paddingHorizontal: Spacing.l, paddingVertical: Spacing.m,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  pdfButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: BorderRadius.xl, paddingVertical: Spacing.l,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  pdfButtonText: { color: Colors.surface, fontSize: FontSizes.m, fontWeight: '700', marginLeft: Spacing.s },
});
