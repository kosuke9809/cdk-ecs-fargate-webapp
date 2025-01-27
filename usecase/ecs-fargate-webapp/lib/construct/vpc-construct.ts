import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface VpcConstructProps {
  maxAzs: number;
  natGateways: number;
}

export class VpcConstruct extends Construct {
  public readonly myVpc: ec2.Vpc;
  constructor(scope: Construct, id: string, props: VpcConstructProps) {
    super(scope, id);

    const myVpc = new ec2.Vpc(this, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: props.maxAzs,
      natGateways: props.natGateways,
      subnetConfiguration: [
        {
          cidrMask: 24,
          subnetType: ec2.SubnetType.PUBLIC,
          name: 'Public',
        },
        {
          cidrMask: 24,
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          name: 'Private',
        },
      ],
    });
    this.myVpc = myVpc;
  }
}
