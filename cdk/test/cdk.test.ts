import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { EcsAppStack, VpcProps } from '../lib/stack/ecs-app-stack';

describe('EcsAppStack', () => {
  const app = new cdk.App();

  const VpcProps: VpcProps = {
    maxAzs: 2,
    natGateways: 2,
  };

  const stack = new EcsAppStack(app, 'MyTestStack', {
    env: {
      account: '123456789012',
      region: 'us-east-1',
    },
    vpcProps: VpcProps,
  });

  const template = Template.fromStack(stack);

  test('Creates correct number of NAT gateway', () => {
    template.resourceCountIs('AWS::EC2::NatGateway', 2);
  });

  test('Creates correct number of subnets', () => {
    template.resourceCountIs('AWS::EC2::Subnet', 4);
  });
});
