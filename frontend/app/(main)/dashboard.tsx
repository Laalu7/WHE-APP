import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSizes, SubjectColors } from '../../constants/Theme';

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
  const { width } = useWindowDimensions();
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  const padding = Spacing.l;
  const gap = Spacing.m;
  const numColumns = 2;
  const cardWidth = (width - padding * 2 - gap * (numColumns - 1)) / numColumns;

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

  const renderSubjectCard = ({ item, index }: { item: SubjectItem; index: number }) => {
    const colorSet = SubjectColors[item.code] || SubjectColors.JVN;
    const isLeft = index % 2 === 0;

    return (
      <TouchableOpacity
        testID={`subject-card-${item.code.toLowerCase()}`}
        style={[
          styles.subjectCard,
          {
            width: cardWidth,
            backgroundColor: colorSet.bg,
            marginRight: isLeft ? gap : 0,
          },
        ]}
        onPress={() => handleSubjectPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.cardIconCircle, { backgroundColor: colorSet.accent }]}>
          <Ionicons
            name={ICON_MAP[item.code] || 'book-outline'}
            size={26}
            color={Colors.surface}
          />
        </View>
        <Text style={[styles.cardCode, { color: colorSet.accent }]}>{item.code}</Text>
        <Text style={styles.cardName} numberOfLines={2}>{item.name_en}</Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.cardQuestions, { color: colorSet.accent }]}>
            {item.total_questions} Qs
          </Text>
          {item.has_questions && (
            <View style={[styles.activeBadge, { backgroundColor: Colors.success }]}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: padding }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>નમસ્તે! 👋</Text>
            <Text style={styles.headerTitle}>WHE - Win Help Education</Text>
          </View>
          <TouchableOpacity testID="logout-btn" onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats Banner */}
        <View style={[styles.statsBanner, { marginHorizontal: padding }]}>
          <View style={styles.statItem}>
            <Ionicons name="library-outline" size={20} color={Colors.surface} />
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>Subjects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="help-circle-outline" size={20} color={Colors.surface} />
            <Text style={styles.statNumber}>૪૦</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="layers-outline" size={20} color={Colors.surface} />
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Sections</Text>
          </View>
        </View>

        {/* Section Title */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: padding }]}>
          પરીક્ષા વિષયો (Exam Subjects)
        </Text>

        {/* 2x2 Grid */}
        <FlatList
          data={subjects}
          renderItem={renderSubjectCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[styles.gridContainer, { paddingHorizontal: padding }]}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
        />
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
    paddingTop: Spacing.m,
    paddingBottom: Spacing.s,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: FontSizes.l,
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
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.m,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: Spacing.m,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.surface,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    fontSize: FontSizes.m,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.m,
  },
  gridContainer: {
    paddingBottom: Spacing.xxl,
  },
  row: {
    marginBottom: Spacing.m,
  },
  subjectCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.l,
    minHeight: 155,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  cardCode: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardName: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
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
    fontSize: 9,
    color: Colors.surface,
    fontWeight: '600',
  },
});
