import { createFileRoute } from '@tanstack/react-router'

import { CategoryManagement } from '@/features/category-management'

export const Route = createFileRoute('/admin/categories/')({
  component: CategoryManagement,
})
