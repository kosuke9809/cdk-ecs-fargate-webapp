import * as cdk from 'aws-cdk-lib';

export interface IEnv {
  envName: string;
  serviceName: string;
  account?: string;
  region?: string;
}

export interface IRemovalPolicy {
  removalPolicy: cdk.RemovalPolicy;
  autoDeleteObjects?: boolean;
  emptyOnDelete?: boolean;
}

export interface IVpcConfig {
  maxAzs: number;
  natGateways: number;
}

export interface IConfig {
  Env: IEnv;
  Vpc: IVpcConfig;
}
