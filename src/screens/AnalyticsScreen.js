import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReviews } from '../context/ReviewsContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import {
  SOURCES,
  buildRatingTrend,
  buildResponseStats,
  buildSourceBreakdown,
  buildVolumeBySource,
  formatReplySpeed,
} from '../utils/analytics';

export function AnalyticsScreen() {
  const { reviews, business } = useReviews();
  const styles = useThemedStyles(createStyles);
  const [granularity, setGranularity] = useState('week');

  const ratingTrend = useMemo(
    () => buildRatingTrend(reviews, granularity),
    [reviews, granularity]
  );
  const volume = useMemo(
    () => buildVolumeBySource(reviews, granularity),
    [reviews, granularity]
  );
  const sources = useMemo(() => buildSourceBreakdown(reviews), [reviews]);
  const response = useMemo(() => buildResponseStats(reviews), [reviews]);

  const periodLabel = granularity === 'week' ? 'week' : 'month';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              {(business?.name ?? 'Your business').toUpperCase()}
            </Text>
            <Text style={styles.title}>Analytics</Text>
          </View>

          <View style={styles.toggle}>
            {['week', 'month'].map((g) => {
              const active = granularity === g;
              return (
                <Pressable
                  key={g}
                  onPress={() => setGranularity(g)}
                  style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      active && styles.toggleTextActive,
                    ]}
                  >
                    {g === 'week' ? 'Weekly' : 'Monthly'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Response rate & speed</Text>
          <Text style={styles.sectionHint}>
            Local SEO and customer trust track reply coverage more than raw stars
            alone.
          </Text>
          <View style={styles.kpiRow}>
            <View style={styles.kpi}>
              <Text style={styles.kpiValue}>
                {Math.round(response.responseRate)}%
              </Text>
              <Text style={styles.kpiLabel}>Response rate</Text>
              <Text style={styles.kpiMeta}>
                {response.repliedCount} of {response.total} replied
              </Text>
            </View>
            <View style={styles.kpi}>
              <Text style={styles.kpiValue}>
                {formatReplySpeed(response.avgReplyHours)}
              </Text>
              <Text style={styles.kpiLabel}>Avg time to reply</Text>
              <Text style={styles.kpiMeta}>
                {response.unrepliedCount} still waiting
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rating trend</Text>
          <Text style={styles.sectionHint}>
            Average star rating by {periodLabel}
          </Text>
          <RatingTrendChart data={ratingTrend} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Review volume</Text>
          <Text style={styles.sectionHint}>
            New reviews per {periodLabel}, by source
          </Text>
          <SourceLegend />
          <VolumeChart data={volume} />
        </View>

        <View style={[styles.section, styles.sectionLast]}>
          <Text style={styles.sectionTitle}>Source breakdown</Text>
          <Text style={styles.sectionHint}>
            Where reviews are coming from — useful for knowing where to focus
          </Text>
          <SourceBreakdown bars={sources} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SourceLegend() {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.legend}>
      {SOURCES.map((s) => (
        <View key={s.key} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: s.color }]} />
          <Text style={styles.legendText}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

// Pure View line chart — no react-native-svg dependency.
function RatingTrendChart({ data }) {
  const styles = useThemedStyles(createStyles);
  const [width, setWidth] = useState(0);
  const height = 160;
  const padX = 10;
  const padY = 14;
  const latest = [...data].reverse().find((d) => d.average != null);

  const points = useMemo(() => {
    if (!width || data.length === 0) return [];
    const innerW = Math.max(width - padX * 2, 1);
    const innerH = height - padY * 2;
    return data.map((d, i) => {
      const x =
        data.length === 1 ? width / 2 : padX + (i / (data.length - 1)) * innerW;
      const y =
        d.average == null
          ? null
          : padY + ((5 - d.average) / 4) * innerH;
      return { ...d, x, y };
    });
  }, [data, width]);

  const segments = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    if (a.y == null || b.y == null) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    segments.push({
      key: `${a.key}-${b.key}`,
      // Center the segment on the midpoint so RN's default
      // transform-origin (center) keeps the endpoints aligned.
      left: (a.x + b.x) / 2 - length / 2,
      top: (a.y + b.y) / 2 - 1.25,
      length,
      angle,
    });
  }

  return (
    <View
      style={styles.chartCard}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width - 32)}
    >
      <View style={styles.chartHeader}>
        <Text style={styles.chartStat}>
          {latest ? latest.average.toFixed(2) : '—'}
        </Text>
        <Text style={styles.chartStatLabel}>latest avg</Text>
      </View>

      <View style={[styles.lineChart, { height }]}>
        {[5, 4, 3, 2, 1].map((tick) => {
          const top = padY + ((5 - tick) / 4) * (height - padY * 2);
          return (
            <View
              key={tick}
              style={[styles.gridLine, { top }]}
              pointerEvents="none"
            />
          );
        })}

        {segments.map((s) => (
          <View
            key={s.key}
            style={[
              styles.lineSegment,
              {
                left: s.left,
                top: s.top,
                width: s.length,
                transform: [{ rotate: `${s.angle}deg` }],
              },
            ]}
          />
        ))}

        {points.map((p) =>
          p.y == null ? null : (
            <View
              key={p.key}
              style={[
                styles.lineDot,
                { left: p.x - 4, top: p.y - 4 },
              ]}
            />
          )
        )}
      </View>

      <View style={styles.axisLabels}>
        {data.map((d, i) => {
          const show =
            i === 0 ||
            i === data.length - 1 ||
            i === Math.floor(data.length / 2);
          return (
            <Text
              key={d.key}
              style={[styles.axisLabel, !show && styles.axisLabelHidden]}
            >
              {show ? d.label : ' '}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

function VolumeChart({ data }) {
  const styles = useThemedStyles(createStyles);
  const max = Math.max(1, ...data.map((d) => d.total));
  const trackHeight = 140;

  return (
    <View style={styles.chartCard}>
      <View style={styles.barRow}>
        {data.map((d) => {
          const stackHeight = d.total ? (d.total / max) * trackHeight : 0;
          return (
            <View key={d.key} style={styles.barCol}>
              <View style={[styles.barTrack, { height: trackHeight }]}>
                <View style={[styles.barStack, { height: stackHeight }]}>
                  {SOURCES.map((s) => {
                    const count = d[s.key] || 0;
                    if (!count || !d.total) return null;
                    return (
                      <View
                        key={s.key}
                        style={{
                          height: (count / d.total) * stackHeight,
                          backgroundColor: s.color,
                        }}
                      />
                    );
                  })}
                </View>
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>
                {d.label}
              </Text>
              <Text style={styles.barCount}>{d.total || ''}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function SourceBreakdown({ bars }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.chartCard}>
      {bars.map((b) => (
        <View key={b.key} style={styles.breakdownRow}>
          <View style={styles.breakdownMeta}>
            <View style={[styles.legendDot, { backgroundColor: b.color }]} />
            <Text style={styles.breakdownLabel}>{b.label}</Text>
            <Text style={styles.breakdownCount}>
              {b.count} · {b.percent}%
            </Text>
          </View>
          <View style={styles.breakdownTrack}>
            <View
              style={[
                styles.breakdownFill,
                {
                  width: `${b.percent}%`,
                  backgroundColor: b.color,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function createStyles(colors, fonts) {
  return {
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 1080,
    alignSelf: 'center',
    paddingHorizontal: 40,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 24,
    marginBottom: 28,
    flexWrap: 'wrap',
  },
  eyebrow: {
    color: colors.textDim,
    fontSize: 12,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 44,
    fontFamily: fonts.display,
    letterSpacing: -1,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9,
  },
  toggleBtnActive: {
    backgroundColor: colors.pillActiveBg,
  },
  toggleText: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.sansSemiBold,
  },
  toggleTextActive: {
    color: colors.pillActiveText,
  },
  section: {
    marginBottom: 36,
  },
  sectionLast: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontFamily: fonts.sansSemiBold,
    marginBottom: 6,
  },
  sectionHint: {
    color: colors.textDim,
    fontSize: 14,
    fontFamily: fonts.sans,
    marginBottom: 16,
    lineHeight: 20,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  kpi: {
    flexGrow: 1,
    flexBasis: 220,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kpiValue: {
    color: colors.text,
    fontSize: 36,
    fontFamily: fonts.sansBold,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  kpiLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    marginBottom: 8,
  },
  kpiMeta: {
    color: colors.textDim,
    fontSize: 13,
    fontFamily: fonts.sans,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  chartStat: {
    color: colors.text,
    fontSize: 24,
    fontFamily: fonts.sansBold,
  },
  chartStatLabel: {
    color: colors.textDim,
    fontSize: 12,
    fontFamily: fonts.sansSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  lineChart: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.hairline,
  },
  lineSegment: {
    position: 'absolute',
    height: 2.5,
    backgroundColor: colors.accent,
  },
  lineDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  axisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  axisLabel: {
    color: colors.textDim,
    fontSize: 11,
    fontFamily: fonts.sans,
  },
  axisLabelHidden: {
    opacity: 0,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.sansMedium,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingTop: 8,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barStack: {
    width: '100%',
    justifyContent: 'flex-end',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontFamily: fonts.sans,
    marginTop: 8,
    textAlign: 'center',
  },
  barCount: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.sansSemiBold,
    marginTop: 2,
    minHeight: 14,
  },
  breakdownRow: {
    marginBottom: 16,
  },
  breakdownMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  breakdownLabel: {
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    flex: 1,
  },
  breakdownCount: {
    color: colors.textDim,
    fontSize: 13,
    fontFamily: fonts.sansMedium,
  },
  breakdownTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 4,
  },
  };
}
