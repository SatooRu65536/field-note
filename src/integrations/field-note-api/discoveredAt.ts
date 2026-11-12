import { formatDate } from '@/integrations/intl/formatDate'

/**
 * 記録の発見日を表示用に変換する
 * @param discoveredAt 発見日．まだ発見していない記録は null
 * @returns 日本時間の「年/月/日」．まだ発見していない記録は「未発見」
 */
export function formatDiscoveredAt(discoveredAt: Date | null): string {
  return discoveredAt ? formatDate(discoveredAt) : '未発見'
}
