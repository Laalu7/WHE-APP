import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSizes, SubjectColors } from '../../constants/Theme';

const SECTIONS = [
  {
    id: 'mental',
    name_gu: 'માનસિક ક્ષમતા પરીક્ષા',
    name_en: 'Mental Ability Test',
    icon: 'bulb-outline' as const,
    description: 'Test your logical reasoning and problem-solving skills',
  },
  {
    id: 'math',
    name_gu: 'ગણિત પરીક્ષા',
    name_en: 'Mathematical Test',
    icon: 'calculator-outline' as const,
    description: 'Practice mathematics concepts and calculations',
  },
  {
    id: 'gujarati',
    name_gu: 'ગુજરાતી પરીક્ષા',
    name_en: 'Gujarati Test',
    icon: 'text-outline' as const,
    description: 'Improve your Gujarati language skills',
  },
];

export default function SubjectScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{
    id: string;
    code: string;
    name_gu: string;
    name_en: string;
    total_questions: string;
    has_questions: string;
  }>();

  const colorSet = SubjectColors[params.code || 'JVN'] || SubjectColors.JVN;
  const hasQuestions = params.has_questions === 'true';
  const isTablet = width >= 768;
  const contentMaxWidth = isTablet ? 600 : width;

  const handleStartPractice = () => {
    router.push({
      pathname: '/(main)/questions',
      params: {
        subjectCode: params.code,
        subjectName: params.name_en,
        subjectNameGu: params.name_gu,
      },
    });
  };

  const handlePDFExport = () => {
    router.push({
      pathname: '/(main)/pdf-export',
      params: {
        subjectCode: params.code,
        subjectName: params.name_en,
        subjectNameGu: params.name_gu,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.heroSection, { backgroundColor: colorSet.accent }]}>
          <TouchableOpacity testID="back-btn" onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.surface} />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <View style={styles.heroIconCircle}>
              <Ionicons
                name={(SubjectColors[params.code || 'JVN']?.icon || 'book-outline') as any}
                size={28}
                color={colorSet.accent}
              />
            </View>
            <Text style={styles.heroCode}>{params.code}</Text>
            <Text style={styles.heroNameEn}>{params.name_en}</Text>
            <Text style={styles.heroNameGu}>{params.name_gu}</Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatNumber}>{params.total_questions || '40'}</Text>
                <Text style={styles.heroStatLabel}>કુલ પ્રશ્નો</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatNumber}>3</Text>
                <Text style={styles.heroStatLabel}>વિભાગો</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sections */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>પરીક્ષાના વિભાગો (Exam Sections)</Text>

          {SECTIONS.map((section, index) => (
            <View key={section.id} testID={`section-card-${section.id}`} style={styles.sectionCard}>
              <View style={[styles.sectionIconCircle, { backgroundColor: colorSet.bg }]}>
                <Ionicons name={section.icon as any} size={22} color={colorSet.accent} />
              </View>
              <View style={styles.sectionInfo}>
                <Text style={styles.sectionNumber}>વિભાગ {index + 1}</Text>
                <Text style={styles.sectionNameGu}>{section.name_gu}</Text>
                <Text style={styles.sectionNameEn}>{section.name_en}</Text>
              </View>
            </View>
          ))}

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            {hasQuestions ? (
              <>
                <TouchableOpacity
                  testID="start-practice-btn"
                  style={[styles.primaryBtn, { backgroundColor: colorSet.accent }]}
                  onPress={handleStartPractice}
                  activeOpacity={0.8}
                >
                  <Ionicons name="play-circle-outline" size={22} color={Colors.surface} />
                  <Text style={styles.primaryBtnText}>Start Practice</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID="export-pdf-btn"
                  style={styles.secondaryBtn}
                  onPress={handlePDFExport}
                  activeOpacity={0.8}
                >
                  <Ionicons name="document-text-outline" size={22} color={colorSet.accent} />
                  <Text style={[styles.secondaryBtnText, { color: colorSet.accent }]}>
                    Export as PDF
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.comingSoonBox}>
                <Ionicons name="time-outline" size={32} color={Colors.textLight} />
                <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
                <Text style={styles.comingSoonText}>
                  Questions for {params.code} will be available soon.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  heroSection: {
    paddingTop: Spacing.l,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.l,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.m,
  },
  heroContent: { alignItems: 'center' },
  heroIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.s,
  },
  heroCode: { fontSize: 26, fontWeight: '800', color: Colors.surface, letterSpacing: 3 },
  heroNameEn: { fontSize: FontSizes.s, color: 'rgba(255,255,255,0.9)', marginTop: Spacing.xs, textAlign: 'center' },
  heroNameGu: { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2, textAlign: 'center' },
  heroStats: {
    flexDirection: 'row', alignItems: 'center', marginTop: Spacing.m,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.s, paddingHorizontal: Spacing.xl,
  },
  heroStatItem: { alignItems: 'center', flex: 1 },
  heroStatNumber: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.surface },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  heroStatDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: Spacing.l },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.l, paddingBottom: Spacing.xxxl },
  sectionTitle: { fontSize: FontSizes.m, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.m },
  sectionCard: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl, padding: Spacing.l, marginBottom: Spacing.m,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  sectionIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.m,
  },
  sectionInfo: { flex: 1 },
  sectionNumber: { fontSize: 10, fontWeight: '600', color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  sectionNameGu: { fontSize: FontSizes.m, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  sectionNameEn: { fontSize: FontSizes.s, color: Colors.textSecondary },
  actionSection: { marginTop: Spacing.l },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: BorderRadius.xl, paddingVertical: Spacing.l, marginBottom: Spacing.m,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
  primaryBtnText: { color: Colors.surface, fontSize: FontSizes.l, fontWeight: '700', marginLeft: Spacing.s },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: BorderRadius.xl, paddingVertical: Spacing.l,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
  },
  secondaryBtnText: { fontSize: FontSizes.m, fontWeight: '600', marginLeft: Spacing.s },
  comingSoonBox: {
    alignItems: 'center', padding: Spacing.xxl, backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed',
  },
  comingSoonTitle: { fontSize: FontSizes.l, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.m },
  comingSoonText: { fontSize: FontSizes.s, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.s },
});
