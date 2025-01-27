import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface EcsClusterConstructProps {
  vpc: ec2.Vpc;
}

export class EcsClusterConstruct extends Construct {
  public readonly cluster: ecs.Cluster;
  constructor(scope: Construct, id: string, props: EcsClusterConstructProps) {
    super(scope, id);

    const cluster = new ecs.Cluster(this, 'EcsCluster', {
      vpc: props.vpc,
    });

    this.cluster = cluster;
  }
}
