require('dotenv').config()
const argv = require('yargs').argv
const { Octokit } = require('@octokit/rest')
const github = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  baseUrl: process.env.GITHUB_API_URL
})

let { graphql } = require('@octokit/graphql')
graphql = graphql.defaults({
  baseUrl: process.env.GITHUB_API_URL,
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`
  }
})

if (argv.user) {
  getOrganizations().then(logOrgOwnershipNeeded)
} else {
  console.log('Invalid options passed\n')
  console.log('To use this script, you must specify a user: ')
  console.log('node index.js --user <username>\n')
}

async function getOrganizations () {
  let pagination = null
  const query =
    `query ($enterprise: String! $cursor: String) {
      enterprise(slug:$enterprise) {
        name
        organizations(first: 100 after:$cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            login
          }
        }
      }
    }`
  try {
    let hasNextPage = false
    do {
      const getOrgResult = await graphql({ query, enterprise: process.env.ENTERPRISE, cursor: pagination })
      hasNextPage = getOrgResult.enterprise.organizations.pageInfo.hasNextPage
      const orgsObj = getOrgResult.enterprise.organizations.nodes

      for (const org of orgsObj) {
        await removeUserFromOrg(org.login)
      }

      if (hasNextPage) {
        pagination = getOrgResult.enterprise.organizations.pageInfo.endCursor
      }
    } while (hasNextPage)
  } catch (error) {
    console.log('Request failed:', error.request)
    console.log(error.message)
  }
}

const orgOwnerNeeded = []
async function removeUserFromOrg (org) {
  try {
    await github.orgs.removeOutsideCollaborator({
      org,
      username: argv.user
    })
    console.log(`Successfully removed ${argv.user} from Org: ${org}`)
  } catch (error) {
    if (error.status === 403) {
      orgOwnerNeeded.push(org)
    } else if (error.status === 422) {
      await github.orgs.removeMembership({
        org,
        username: argv.user
      })
      console.log(`Successfully removed ${argv.user} from Org: ${org}`)
    } else {
      throw error
    }
  }
}

function logOrgOwnershipNeeded () {
  if (orgOwnerNeeded.length > 0) {
    console.log(`\n---\n\nFailed to remove as your token is not an owner of these orgs:\n
  ${orgOwnerNeeded.join('\n  ')}`)
  }
}
