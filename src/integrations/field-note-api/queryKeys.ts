export const QUERY_KEYS = {
  categories: ['categories'],
  adminStatus: ['adminStatus'],
  publicRecords: ['records', 'public'],
  adminRecords: ['records', 'admin'],
  // 記録の保存で変わるため，adminRecords の下に置いて一緒に無効化する
  nameCandidates: ['records', 'admin', 'nameCandidates'],
  tagCandidates: ['records', 'admin', 'tagCandidates'],
} as const
