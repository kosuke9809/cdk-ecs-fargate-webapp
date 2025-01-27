import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VpcConstruct } from '../construct/vpc-construct';
import { EcsClusterConstruct } from '../construct/ecs-cluster-construct';

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
      vpc: myVpc.myVpc,
    });

    // system resources
  }
}
