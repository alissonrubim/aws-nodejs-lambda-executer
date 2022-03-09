# aws-nodejs-lambda-executer
A project to execute your NodeJs lambda locally.


## How it works
I use ts-node to build the lambda code and execute it. I also simulate the enviroment with a .tmp folder that you can use to store/manipulate files during execution.

To execute a lambda, you create a configuration file called Injetor. This file will contain informations to run the lambda.

## Configuration

"functionHandlerPath": "../myproject/lambda/handlers/mySimpleLambda.ts",
"functionHandlerName": "main",
"awsAuth": {
  "profile": "dev-profile"
},
"env": {
  "DEBUG": true,
  "AWS_REGION": "eu-west-1",
  "AWS_PROFILE": "dev-profile",
  "myDynamoTableName": "simple-test-dynamo-table",
  "stage": "dev",
  "authToken": "any-token"
},
"event": {
  
}


## Execute a lambda
```node run-local --inject=./payloads/example01-simple-lambda.json```

