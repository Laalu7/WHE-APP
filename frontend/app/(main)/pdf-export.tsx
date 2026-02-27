import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSizes, SubjectColors } from '../../constants/Theme';
import * as WebBrowser from 'expo-web-browser';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function PDFExportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    subjectCode: string;
    subjectName: string;
    subjectNameGu: string;
  }>();

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const colorSet = SubjectColors[params.subjectCode || 'JVN'] || SubjectColors.JVN;

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const pdfUrl = `${BACKEND_URL}/api/generate-pdf`;

      // Open PDF in browser for download
      if (Platform.OS === 'web') {
        const response = await fetch(pdfUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject_code: params.subjectCode,
            title: `${params.subjectCode} - ${params.subjectName}`,
          }),
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
        // For mobile, open in browser
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colorSet.accent }]}>
          <TouchableOpacity
            testID="back-btn-pdf"
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PDF Export</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* PDF Preview Card */}
          <View style={styles.previewCard}>
            <View style={[styles.pdfIconCircle, { backgroundColor: colorSet.bg }]}>
              <Ionicons name="document-text" size={48} color={colorSet.accent} />
            </View>
            <Text style={styles.previewTitle}>
              {params.subjectCode} Question Paper
            </Text>
            <Text style={styles.previewSubtitle}>{params.subjectName}</Text>
            <Text style={styles.previewGujarati}>{params.subjectNameGu}</Text>

            <View style={styles.previewInfoRow}>
              <View style={styles.previewInfoItem}>
                <Ionicons name="help-circle-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.previewInfoText}>40 Questions</Text>
              </View>
              <View style={styles.previewInfoItem}>
                <Ionicons name="layers-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.previewInfoText}>3 Sections</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.sectionsList}>
              <Text style={styles.sectionsTitle}>Included Sections:</Text>
              {['Mental Ability Test', 'Mathematical Test', 'Gujarati Test'].map((s, i) => (
                <View key={i} style={styles.sectionItem}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  <Text style={styles.sectionItemText}>
                    Section {i + 1}: {s}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Generate Button */}
          {generated ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
              <Text style={styles.successTitle}>PDF Generated!</Text>
              <Text style={styles.successText}>
                Your question paper has been downloaded successfully.
              </Text>
              <TouchableOpacity
                testID="generate-again-btn"
                style={[styles.generateBtn, { backgroundColor: colorSet.accent }]}
                onPress={() => {
                  setGenerated(false);
                  handleGeneratePDF();
                }}
              >
                <Ionicons name="refresh-outline" size={20} color={Colors.surface} />
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
                  <Ionicons name="download-outline" size={22} color={Colors.surface} />
                  <Text style={styles.generateBtnText}>Generate & Download PDF</Text>
                </>
              )}
            </TouchableOpacity>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.l,
    fontWeight: '700',
    color: Colors.surface,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: Spacing.xl,
  },
  pdfIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.l,
  },
  previewTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  previewSubtitle: {
    fontSize: FontSizes.s,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  previewGujarati: {
    fontSize: FontSizes.s,
    color: Colors.textLight,
    marginBottom: Spacing.l,
  },
  previewInfoRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.l,
  },
  previewInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  previewInfoText: {
    fontSize: FontSizes.s,
    color: Colors.textSecondary,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.l,
  },
  sectionsList: {
    width: '100%',
  },
  sectionsTitle: {
    fontSize: FontSizes.s,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.m,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s,
    gap: Spacing.s,
  },
  sectionItemText: {
    fontSize: FontSizes.s,
    color: Colors.textSecondary,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.l,
    gap: Spacing.s,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  generateBtnText: {
    color: Colors.surface,
    fontSize: FontSizes.l,
    fontWeight: '700',
  },
  successBox: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: '#ECFDF5',
    borderRadius: BorderRadius.xl,
  },
  successTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.success,
    marginTop: Spacing.m,
  },
  successText: {
    fontSize: FontSizes.s,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.s,
    marginBottom: Spacing.xl,
  },
});
