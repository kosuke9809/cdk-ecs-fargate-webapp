import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { IRemovalConfig } from '../../config/interface';

export interface EcsAppConstructProps {
  serviceName: string;
  vpc: ec2.Vpc;
  removalConfig: IRemovalConfig;
}

export class EcsAppConstruct extends Construct {
  public readonly taskRole: iam.Role;
  public readonly serviceSecurityGroup: ec2.SecurityGroup;
  constructor(scope: Construct, id: string, props: EcsAppConstructProps) {
    super(scope, id);

    const ecrRepository = new ecr.Repository(this, 'EcrRepository', {
      repositoryName: `${props.serviceName}-repository`.slice(0, 256),
      removalPolicy: props.removalConfig.removalPolicy,
      emptyOnDelete: props.removalConfig.emptyOnDelete,
    });

    const envBucket = new s3.Bucket(this, 'EnvBucket', {
      removalPolicy: props.removalConfig.removalPolicy,
      accessControl: s3.BucketAccessControl.PRIVATE,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    const taskExecRole = new iam.Role(this, 'TaskExecRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    taskExecRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:GetObject', 's3:GetBuketLocation'],
        resources: [envBucket.bucketArn, `${envBucket.bucketArn}/*`],
      }),
    );

    const serviceSecurityGroup = new ec2.SecurityGroup(this, 'ServiceSecurityGroup', {
      vpc: props.vpc,
    });

    new ssm.StringParameter(this, 'EcrRepositoryArn', {
      parameterName: `/${props.serviceName}/ecr-repository-arn`,
      stringValue: ecrRepository.repositoryArn,
    });

    new ssm.StringParameter(this, 'TaskRoleArn', {
      parameterName: `/${props.serviceName}/task-role-arn`,
      stringValue: taskRole.roleArn,
    });

    new ssm.StringParameter(this, 'TaskExecRoleArn', {
      parameterName: `/${props.serviceName}/task-exec-role-arn`,
      stringValue: taskExecRole.roleArn,
    });

    new ssm.StringParameter(this, 'ServiceSecurityGroupId', {
      parameterName: `/${props.serviceName}/service-security-group-id`,
      stringValue: serviceSecurityGroup.securityGroupId,
    });

    this.taskRole = taskRole;
    this.serviceSecurityGroup = serviceSecurityGroup;
  }
}
