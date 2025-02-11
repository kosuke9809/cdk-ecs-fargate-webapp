import * as inf from './interface';
import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';

export const Env: inf.IEnv = {
  envName: 'dev',
  serviceName: 'webapp',
};

export const RemovalConfig: inf.IRemovalConfig = {
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
  emptyOnDelete: true,
};

export const Vpc: inf.IVpcConfig = {
  maxAzs: 3,
  natGateways: 3,
};

export const Aurora: inf.IAurora = {
  postgresEngineVersion: rds.AuroraPostgresEngineVersion.VER_17_2,
  minAcu: 0,
  maxAcu: 4,
  backup: {
    retention: cdk.Duration.days(7),
    preferredWindow: '16:00-17:00', // UTC (JST 01:00-02:00)
  },
  clusterParameters: {},
};

export const CloudFront: inf.ICloudFront = {
  defaultRootObject: 'index.html',
  acmCertificateArn: '',
  domainName: '',
};

export const config: inf.IConfig = {
  Env: Env,
  RemovalConfig: RemovalConfig,
  Aurora: Aurora,
  Vpc: Vpc,
  CloudFront: CloudFront,
};
