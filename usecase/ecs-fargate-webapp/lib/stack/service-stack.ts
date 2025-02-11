import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BackupProps, AuroraPostgresEngineVersion } from 'aws-cdk-lib/aws-rds';

import { AlbConstruct } from '../construct/alb-construct';
import { EcsAppConstruct } from '../construct/ecs-app-construct';
import { EcsClusterConstruct } from '../construct/ecs-cluster-construct';
import { VpcConstruct } from '../construct/vpc-construct';
import { AuroraConstruct } from '../construct/aurora-construct';
import { CloudFrontConstruct } from '../construct/cloudfront-construct';
import { IRemovalConfig } from '../../config/interface';
import { CfnWebACL } from 'aws-cdk-lib/aws-wafv2';

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

interface CloudFrontProps {
  defaultRootObject?: string;
  acmCertificateArn?: string;
  domainName?: string;
}

interface ServiceStackProps extends cdk.StackProps {
  envName: string;
  servicePrefix: string;
  removalConfig: IRemovalConfig;
  webAcl: CfnWebACL;
  vpcProps: VpcProps;
  auroraProps: AuroraProps;
  cloudfrontProps: CloudFrontProps;
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

    const cloudfront = new CloudFrontConstruct(this, 'CloudFront', {
      alb: alb.loadBalancer,
      webAcl: props.webAcl,
      distributionProps: {
        defaultRootObject: props.cloudfrontProps.defaultRootObject,
        acmCertificateArn: props.cloudfrontProps.acmCertificateArn,
        domainName: props.cloudfrontProps.domainName,
      },
      removalConfig: props.removalConfig,
    });
  }
}
