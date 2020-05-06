require('dotenv').config()
const argv = require('yargs').argv
const { Octokit } = require('@octokit/rest')
const github = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  baseUrl: process.env.GITHUB_API_URL,
  headers:
   {
     accept: 'application/vnd.github.v3+json',
     'user-agent':
      'octokit.js/0.0.0-development Node.js/10.15.0 (macOS Mojave x64)'
   }
})

let { graphql } = require('@octokit/graphql')
graphql = graphql.defaults({
  baseUrl: process.env.GITHUB_API_URL,
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`
  }
})

getOrganizations()

async function getOrganizations () {
  const query = {
    query: `query ($enterprise: String!) {
      enterprise(slug:$enterprise) {
        name
        organizations(first: 100) {
          nodes {
            login
          }
        }
      }
    }`,
    enterprise: process.env.ENTERPRISE
  }
  try {
    const getOrgResult = await graphql(query)
    const orgsObj = getOrgResult.enterprise.organizations.nodes

    orgsObj.forEach((org) => {
      console.log(`Starting on Org: ${org.login}`)
      removeUserFromOrg(org.login)
    })
  } catch (error) {
    console.log('Request failed:', error.request)
    console.log(error.message)
  }
}

async function removeUserFromOrg (org) {
  try {
    console.log(`Trying to remove outside collaborator: ${argv.user} on Org: ${org}`)
    await github.orgs.removeOutsideCollaborator({
      org,
      username: argv.user
    })
  } catch (error) {
    if (error.status !== 422) {
      throw error
    }

    console.log(`Trying to remove member: ${argv.user} on Org: ${org}`)
    await github.orgs.removeMembership({
      org,
      username: argv.user
    })
  }
}
