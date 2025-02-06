import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface AuroraConstructProps {
  vpc: ec2.Vpc;
  clusterParameters: { [key: string]: string };
  backup: rds.BackupProps;
}

export class AuroraConstruct extends Construct {
  public readonly securityGroup: ec2.SecurityGroup;
  constructor(scope: Construct, id: string, props: AuroraConstructProps) {
    super(scope, id);

    const securityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc: props.vpc,
    });

    const clusterParameterGroup = new rds.ParameterGroup(this, 'ClusterParameterGroup', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_17_2,
      }),
      parameters: props.clusterParameters,
    });

    new rds.DatabaseCluster(this, 'AuroraCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_17_2,
      }),
      credentials: rds.Credentials.fromGeneratedSecret('admin'),
      serverlessV2MinCapacity: 0,
      serverlessV2MaxCapacity: 4,
      parameterGroup: clusterParameterGroup,
      vpc: props.vpc,
      vpcSubnets: props.vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      }),
      securityGroups: [securityGroup],
      writer: rds.ClusterInstance.serverlessV2('Writer'),
      readers: [
        rds.ClusterInstance.serverlessV2('Reader1'),
        rds.ClusterInstance.serverlessV2('Reader2'),
      ],
      backup: {
        retention: cdk.Duration.days(7),
        preferredWindow: '16:00-17:00', // UTC (JST 01:00-02:00)
      },
      monitoringInterval: cdk.Duration.minutes(1),
    });

    this.securityGroup = securityGroup;
  }
}
