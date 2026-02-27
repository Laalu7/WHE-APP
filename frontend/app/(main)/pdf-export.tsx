import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSizes, SubjectColors } from '../../constants/Theme';
import * as WebBrowser from 'expo-web-browser';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function PDFExportScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{
    subjectCode: string;
    subjectName: string;
    subjectNameGu: string;
    selectedIds: string;
  }>();

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const colorSet = SubjectColors[params.subjectCode || 'JVN'] || SubjectColors.JVN;
  const isTablet = width >= 768;
  const contentMaxWidth = isTablet ? 500 : width;

  let selectedIds: string[] = [];
  try {
    if (params.selectedIds) {
      selectedIds = JSON.parse(params.selectedIds);
    }
  } catch (e) {}

  const hasSelectedQuestions = selectedIds.length > 0;

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const pdfUrl = `${BACKEND_URL}/api/generate-pdf`;
      const body: any = {
        subject_code: params.subjectCode,
        title: `${params.subjectCode} - ${params.subjectName}`,
      };

      if (hasSelectedQuestions) {
        body.selected_question_ids = selectedIds;
      }

      if (Platform.OS === 'web') {
        const response = await fetch(pdfUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${params.subjectCode}_question_paper.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          setGenerated(true);
        } else {
          Alert.alert('Error', 'Failed to generate PDF');
        }
      } else {
        await WebBrowser.openBrowserAsync(pdfUrl);
        setGenerated(true);
      }
    } catch (e) {
      console.error('PDF generation error:', e);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colorSet.accent }]}>
          <TouchableOpacity testID="back-btn-pdf" onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PDF Export</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={[styles.content, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}
          showsVerticalScrollIndicator={false}
        >
          {/* PDF Preview Card */}
          <View style={styles.previewCard}>
            <View style={[styles.pdfIconCircle, { backgroundColor: colorSet.bg }]}>
              <Ionicons name="document-text" size={40} color={colorSet.accent} />
            </View>
            <Text style={styles.previewTitle}>{params.subjectCode} Question Paper</Text>
            <Text style={styles.previewSubtitle}>{params.subjectName}</Text>
            <Text style={styles.previewGujarati}>{params.subjectNameGu}</Text>

            {/* Selected count */}
            {hasSelectedQuestions ? (
              <View style={[styles.selectedBadge, { backgroundColor: colorSet.bg }]}>
                <Ionicons name="checkmark-circle" size={18} color={colorSet.accent} />
                <Text style={[styles.selectedBadgeText, { color: colorSet.accent }]}>
                  {selectedIds.length} Selected Questions
                </Text>
              </View>
            ) : (
              <View style={styles.previewInfoRow}>
                <View style={styles.previewInfoItem}>
                  <Ionicons name="help-circle-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.previewInfoText}>All Questions</Text>
                </View>
                <View style={styles.previewInfoItem}>
                  <Ionicons name="layers-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.previewInfoText}>3 Sections</Text>
                </View>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.sectionsList}>
              <Text style={styles.sectionsTitle}>Included Sections:</Text>
              {['Mental Ability Test', 'Mathematical Test', 'Gujarati Test'].map((s, i) => (
                <View key={i} style={styles.sectionItem}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.sectionItemText}>Section {i + 1}: {s}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Hint */}
          {!hasSelectedQuestions && (
            <View style={styles.hintBox}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
              <Text style={styles.hintText}>
                Tip: Go to Practice and select specific questions for PDF export
              </Text>
            </View>
          )}

          {/* Generate Button */}
          {generated ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
              <Text style={styles.successTitle}>PDF Generated!</Text>
              <Text style={styles.successText}>Your question paper has been downloaded.</Text>
              <TouchableOpacity
                testID="generate-again-btn"
                style={[styles.generateBtn, { backgroundColor: colorSet.accent }]}
                onPress={() => { setGenerated(false); handleGeneratePDF(); }}
              >
                <Ionicons name="refresh-outline" size={18} color={Colors.surface} />
                <Text style={styles.generateBtnText}>Generate Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              testID="generate-pdf-btn"
              style={[styles.generateBtn, { backgroundColor: colorSet.accent }]}
              onPress={handleGeneratePDF}
              disabled={generating}
              activeOpacity={0.8}
            >
              {generating ? (
                <ActivityIndicator color={Colors.surface} size="small" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color={Colors.surface} />
                  <Text style={styles.generateBtnText}>
                    {hasSelectedQuestions ? `Download PDF (${selectedIds.length} Qs)` : 'Download All Questions PDF'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.m, paddingHorizontal: Spacing.l,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: FontSizes.l, fontWeight: '700', color: Colors.surface },
  content: { padding: Spacing.l, paddingBottom: Spacing.xxxl },
  previewCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xl,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, marginBottom: Spacing.l,
  },
  pdfIconCircle: {
    width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.m,
  },
  previewTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  previewSubtitle: { fontSize: FontSizes.s, color: Colors.textSecondary, marginBottom: 2 },
  previewGujarati: { fontSize: FontSizes.xs, color: Colors.textLight, marginBottom: Spacing.m },
  selectedBadge: {
    flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.m, paddingVertical: Spacing.xs, marginBottom: Spacing.m,
  },
  selectedBadgeText: { fontSize: FontSizes.s, fontWeight: '600', marginLeft: Spacing.xs },
  previewInfoRow: { flexDirection: 'row', gap: Spacing.xl, marginBottom: Spacing.m },
  previewInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  previewInfoText: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  divider: { width: '100%', height: 1, backgroundColor: Colors.border, marginBottom: Spacing.m },
  sectionsList: { width: '100%' },
  sectionsTitle: { fontSize: FontSizes.s, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.s },
  sectionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs, gap: Spacing.xs },
  sectionItemText: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  hintBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.l, padding: Spacing.m, marginBottom: Spacing.l,
    borderLeftWidth: 3, borderLeftColor: Colors.info,
  },
  hintText: { fontSize: FontSizes.xs, color: Colors.info, marginLeft: Spacing.s, flex: 1 },
  generateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: BorderRadius.xl, paddingVertical: Spacing.l, gap: Spacing.s,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
  generateBtnText: { color: Colors.surface, fontSize: FontSizes.m, fontWeight: '700' },
  successBox: {
    alignItems: 'center', padding: Spacing.xl, backgroundColor: '#ECFDF5',
    borderRadius: BorderRadius.xl, marginBottom: Spacing.l,
  },
  successTitle: { fontSize: FontSizes.l, fontWeight: '700', color: Colors.success, marginTop: Spacing.m },
  successText: { fontSize: FontSizes.s, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xs, marginBottom: Spacing.l },
});
