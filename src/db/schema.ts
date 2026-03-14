import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { time } from 'console'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 225 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 225 }).notNull(),
  firstname: varchar('firstname', { length: 50 }).notNull(),
  lastName: varchar('lastName', { length: 50 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const habits = pgTable('habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  frequency: varchar('frequency', { length: 20 }).notNull(),
  targetCount: integer('targetCount').default(1),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const entries = pgTable('entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  habitId: uuid('habitId')
    .references(() => habits.id, { onDelete: 'cascade' })
    .notNull(),
  completionDate: timestamp('completionDate').defaultNow().notNull(),
  note: text('note'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  color: varchar('color', { length: 7 }).default('#6b7280'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const habitTags = pgTable('habitTags', {
  id: uuid('id').primaryKey().defaultRandom(),
  habitId: uuid('habitId').references(() => habits.id, { onDelete: 'cascade' }),
  tagId: uuid('tagId')
    .references(() => tags.id, {
      onDelete: 'cascade',
    })
    .notNull(),
})

/**
 * Defines the relations for the `users` table.
 *
 * The `habits` property establishes a one-to-many relationship between users and habits,
 * indicating that each user can have multiple habits. The `many(habits)` function automatically
 * infers the foreign key from the `habits` table (`userId` referencing `users.id`), so explicit
 * field and reference definitions are not required for `many`. In contrast, for a `one` relation,
 * you typically need to specify the fields and references to clarify which columns are involved
 * in the relationship, as the direction and keys may not be as easily inferred.
 */
export const userRelations = relations(users, ({ many }) => ({
  habits: many(habits),
}))

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
  habitTags: many(habitTags),
  entries: many(entries),
}))

export const entrieRelations = relations(entries, ({ one }) => ({
  habits: one(habits, {
    fields: [entries.habitId],
    references: [habits.id],
  }),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  habitTags: many(habitTags),
}))

export const habitTagsRelations = relations(habitTags, ({ one }) => ({
  habits: one(habits, {
    fields: [habitTags.habitId],
    references: [habits.id],
  }),

  tags: one(tags, {
    fields: [habitTags.tagId],
    references: [tags.id],
  }),
}))

export type Users = typeof users.$inferSelect
export type Habit = typeof habits.$inferSelect
export type Entry = typeof entries.$inferSelect
export type Tag = typeof tags.$inferSelect
export type HabitTag = typeof habitTags.$inferSelect

export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)
