import dbConnect from '../db/dbConnect'
import { User, UserRole } from '../db/models/UserModel'

async function makeAllUsersAdmin() {
  try {
    console.log('Connecting to database...')
    await dbConnect()
    
    console.log('Updating all users to ADMIN role...')
    const result = await User.updateMany(
      {}, // match all users
      { $set: { role: UserRole.ADMIN } }
    )
    
    console.log(`✅ Successfully updated ${result.modifiedCount} user(s) to ADMIN role`)
    console.log(`   Matched: ${result.matchedCount} user(s)`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error updating users:', error)
    process.exit(1)
  }
}

makeAllUsersAdmin()

