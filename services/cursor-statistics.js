const axios = require('axios')

const CURSOR_API_URL = 'https://www.cursor.com/api/dashboard/get-team-usage'
const CURSOR_TEAM_URL = 'https://www.cursor.com/api/dashboard/team'
const CURSOR_SESSION_TOKEN =
  'WorkosCursorSessionToken=user_01JPH02EKE530VNZEZ0YZ59502%3A%3AeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnb29nbGUtb2F1dGgyfHVzZXJfMDFKUEgwMkVLRTUzMFZOWkVaMFlaNTk1MDIiLCJ0aW1lIjoiMTc0Mjk4MDA4OSIsInJhbmRvbW5lc3MiOiI4NTNiY2U4OC1hZjA5LTRiN2MiLCJleHAiOjQzMzQ5ODAwODksImlzcyI6Imh0dHBzOi8vYXV0aGVudGljYXRpb24uY3Vyc29yLnNoIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBvZmZsaW5lX2FjY2VzcyIsImF1ZCI6Imh0dHBzOi8vY3Vyc29yLmNvbSJ9.1XJc1aKIZ63SM2CKxNjN0DRAs0tJBjvm2eTzg2iud48'

/**
 * Get team usage statistics from Cursor API
 * @returns {Promise<Object>} The response data from Cursor API
 * @throws {Error} If the request fails
 */
async function getTeamUsage() {
  try {
    const response = await axios.post(
      CURSOR_API_URL,
      { teamId: 8047257 },
      {
        headers: {
          Cookie: CURSOR_SESSION_TOKEN,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data.teamMemberUsage
  } catch (error) {
    console.error('Error fetching Cursor team usage:', error.message)
    if (error.response) {
      console.error('Error response status:', error.response.status)
      console.error('Error response data:', error.response.data)
    }
    throw error
  }
}

/**
 * Get team members from Cursor API
 * @returns {Promise<Array>} Array of team members with structure:
 * {
 *   name: string,
 *   email: string,
 *   id: number,
 *   role: string
 * }
 * @throws {Error} If the request fails
 */
async function getTeam() {
  try {
    const response = await axios.post(
      CURSOR_TEAM_URL,
      { teamId: 8047257 },
      {
        headers: {
          Cookie: CURSOR_SESSION_TOKEN,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data.teamMembers
  } catch (error) {
    console.error('Error fetching Cursor team members:', error.message)
    if (error.response) {
      console.error('Error response status:', error.response.status)
      console.error('Error response data:', error.response.data)
    }
    throw error
  }
}

/**
 * Get combined statistics of team members and their usage
 * @returns {Promise<Array>} Array of combined statistics with structure:
 * {
 *   name: string,
 *   email: string,
 *   role: string,
 *   modelType: string,
 *   numRequests: number,
 *   numTokens: number,
 *   maxRequestUsage: number,
 *   lastUsage: string,
 *   copilotUsage: number,
 *   docsCount: number,
 *   copilotAcceptedUsage: number
 * }
 * @throws {Error} If the request fails
 */
async function getStatistics() {
  try {
    // Get both team and usage data
    const [teamData, usageData] = await Promise.all([getTeam(), getTeamUsage()])

    // Create a map of usage data by user ID
    const usageMap = new Map()
    usageData.forEach((usage) => {
      if (usage.usageData && usage.usageData.length > 0) {
        usageMap.set(usage.id, usage.usageData[0])
      }
    })

    // Combine team and usage data
    const statistics = teamData.map((member) => {
      const usage = usageMap.get(member.id) || {
        modelType: 'gpt-4',
        numRequests: 0,
        numTokens: 0,
        maxRequestUsage: 500,
        lastUsage: 'N/A',
        copilotUsage: 0,
        docsCount: 0,
        copilotAcceptedUsage: 0,
      }
      let name = member.name
      let email = member.email
      name = name ? name.trim() : ''
      email = email ? email.trim() : ''

      if (!name) {
        name = email.replace('@starixsoft.com', '')
      }
      
      return {
        name: name,
        email: member.email,
        role: member.role.replace('TEAM_ROLE_', ''),
        ...usage,
      }
    })

    return statistics
  } catch (error) {
    throw error
  }
}

module.exports = {
  getTeamUsage,
  getTeam,
  getStatistics,
}
