# aws-nodejs-lambda-executer
A project to execute your NodeJs lambda locally

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

