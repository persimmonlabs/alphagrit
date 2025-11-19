import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

interface WelcomeEmailProps {
  customerName: string;
}

export const WelcomeEmail = ({
  customerName = 'Champion',
}: WelcomeEmailProps) => {
  return (
    <EmailLayout preview="Welcome to Alpha Grit 🔥">
      <Heading style={h1}>Welcome to Alpha Grit 🔥</Heading>

      <Text style={text}>
        What's up {customerName},
      </Text>

      <Text style={text}>
        You just joined a community that's all about one thing: <strong>taking action</strong>.
      </Text>

      <Text style={text}>
        No fluff. No motivation without execution. Just raw, practical
        knowledge designed to help you level up mentally, physically, and
        financially.
      </Text>

      {/* What to Expect Section */}
      <Section style={expectSection}>
        <Text style={sectionTitle}>WHAT YOU'RE GETTING</Text>

        <Section style={featureBox}>
          <Text style={featureTitle}>📚 Premium E-Books</Text>
          <Text style={featureText}>
            Mental toughness guides, discipline blueprints, and success frameworks
            from people who've actually done it.
          </Text>
        </Section>

        <Section style={featureBox}>
          <Text style={featureTitle}>💡 Actionable Content</Text>
          <Text style={featureText}>
            Every product comes with practical steps you can implement
            immediately. No theory-only BS.
          </Text>
        </Section>

        <Section style={featureBox}>
          <Text style={featureTitle}>🔥 Direct Support</Text>
          <Text style={featureText}>
            Got questions? Hit us on WhatsApp. We're here to help you succeed.
          </Text>
        </Section>
      </Section>

      <Hr style={divider} />

      {/* CTA Section */}
      <Section style={ctaSection}>
        <Text style={ctaText}>
          Ready to get started? Browse our collection and find what speaks to you.
        </Text>
        <Button style={button} href="https://alphagrit.vercel.app/products">
          EXPLORE PRODUCTS
        </Button>
      </Section>

      <Hr style={divider} />

      <Text style={motivationalText}>
        "Everyone wants to be a beast until it's time to do what beasts do. You
        signed up. Now it's time to execute."
      </Text>

      <Text style={footerText}>
        Let's get it,
        <br />
        — The Alpha Grit Team
      </Text>
    </EmailLayout>
  );
};

export default WelcomeEmail;

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '900',
  lineHeight: '1.3',
  margin: '0 0 24px',
};

const text = {
  color: '#e5e5e5',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const expectSection = {
  margin: '32px 0',
};

const sectionTitle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '1px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const featureBox = {
  backgroundColor: '#1a1a1a',
  borderLeft: '4px solid #f97316',
  borderRadius: '6px',
  padding: '20px',
  margin: '16px 0',
};

const featureTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const featureText = {
  color: '#a3a3a3',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const divider = {
  borderColor: '#262626',
  margin: '32px 0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const ctaText = {
  color: '#e5e5e5',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 20px',
};

const button = {
  backgroundColor: '#f97316',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  letterSpacing: '1px',
};

const motivationalText = {
  color: '#ef4444',
  fontSize: '16px',
  fontWeight: '600',
  fontStyle: 'italic',
  textAlign: 'center' as const,
  margin: '24px 0',
  padding: '20px',
  borderLeft: '4px solid #ef4444',
  backgroundColor: '#1a0a0a',
  lineHeight: '26px',
};

const footerText = {
  color: '#a3a3a3',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '24px 0 0',
  textAlign: 'center' as const,
};
