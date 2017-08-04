# Serverless Alexa Skill For Home Assistant

Use Serverless framework to implement AWS Lambda function for AWS Alexa Custom Skill.

# Guide

1. Follow guide: https://serverless.com/ to install serverless on your machine and setup the project with the files from this repo.
2. Install mqtt client using npm: **npm install mqtt**
3. Create a secret.js to contains the mqtt brokers details using template secret-sample.js.
4. Use serverless to deploy: **sls deploy**


# Credits
- Serverless AWS Node Alexa Skill Example: https://github.com/serverless/examples/tree/master/aws-node-alexa-skill 
- Good guide: https://github.com/sbstjn/serverless-alexa-skill
