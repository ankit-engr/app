import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Tv, Users, Clock } from 'lucide-react-native';
import { LiveSessionWithVendor } from '@/types/database';

interface LiveSessionCardProps {
  session: LiveSessionWithVendor;
  onPress: () => void;
}

export default function LiveSessionCard({ session, onPress }: LiveSessionCardProps) {
  const isLive = session.status === 'live';
  const isScheduled = session.status === 'scheduled';

  const getScheduledTime = () => {
    const date = new Date(session.scheduled_at);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: session.thumbnail_url || 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600' }}
        style={styles.image}
      />

      {isLive && (
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      )}

      {isScheduled && (
        <View style={styles.scheduledBadge}>
          <Clock size={14} color="#FFFFFF" />
          <Text style={styles.scheduledText}>Scheduled</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.vendorRow}>
          {session.vendors.logo_url && (
            <Image
              source={{ uri: session.vendors.logo_url }}
              style={styles.vendorLogo}
            />
          )}
          <Text style={styles.vendorName}>{session.vendors.name}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {session.title}
        </Text>

        {session.description && (
          <Text style={styles.description} numberOfLines={2}>
            {session.description}
          </Text>
        )}

        <View style={styles.footer}>
          {isLive && (
            <View style={styles.viewersRow}>
              <Users size={16} color="#DC2626" />
              <Text style={styles.viewersText}>
                {session.viewers_count.toLocaleString()} watching
              </Text>
            </View>
          )}
          {isScheduled && (
            <View style={styles.timeRow}>
              <Tv size={16} color="#6B7280" />
              <Text style={styles.timeText}>{getScheduledTime()}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scheduledBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B7280',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  scheduledText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  content: {
    padding: 16,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vendorLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  viewersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginLeft: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
});
