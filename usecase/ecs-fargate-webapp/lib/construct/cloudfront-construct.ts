import { Construct } from 'constructs';
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  OriginProtocolPolicy,
  OriginRequestPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { LoadBalancerV2Origin, S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { CfnWebACL } from 'aws-cdk-lib/aws-wafv2';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  BucketEncryption,
} from 'aws-cdk-lib/aws-s3';
import { Duration } from 'aws-cdk-lib';
import { IRemovalConfig } from '../../config/interface';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

interface DistributionProps {
  defaultRootObject?: string;
  acmCertificateArn?: string;
  domainName?: string;
}

interface CloudFrontProps {
  alb: ApplicationLoadBalancer;
  webAcl: CfnWebACL;
  distributionProps: DistributionProps;
  removalConfig: IRemovalConfig;
}

export class CloudFrontConstruct extends Construct {
  public readonly distribution: Distribution;
  constructor(scope: Construct, id: string, props: CloudFrontProps) {
    super(scope, id);
    let certificate;
    let domainName;

    if (props.distributionProps.acmCertificateArn) {
      certificate = Certificate.fromCertificateArn(
        this,
        'AcmCertificate',
        props.distributionProps.acmCertificateArn,
      );
    }

    if (props.distributionProps.domainName) {
      domainName = [props.distributionProps.domainName];
    }

    const appOrigin = new LoadBalancerV2Origin(props.alb, {
      protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
    });

    const staticBucket = new Bucket(this, 'StaticBucket', {
      removalPolicy: props.removalConfig.removalPolicy,
      autoDeleteObjects: props.removalConfig.autoDeleteObjects,
      encryption: BucketEncryption.S3_MANAGED,
      accessControl: BucketAccessControl.PRIVATE,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: false,
      lifecycleRules: [
        {
          abortIncompleteMultipartUploadAfter: Duration.days(7),
        },
      ],
    });

    const staticOrigin = S3BucketOrigin.withOriginAccessControl(staticBucket);

    const distribution = new Distribution(this, 'Distribution', {
      webAclId: props.webAcl.attrArn,
      domainNames: domainName,
      certificate: certificate,
      defaultRootObject: props.distributionProps.defaultRootObject,
      defaultBehavior: {
        origin: appOrigin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_ALL,
        cachePolicy: CachePolicy.CACHING_DISABLED,
        originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
      },
      additionalBehaviors: {
        '/static/*': {
          origin: staticOrigin,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachePolicy: CachePolicy.CACHING_OPTIMIZED,
          originRequestPolicy: OriginRequestPolicy.CORS_S3_ORIGIN,
        },
      },
    });
    this.distribution = distribution;
  }
}
