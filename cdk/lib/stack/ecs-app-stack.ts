import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VpcConstruct } from '../construct/vpc-construct';

export interface VpcProps {
  maxAzs: number;
  natGateways: number;
}

interface EcsAppStackProps extends cdk.StackProps {
  vpcProps: VpcProps;
}

export class EcsAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EcsAppStackProps) {
    super(scope, id, props);

    const myVpc = new VpcConstruct(this, 'MyVpc', {
      ...props.vpcProps,
    });
  }
}
