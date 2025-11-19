import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>ALPHA GRIT</Heading>
            <Text style={tagline}>Stay Hard. Stay Hungry.</Text>
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions? Hit us up on WhatsApp: +1 (555) 000-0000
            </Text>
            <Text style={footerText}>
              ALPHA GRIT © {new Date().getFullYear()}
            </Text>
            <Text style={footerSmall}>
              You're receiving this because you're part of the Alpha Grit
              community.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  borderBottom: '2px solid #f97316',
};

const logo = {
  fontSize: '32px',
  fontWeight: '900',
  color: '#ffffff',
  margin: '0 0 8px',
  background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '2px',
};

const tagline = {
  fontSize: '14px',
  color: '#a3a3a3',
  margin: '0',
  fontWeight: '600',
  letterSpacing: '1px',
};

const content = {
  padding: '24px',
  backgroundColor: '#171717',
  borderRadius: '8px',
  margin: '24px 0',
};

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
  borderTop: '1px solid #262626',
};

const footerText = {
  color: '#737373',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
};

const footerSmall = {
  color: '#525252',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '16px 0 0',
};
