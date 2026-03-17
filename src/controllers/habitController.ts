import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { db } from '../db/connection.ts'
import { habits, habitTags, entries, tags } from '../db/schema.ts'
import { eq, and, desc, inArray } from 'drizzle-orm'

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, frequency, targetCount, tagIds } = req.body
  const userId = req.user!.id

  //Starting a transaction for creating a habit and at the same time creating a many to many relation in the habitTags table
  const result = await db.transaction(async (tx) => {
    try {
      const [newHabit] = await tx
        .insert(habits)
        .values({
          userId,
          name,
          description,
          frequency,
          targetCount,
        })
        .returning()
      //If tags are provided, create the association
      if (tagIds && tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId: string) => ({
          habitId: newHabit.id,
          tagId,
        }))
        await tx.insert(habitTags).values(habitTagValues)
      }

      return newHabit
    } catch (e) {
      console.error('Create habit error:', e)
      res.status(500).json({ error: 'Failed to create habit' })
    }
  })
}

export const getUserHabits = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user!.id
    //query habits with ther tags using relations
    const userHabitsWithTags = await db.query.habits.findMany({
      where: eq(habits.userId, userId),
      with: {
        habitTags: {
          with: {
            tags: true,
          },
        },
      },
      orderBy: [desc(habits.createdAt)],
    })

    //Transforming the data to include tags directly
    const habitWithTags = userHabitsWithTags.map((habit) => ({
      ...habit,
      tags: habit.habitTags.map((ht) => ht.tags),
      habitTags: undefined,
    }))

    res.json({ habits: habitWithTags })
  } catch (e) {
    console.log('Get habits error:', e)
    res.status(500).json({ error: 'Failed to fetch habits' })
  }
}

export const getHabitById = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, id), eq(habits.userId, userId)),
      with: {
        habitTags: {
          with: {
            tags: true,
          },
        },
        entries: {
          orderBy: [desc(entries.completionDate)],
          limit: 10, // Recent entries only
        },
      },
    })

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    // Transform the data
    const habitWithTags = {
      ...habit,
      tags: habit.habitTags.map((ht) => ht.tags),
      habitTags: undefined,
    }

    res.json({
      habit: habitWithTags,
    })
  } catch (error) {
    console.error('Get habit error:', error)
    res.status(500).json({ error: 'Failed to fetch habit' })
  }
}

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const { tagIds, ...updates } = req.body

    const result = await db.transaction(async (tx) => {
      // Update the habit
      const [updatedHabit] = await tx
        .update(habits)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(habits.id, id), eq(habits.userId, userId)))
        .returning()

      if (!updatedHabit) {
        throw new Error('Habit not found')
      }

      // If tagIds are provided, update the associations
      if (tagIds !== undefined) {
        // Remove existing tags
        await tx.delete(habitTags).where(eq(habitTags.habitId, id))

        // Add new tags
        if (tagIds.length > 0) {
          const habitTagValues = tagIds.map((tagId: string) => ({
            habitId: id,
            tagId,
          }))
          await tx.insert(habitTags).values(habitTagValues)
        }
      }

      return updatedHabit
    })

    res.json({
      message: 'Habit updated successfully',
      habit: result,
    })
  } catch (error: any) {
    if (error.message === 'Habit not found') {
      return res.status(404).json({ error: 'Habit not found' })
    }
    console.error('Update habit error:', error)
    res.status(500).json({ error: 'Failed to update habit' })
  }
}

export const deleteHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const [deletedHabit] = await db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning()

    if (!deletedHabit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    res.json({
      message: 'Habit deleted successfully',
    })
  } catch (error) {
    console.error('Delete habit error:', error)
    res.status(500).json({ error: 'Failed to delete habit' })
  }
}
