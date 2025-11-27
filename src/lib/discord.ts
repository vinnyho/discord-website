import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v10'

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!)

export async function addUserToGuild(
  userId: string,
  accessToken: string,
  guildId: string = process.env.DISCORD_GUILD_ID!,
  roleId: string = process.env.DISCORD_ROLE_ID!
) {
  try {
    // Add user to guild using their OAuth2 access token
    await rest.put(Routes.guildMember(guildId, userId), {
      body: {
        access_token: accessToken,
        roles: [roleId],
      },
    })

    return { success: true, message: 'User added to guild with role' }
  } catch (error: unknown) {
    // If user is already in guild, just add the role
    if (error && typeof error === 'object' && 'code' in error && error.code === 30001) {
      // User already in guild, add role
      await addRoleToUser(userId, guildId, roleId)
      return { success: true, message: 'Role added to existing member' }
    }
    console.error('Error adding user to guild:', error)
    throw error
  }
}

export async function addRoleToUser(
  userId: string,
  guildId: string = process.env.DISCORD_GUILD_ID!,
  roleId: string = process.env.DISCORD_ROLE_ID!
) {
  try {
    await rest.put(Routes.guildMemberRole(guildId, userId, roleId))
    return { success: true }
  } catch (error) {
    console.error('Error adding role to user:', error)
    throw error
  }
}

export async function removeRoleFromUser(
  userId: string,
  guildId: string = process.env.DISCORD_GUILD_ID!,
  roleId: string = process.env.DISCORD_ROLE_ID!
) {
  try {
    await rest.delete(Routes.guildMemberRole(guildId, userId, roleId))
    return { success: true }
  } catch (error) {
    console.error('Error removing role from user:', error)
    throw error
  }
}
