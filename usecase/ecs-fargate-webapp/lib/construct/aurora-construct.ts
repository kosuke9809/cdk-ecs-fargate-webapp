import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';

interface AuroraConstructProps {
  envName: string;
  vpc: ec2.Vpc;
  postgresEngineVersion: rds.AuroraPostgresEngineVersion;
  minAcu: number;
  maxAcu: number;
  backup: rds.BackupProps;
  clusterParameters: { [key: string]: string };
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
        version: props.postgresEngineVersion,
      }),
      parameters: props.clusterParameters,
    });

    let additionalDBCulsterProps = {};

    if (props.envName === 'prod') {
      additionalDBCulsterProps = {
        removalPolicy: cdk.RemovalPolicy.RETAIN,

        monitoringInterval: cdk.Duration.seconds(60),
        cloudwatchLogsExports: ['postgresql'],
        cloudwatchLogsRetention: logs.RetentionDays.ONE_MONTH,
      };
    }

    new rds.DatabaseCluster(this, 'AuroraCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_17_2,
      }),
      credentials: rds.Credentials.fromGeneratedSecret('admin'),
      serverlessV2MinCapacity: props.maxAcu,
      serverlessV2MaxCapacity: props.maxAcu,
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
      backup: props.backup,
      preferredMaintenanceWindow: 'Sun:17:00-Sun:18:00', // UTC (JST 02:00-03:00)
      ...additionalDBCulsterProps,
    });

    this.securityGroup = securityGroup;
  }
}
