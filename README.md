# Remove user from Enterprise Account

## Overview

This Node script will take in a given `user` login and revoke their membership to the organizations the Enterprise controls. If they are an outside collaborator, this will revoke their collaborator status. It leverages the [Octokit](https://github.com/octokit/rest.js) library and works on both GitHub.com and GitHub Enterprise Server.

## How to use

### Prerequisites

- A [Personal Access Token](https://help.github.com/articles/authorizing-a-personal-access-token-for-use-with-a-saml-single-sign-on-organization/) for an account that has access to administrate all Organizations within the Enterprise, as well as the Enterprise itself. The following scopes should be selected on the PAT:
  - admin:org (top level)
  - admin:enterprise (top level)

- A `.env` file with the following values:
  - GITHUB_TOKEN - The value of your Personal Access Token
  - GITHUB_API_URL - The URI of your GitHub Enterprise Server (GHES) install or the URI of the GitHub.com API
    - `https://YOUR_GHES_URI/api/v3`
    - `https://api.github.com`

- Run `npm install` in the directory where you cloned the script

### Example

```.sh
npm install
node index.js --user octokitten
```
