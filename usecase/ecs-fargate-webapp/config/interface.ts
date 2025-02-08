import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
export interface IEnv {
  envName: string;
  serviceName: string;
  account?: string;
  region?: string;
}

export interface IRemovalConfig {
  removalPolicy: cdk.RemovalPolicy;
  autoDeleteObjects?: boolean;
  emptyOnDelete?: boolean;
}

export interface IVpcConfig {
  maxAzs: number;
  natGateways: number;
}

export interface IAurora {
  postgresEngineVersion: rds.AuroraPostgresEngineVersion;
  minAcu: number;
  maxAcu: number;
  backup: rds.BackupProps;
  clusterParameters: { [key: string]: string };
}

export interface IConfig {
  Env: IEnv;
  RemovalConfig: IRemovalConfig;
  Vpc: IVpcConfig;
  Aurora: IAurora;
}
