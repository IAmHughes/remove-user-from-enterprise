require('dotenv').config()
// const { github } = require('@octokit/rest')({
//   auth: `token ${process.env.GITHUB_TOKEN}`,
//   previews: [
//     'hellcat-preview'
//   ],
//   // Set this to GHES url or will default to dotcom
//   baseUrl: process.env.GITHUB_API_URL
// })
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
    console.log(getOrgResult.enterprise.organizations.nodes[0].login)
    const orgsObj = getOrgResult.enterprise.organizations.nodes

    orgsObj.forEach((org) => {
      console.log(org.login)
    })
  } catch (error) {
    console.log('Request failed:', error.request)
    console.log(error.message)
  }
}
