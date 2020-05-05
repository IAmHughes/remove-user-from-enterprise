require('dotenv').config()
const github = require('@octokit/rest')({
  auth: `token ${process.env.GITHUB_TOKEN}`,
  previews: [
    'hellcat-preview'
  ],
  // Set this to GHES url or will default to dotcom
  baseUrl: process.env.GITHUB_API_URL
})
const { graphql } = require('@octokit/graphql')
const graphqlWithAuth = graphql.defaults({
  baseUrl: process.env.GITHUB_API_URL,
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`
  }
})

const organizations

async function getOrgsFromEnterprise () {
  const { organizations } = await graphqlWithAuth(
    `query ($enterprise: String!) {
      enterprise(slug: $enterprise) {
        name
        organizations(first: 100) {
          nodes {
            login
          }
        }
      }
    }`,
    enterprise: `${process.env.Enterprise}`
  )}
