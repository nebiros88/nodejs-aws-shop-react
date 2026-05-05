import * as path from 'path';

import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // s3 bucket config
    const bucket = new s3.Bucket(this, 'StaticWebSiteBucket', {
      bucketName: 'rs-aws-dev-2026-cloudfront-s3',
      websiteIndexDocument: 'index.html',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Cloudfront distribution config
    const distribution = new cloudfront.Distribution(
      this,
      'StaticWebSiteDistribution',
      {
        defaultRootObject: 'index.html',
        defaultBehavior: {
          origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
    );

    // Deploy app to s3 and invalidate cloudfront distribution
    new s3deploy.BucketDeployment(this, 'StaticWebsiteDeployment', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../dist'))],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'], // cache invalidation on every deployment
    });

    // Get output url for the created cloudfront distribution
    new cdk.CfnOutput(this, 'CloudfrontURL', {
      value: `https://${distribution.domainName}`,
    });
  }
}
