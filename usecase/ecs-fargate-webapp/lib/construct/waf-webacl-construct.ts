import { Construct } from 'constructs';
import { CfnWebACL } from 'aws-cdk-lib/aws-wafv2';

interface WebAclProps {
  scope: 'CLOUDFRONT' | 'REGIONAL';
}

interface WafProps {
  webAclProps: WebAclProps;
}

export class WafConstruct extends Construct {
  public readonly webAcl: CfnWebACL;
  constructor(scope: Construct, id: string, props: WafProps) {
    super(scope, id);

    const webAcl = new CfnWebACL(this, 'WebACL', {
      defaultAction: { allow: {} },
      scope: props.webAclProps.scope,
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'WebAcl',
      },
    });

    webAcl.rules = [
      {
        priority: 1,
        name: 'ManagedRule',
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: 'ManagedRule',
        },
        statement: {
          managedRuleGroupStatement: {
            vendorName: 'AWS',
            name: 'AWSManagedRulesCommonRuleSet',
          },
        },
        overrideAction: { none: {} },
      },
    ];

    this.webAcl = webAcl;
  }
}
