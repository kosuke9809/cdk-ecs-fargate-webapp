import { Construct } from 'constructs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';

interface AlbConstructProps {
  servicePrefix: string;
  vpc: ec2.Vpc;
  acmCertificateArn?: string;
  frontendPort?: number;
}

export class AlbConstruct extends Construct {
  public readonly alb: elbv2.ApplicationLoadBalancer;
  constructor(scope: Construct, id: string, props: AlbConstructProps) {
    super(scope, id);

    const sgForAlb = new ec2.SecurityGroup(this, 'SecurityGroupForAlb', {
      securityGroupName: 'SecurityGroupForAlb',
      vpc: props.vpc,
    });

    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      internetFacing: true,
      vpc: props.vpc,
      securityGroup: sgForAlb,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    const defaultTargetGroup = new elbv2.ApplicationTargetGroup(this, 'DefaultTargetGroup', {
      vpc: props.vpc,
      port: props.frontendPort ?? 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        enabled: true,
        path: '/ping',
        healthyHttpCodes: '200,301',
      },
    });

    if (props.acmCertificateArn) {
      const certificate = elbv2.ListenerCertificate.fromArn(props.acmCertificateArn);
      alb.addListener('HttpsListener', {
        port: 443,
        certificates: [certificate],
        defaultTargetGroups: [defaultTargetGroup],
      });

      alb.addListener('HttpListener', {
        port: 80,
        defaultAction: elbv2.ListenerAction.redirect({
          protocol: 'HTTPS',
          port: '443',
          permanent: true,
        }),
      });
    } else {
      alb.addListener('HttpListener', {
        port: 80,
        defaultTargetGroups: [defaultTargetGroup],
      });
    }

    new ssm.StringParameter(this, 'AlbArn', {
      parameterName: `/${props.servicePrefix}/alb-arn`,
      stringValue: alb.loadBalancerArn,
    });

    new ssm.StringParameter(this, 'TargetGroupArn', {
      parameterName: `/${props.servicePrefix}/target-group-arn`,
      stringValue: defaultTargetGroup.targetGroupArn,
    });

    this.alb = alb;
  }
}
