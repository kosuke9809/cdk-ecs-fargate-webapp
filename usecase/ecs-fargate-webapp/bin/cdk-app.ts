#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

import * as cdk from 'aws-cdk-lib';

import { IConfig } from '../config/interface';
import { ServiceStack } from '../lib/stack/service-stack';

const app = new cdk.App();

// settings

type EnvContext = 'dev' | 'stg' | 'prd';

function getEnv(config: IConfig) {
  if (config.Env.account && config.Env.account) {
    return {
      account: config.Env.account,
      region: config.Env.region,
    };
  } else {
    return {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    };
  }
}

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

const servicePrefix = `${config.Env.envName}-${config.Env.serviceName}`;

// stasks
new ServiceStack(app, 'EcsApp', {
  env: getEnv(config),
  envName: config.Env.envName,
  servicePrefix,
  removalConfig: config.RemovalConfig,
  vpcProps: config.Vpc,
  auroraProps: config.Aurora,
});
