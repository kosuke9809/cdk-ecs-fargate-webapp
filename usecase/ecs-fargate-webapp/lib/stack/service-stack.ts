import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BackupProps, AuroraPostgresEngineVersion } from 'aws-cdk-lib/aws-rds';

import { AlbConstruct } from '../construct/alb-construct';
import { EcsAppConstruct } from '../construct/ecs-app-construct';
import { EcsClusterConstruct } from '../construct/ecs-cluster-construct';
import { VpcConstruct } from '../construct/vpc-construct';
import { AuroraConstruct } from '../construct/aurora-construct';
import { IRemovalConfig } from '../../config/interface';

interface VpcProps {
  maxAzs: number;
  natGateways: number;
}

interface AuroraProps {
  postgresEngineVersion: AuroraPostgresEngineVersion;
  minAcu: number;
  maxAcu: number;
  clusterParameters: { [key: string]: string };
  backup: BackupProps;
}

interface ServiceStackProps extends cdk.StackProps {
  envName: string;
  servicePrefix: string;
  removalConfig: IRemovalConfig;
  vpcProps: VpcProps;
  auroraProps: AuroraProps;
}

export class ServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);

    // common resources
    const myVpc = new VpcConstruct(this, 'MyVpc', {
      ...props.vpcProps,
    });

    const ecsCluster = new EcsClusterConstruct(this, 'EcsAppCluster', {
      servicePrefix: props.servicePrefix,
      vpc: myVpc.vpc,
      namespaceName: 'ecs.local',
    });

    // system resources
    const alb = new AlbConstruct(this, 'Alb', {
      vpc: myVpc.vpc,
      servicePrefix: props.servicePrefix,
    });

    const frontend = new EcsAppConstruct(this, 'Frontend', {
      serviceName: `${props.servicePrefix}-frontend`,
      vpc: myVpc.vpc,
      removalConfig: props.removalConfig,
    });

    const backend = new EcsAppConstruct(this, 'Backend', {
      serviceName: `${props.servicePrefix}-backend`,
      vpc: myVpc.vpc,
      removalConfig: props.removalConfig,
    });

    const database = new AuroraConstruct(this, 'AuroraPostgres', {
      envName: props.envName,
      vpc: myVpc.vpc,
      ...props.auroraProps,
    });
  }
}
