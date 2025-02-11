import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WafConstruct } from '../construct/waf-webacl-construct';
import { CfnWebACL } from 'aws-cdk-lib/aws-wafv2';

interface CfWafStackProps extends cdk.StackProps {}

export class CfWafStack extends cdk.Stack {
  public readonly webAcl: CfnWebACL;
  constructor(scope: Construct, id: string, props: CfWafStackProps) {
    super(scope, id, props);

    const waf = new WafConstruct(this, 'Waf', {
      webAclProps: {
        scope: 'CLOUDFRONT',
      },
    });

    this.webAcl = waf.webAcl;
  }
}
