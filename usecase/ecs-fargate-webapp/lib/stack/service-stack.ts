import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VpcConstruct } from '../construct/vpc-construct';
import { EcsClusterConstruct } from '../construct/ecs-cluster-construct';
import { AlbConstruct } from '../construct/alb-construct';
import { EcsAppConstruct } from '../construct/ecs-app-construct';

export interface VpcProps {
  maxAzs: number;
  natGateways: number;
}

interface ServiceStackProps extends cdk.StackProps {
  servicePrefix: string;
  vpcProps: VpcProps;
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
      vpc: myVpc.myVpc,
      namespaceName: 'ecs.local',
    });

    // system resources
    const alb = new AlbConstruct(this, 'Alb', {
      vpc: myVpc.myVpc,
      servicePrefix: props.servicePrefix,
    });

    const frontend = new EcsAppConstruct(this, 'Frontend', {
      serviceName: `${props.servicePrefix}-frontend`,
      vpc: myVpc.myVpc,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteImages: true,
    });

    const backend = new EcsAppConstruct(this, 'Backend', {
      serviceName: `${props.servicePrefix}-backend`,
      vpc: myVpc.myVpc,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteImages: true,
    });
  }
}
