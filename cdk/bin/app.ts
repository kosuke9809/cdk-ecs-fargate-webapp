#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { IConfig } from '../config/interface';
import * as path from 'path';
import * as fs from 'fs';
import { EcsAppStack } from '../lib/stack/ecs-app-stack';

const app = new cdk.App();

// settings

type EnvContext = 'dev' | 'stg' | 'prd';

function loadConfig(deployEnv: EnvContext): IConfig {
  const configFile = path.join(__dirname, `../config/${deployEnv}.ts`);
  if (!fs.existsSync(configFile)) {
    throw new Error(`Can't find a ts environment file [../config/${deployEnv}.ts]`);
  }
  return require(configFile); // eslint-disable-line @typescript-eslint/no-require-imports
}

const argContext = 'environment';
const envKey = app.node.tryGetContext(argContext);

if (envKey == undefined) {
  throw new Error(
    `Please specify environment with context option. ex) cdk deploy -c ${argContext}=dev`,
  );
}

const config: IConfig = loadConfig(envKey);

// stasks
new EcsAppStack(app, 'EcsApp', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  vpcProps: config.Vpc,
});
