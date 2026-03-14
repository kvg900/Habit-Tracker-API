import { db } from './connection.ts'
import { users, habits, entries, tags, habitTags } from './schema.ts'

console.log('Demo user seeding')
const seed = async () => {
  console.log('Seeding started....')
  try {
    console.log('Clearing the db...')
    await db.delete(entries)
    await db.delete(habitTags)
    await db.delete(habits)
    await db.delete(tags)
    await db.delete(users)

    console.log('creating demo users...')
    const [demoUser] = await db
      .insert(users)
      .values({
        email: 'demo@app.com',
        password: 'password',
        firstname: 'demo',
        lastName: 'person',
        username: 'demo',
      })
      .returning()

    console.log('Creating tags...')
    const [healthTag] = await db
      .insert(tags)
      .values({ name: 'health', color: '#f0f0f0' })
      .returning()

    console.log('Creating demo habits...')
    const [exerciseHabit] = await db
      .insert(habits)
      .values({
        userId: demoUser.id,
        name: 'Exercise',
        description: 'Daily workout routine',
        frequency: 'daily',
        targetCount: 1,
      })
      .returning()

    // Step 5: Create many-to-many relationships
    await db
      .insert(habitTags)
      .values([{ habitId: exerciseHabit.id, tagId: healthTag.id }])

    // Step 6: Create historical completion data
    console.log('Adding completion entries...')
    const today = new Date()
    today.setHours(12, 0, 0, 0)

    // Exercise habit - completions for past 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      await db.insert(entries).values({
        habitId: exerciseHabit.id,
        completionDate: date,
        note: i === 0 ? 'Great workout today!' : null,
      })
    }
    console.log('DB seeded successfully')
    console.log(`Demo user credentials: ${demoUser}`)
  } catch (e) {
    console.log('DB seeding failed')
    process.exit(1)
  }
}

// if (import.meta.url === `file://${process.argv[1]}`) {
//   seed()
//     .then(() => process.exit(0))
//     .catch((e) => process.exit(1))
// }

// export default seed
seed()
