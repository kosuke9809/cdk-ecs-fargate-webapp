import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';

interface EcsClusterConstructProps {
  servicePrefix: string;
  vpc: ec2.Vpc;
  namespaceName: string;
}

export class EcsClusterConstruct extends Construct {
  public readonly cluster: ecs.Cluster;
  constructor(scope: Construct, id: string, props: EcsClusterConstructProps) {
    super(scope, id);

    const cluster = new ecs.Cluster(this, 'EcsCluster', {
      vpc: props.vpc,
    });

    const namespace = cluster.addDefaultCloudMapNamespace({
      name: props.namespaceName,
    });

    new ssm.StringParameter(this, 'EcsClusterName', {
      parameterName: `/${props.servicePrefix}/ecs-cluster-name`,
      stringValue: cluster.clusterName,
    });

    new ssm.StringParameter(this, 'EcsNameSpace', {
      parameterName: `/${props.servicePrefix}/ecs-namespace`,
      stringValue: namespace.namespaceName,
    });

    this.cluster = cluster;
  }
}
