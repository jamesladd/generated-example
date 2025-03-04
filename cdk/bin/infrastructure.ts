#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { VikeStack } from "../lib/vike-stack";

import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";

import { stackNameSuffix } from "../stack-name-suffix.json";

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

export type CustomStackProps = cdk.StackProps & {
  domainName?: string;
  subDomain?: string;
  certificate?: string | certificatemanager.ICertificate;
  hostedZone?: route53.IHostedZone;
};

// Here you can configure the stack:
const customStackProps: CustomStackProps = {
  domainName: undefined, // e.g. "example.com"
  subDomain: undefined, // e.g. "www"
  certificate: undefined, // e.g. "arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012" or a certificatemanager.ICertificate
  hostedZone: undefined, // e.g. route53.HostedZone.fromLookup(stack, "MyHostedZone", { domainName: "example.com" })
};

const app = new cdk.App();

const usEast1Stack = customStackProps?.domainName
  ? new cdk.Stack(app, `VikeStack-Cert-${stackNameSuffix}`, {
      env: {
        ...env,
        region: "us-east-1",
      },
      crossRegionReferences: true,
    })
  : undefined;

customStackProps.hostedZone = usEast1Stack
  ? customStackProps?.hostedZone
    ? customStackProps?.hostedZone
    : customStackProps?.domainName
      ? route53.HostedZone.fromLookup(usEast1Stack, "MyHostedZone", {
          domainName: customStackProps.domainName,
        })
      : undefined
  : undefined;

customStackProps.certificate = usEast1Stack ? loadCertificate(usEast1Stack, customStackProps) : undefined;

const mainStack = new VikeStack(app, `VikeStack-${stackNameSuffix}`, {
  env,
  crossRegionReferences: true,
  customStackProps,
});

if (usEast1Stack) {
  mainStack.addDependency(usEast1Stack);
  app.synth();
}
function loadCertificate(stack: cdk.Stack, stackConfig: CustomStackProps): certificatemanager.ICertificate | undefined {
  const { domainName, subDomain, certificate, hostedZone } = stackConfig;
  if (typeof certificate === "string") {
    certificatemanager.Certificate.fromCertificateArn(stack, "Certificate", certificate);
  } else if (certificate) {
    return certificate;
  }

  if (!domainName) {
    return undefined;
  }

  const siteDomainName = `${(subDomain?.length ?? 0 > 0) ? `${subDomain}.` : ""}${domainName}`;
  return new certificatemanager.Certificate(stack, "Certificate", {
    domainName: siteDomainName,
    //subjectAlternativeNames: props.domainAliases,
    validation: certificatemanager.CertificateValidation.fromDns(hostedZone),
  });
}
