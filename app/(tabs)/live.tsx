import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LiveSessionWithVendor } from '@/types/database';
import LiveSessionCard from '@/components/LiveSessionCard';

/**
 * Live Shopping screen.
 * The DealRush backend API does not expose live shopping sessions yet,
 * so we show an empty state. When the API is available, fetch from the backend here.
 */
export default function LiveScreen() {
  const [liveSessions] = useState<LiveSessionWithVendor[]>([]);
  const [scheduledSessions] = useState<LiveSessionWithVendor[]>([]);
  const loading = false;

  const handleSessionPress = (sessionId: string) => {
    console.log('Session pressed:', sessionId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Shopping</Text>
        <Text style={styles.headerSubtitle}>Watch and shop in real-time</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {liveSessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Live Now</Text>
            {liveSessions.map((session) => (
              <LiveSessionCard
                key={session.id}
                session={session}
                onPress={() => handleSessionPress(session.id)}
              />
            ))}
          </View>
        )}

        {scheduledSessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {scheduledSessions.map((session) => (
              <LiveSessionCard
                key={session.id}
                session={session}
                onPress={() => handleSessionPress(session.id)}
              />
            ))}
          </View>
        )}

        {liveSessions.length === 0 && scheduledSessions.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No live sessions at the moment</Text>
            <Text style={styles.emptySubtext}>
              Check back later for exciting live shopping events
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});
