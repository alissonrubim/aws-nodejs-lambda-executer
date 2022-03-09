const { spawn } = require("child_process");
const path = require("path");
const dotenv = require('dotenv');
var fs = require('fs')

process.chdir(__dirname);

var workPath = path.join(__dirname, "./output");
const tempPath = path.join(__dirname, "./tmp");

// Execute a command on on the terminal
function executeCmd(command, args, onSuccess) {
  const cmd = spawn(command, args, {
    shell: true,
    detached: true,
    stdio: [process.stdin, process.stdout, process.stderr],
  });

  cmd.on("close", (code) => {
    if (code === 0) onSuccess();
  });
}

function executeInlineCmd(command, onSuccess) {
  executeCmd('cd . &&', command.split(' '), onSuccess);
}

/*------------------------------- // ----------------------------------*/
// Build the node file
function build(filePath, callback){
  console.log("Starting building...");
  var output = path.join(workPath, filePath.replace("../", "")).replace(".ts", ".js");
  
  executeCmd(
    "npx",
    [
      "--no-install",
      "esbuild",
      "--bundle",
      `"${filePath}"`,
      "--target=node14",
      "--platform=node",
      `--outfile="${output}"`,
      "--external:aws-sdk"
    ],
    () => {
      console.log("Build is finished!");
      callback?.(output);
    }
  );
}

// Run the node output file
async function run(filePath, fnName, event, context){
  console.log(`Running file ${filePath}, function ${fnName}...`);
  console.time('run')
  console.timeLog('run');
  var result = null;

  const lambda = require(`${filePath}`);
  try {
    var result = await lambda[fnName](event, context);
  } catch (error) {
    console.log(error)
  }

  console.log(`${filePath} output: `, result);
  console.timeEnd('run')
}

async function awsLogin(profile, callback) {
  console.info(`Logging in with ${profile}...`);
  executeInlineCmd(`unset AWS_ACCESS_KEY_ID
                    unset AWS_SECRET_ACCESS_KEY
                    unset AWS_SESSION_TOKEN  
                    unset AWS_DEFAULT_PROFILE
                    unset AWS_PROFILE
                    auth aws --no-proxy --profile=${profile}`,
    () => {
      console.log("You're now logged in at aws");
      callback?.();
    }
  );
}

/*------------------------------- // ----------------------------------*/
let injectFilePath = null;
process.argv.forEach((value) => {
  if(value.indexOf("--inject=") == 0){
    injectFilePath = value.replace("--inject=", "");
  }
})

if(!injectFilePath)
  throw new Error("You must define the injection file to run using `--inject` property");

if(!fs.existsSync(injectFilePath))
  throw new Error(`Injection file ${injectFilePath} not found`);

var injectFile = JSON.parse(fs.readFileSync(injectFilePath, 'utf-8')) 

if(!injectFile.functionHandlerPath)
  throw new Error(`You must define the functionHandlerPath`);

if(!fs.existsSync(injectFile.functionHandlerPath))
  throw new Error(`Function handler file ${injectFile.functionHandlerPath} not found`);

let handlerFunctionName = injectFile.functionHandlerName || 'main';

if(injectFile.env){
  let envContent = '';
  for (const [key, value] of Object.entries(injectFile.env)) {
    envContent += `${key}=${value}\n`;
  }

  fs.writeFileSync(".env.inject", envContent);

  dotenv.config({
    path: ".env.inject"
  })
}

// Create the temp folder (used on Lambdas)
if(fs.existsSync(tempPath))
  fs.rmSync(tempPath, { recursive:true });
fs.mkdirSync(tempPath, { recursive: true })

function buildAndRun(){
  build(injectFile.functionHandlerPath, async (output) => {
    if(handlerFunctionName)
      await run(output, handlerFunctionName, injectFile.event ?? {}, injectFile.context ?? {})
  });
}

if(injectFile.awsAuth){
  awsLogin(injectFile.awsAuth.profile, async () => {
    buildAndRun();
  })
}else{
  buildAndRun();
}