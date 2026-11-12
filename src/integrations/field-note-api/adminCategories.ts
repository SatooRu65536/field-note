import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  createCategory,
  reorderCategories,
  updateCategory,
} from '@/server/categories/categoryCommands'
import type { CategoryCommandResult } from '@/server/categories/categoryCommands'
import { createDatabase } from '@/server/lib/db/client'

import { adminMiddleware } from './adminMiddleware'

export type { CategoryCommandResult }

// カテゴリの名前の上限文字数
export const MAX_CATEGORY_NAME_LENGTH = 30

const CATEGORY_FIELDS_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, '名前を入力してください')
    .max(MAX_CATEGORY_NAME_LENGTH, `名前は ${MAX_CATEGORY_NAME_LENGTH} 文字以内で入力してください`),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, '色が不正です'),
})

export const createAdminCategory = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(CATEGORY_FIELDS_SCHEMA)
  .handler(async ({ data }) => createCategory({ db: createDatabase(), ...data }))

export const updateAdminCategory = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(CATEGORY_FIELDS_SCHEMA.extend({ categoryId: z.string().min(1) }))
  .handler(async ({ data }) => updateCategory({ db: createDatabase(), ...data }))

export const reorderAdminCategories = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(z.object({ categoryIds: z.array(z.string().min(1)).max(100) }))
  .handler(async ({ data }) =>
    reorderCategories({ db: createDatabase(), categoryIds: data.categoryIds }),
  )
