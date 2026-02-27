import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSizes, SubjectColors } from '../../constants/Theme';

const { width } = Dimensions.get('window');
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface SubjectItem {
  id: string;
  code: string;
  name_gu: string;
  name_en: string;
  total_questions: number;
  has_questions: boolean;
}

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  JVN: 'school-outline',
  CET: 'clipboard-outline',
  PSE: 'book-outline',
  NMMS: 'cash-outline',
  GSSE: 'ribbon-outline',
  TST: 'bulb-outline',
};

export default function DashboardScreen() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/subjects`);
      const data = await res.json();
      setSubjects(data);
    } catch (e) {
      console.error('Failed to fetch subjects:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectPress = (subject: SubjectItem) => {
    router.push({
      pathname: '/(main)/subject',
      params: {
        id: subject.id,
        code: subject.code,
        name_gu: subject.name_gu,
        name_en: subject.name_en,
        total_questions: String(subject.total_questions),
        has_questions: String(subject.has_questions),
      },
    });
  };

  const handleLogout = () => {
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>નમસ્તે! 👋</Text>
            <Text style={styles.headerTitle}>WHE - Win Help Education</Text>
          </View>
          <TouchableOpacity
            testID="logout-btn"
            onPress={handleLogout}
            style={styles.logoutBtn}
          >
            <Ionicons name="log-out-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats Banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statsInner}>
            <View style={styles.statItem}>
              <Ionicons name="library-outline" size={22} color={Colors.surface} />
              <Text style={styles.statNumber}>6</Text>
              <Text style={styles.statLabel}>Subjects</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="help-circle-outline" size={22} color={Colors.surface} />
              <Text style={styles.statNumber}>૪૦</Text>
              <Text style={styles.statLabel}>Questions Each</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="layers-outline" size={22} color={Colors.surface} />
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Sections</Text>
            </View>
          </View>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>પરીક્ષા વિષયો (Exam Subjects)</Text>

        {/* Subjects Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        >
          {subjects.map((subject) => {
            const colorSet = SubjectColors[subject.code] || SubjectColors.JVN;
            return (
              <TouchableOpacity
                key={subject.id}
                testID={`subject-card-${subject.code.toLowerCase()}`}
                style={[styles.subjectCard, { backgroundColor: colorSet.bg }]}
                onPress={() => handleSubjectPress(subject)}
                activeOpacity={0.7}
              >
                <View style={[styles.cardIconCircle, { backgroundColor: colorSet.accent }]}>
                  <Ionicons
                    name={ICON_MAP[subject.code] || 'book-outline'}
                    size={28}
                    color={Colors.surface}
                  />
                </View>
                <Text style={[styles.cardCode, { color: colorSet.accent }]}>
                  {subject.code}
                </Text>
                <Text style={styles.cardName} numberOfLines={2}>
                  {subject.name_en}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={[styles.cardQuestions, { color: colorSet.accent }]}>
                    {subject.total_questions} Qs
                  </Text>
                  {subject.has_questions && (
                    <View style={[styles.activeBadge, { backgroundColor: Colors.success }]}>
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const cardWidth = (width - Spacing.xl * 2 - Spacing.l) / 2;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.l,
    paddingBottom: Spacing.m,
  },
  greeting: {
    fontSize: FontSizes.s,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statsBanner: {
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.m,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },
  statsInner: {
    flexDirection: 'row',
    paddingVertical: Spacing.l,
    paddingHorizontal: Spacing.l,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.surface,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    fontSize: FontSizes.l,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.m,
    marginBottom: Spacing.m,
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  subjectCard: {
    width: cardWidth,
    borderRadius: BorderRadius.xl,
    padding: Spacing.l,
    marginBottom: Spacing.l,
    marginRight: Spacing.l,
    minHeight: 170,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  cardCode: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  cardName: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: Spacing.s,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardQuestions: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  activeBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.s,
    paddingVertical: 2,
  },
  activeBadgeText: {
    fontSize: 10,
    color: Colors.surface,
    fontWeight: '600',
  },
});
