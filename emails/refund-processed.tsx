import {
  Heading,
  Hr,
  Section,
  Text,
  Button,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

interface RefundProcessedEmailProps {
  customerName: string;
  orderNumber: string;
  refundAmount: number;
  processingDays: string;
}

export const RefundProcessedEmail = ({
  customerName = 'Champion',
  orderNumber = 'AG-123456',
  refundAmount = 49.98,
  processingDays = '5-10 business days',
}: RefundProcessedEmailProps) => {
  return (
    <EmailLayout preview="Refund Processed - Alpha Grit">
      <Heading style={h1}>Refund Processed</Heading>

      <Text style={text}>
        Hi {customerName},
      </Text>

      <Text style={text}>
        We've processed your refund request. Sometimes things don't work out,
        and that's okay.
      </Text>

      {/* Refund Details */}
      <Section style={refundBox}>
        <Text style={refundLabel}>REFUND AMOUNT</Text>
        <Text style={refundAmount}>${refundAmount.toFixed(2)}</Text>
        <Text style={refundSubtext}>Order #{orderNumber}</Text>
      </Section>

      <Section style={infoSection}>
        <Text style={infoTitle}>What happens next?</Text>
        <Text style={infoText}>
          • Your refund has been initiated
        </Text>
        <Text style={infoText}>
          • Funds will appear in your account within {processingDays}
        </Text>
        <Text style={infoText}>
          • The exact timing depends on your bank or card issuer
        </Text>
      </Section>

      <Hr style={divider} />

      <Text style={text}>
        We're constantly working to create better content. If you have feedback
        on how we can improve, we'd love to hear it.
      </Text>

      <Section style={buttonSection}>
        <Button style={button} href="https://alphagrit.vercel.app/products">
          BROWSE OTHER PRODUCTS
        </Button>
      </Section>

      <Text style={footerText}>
        Thanks for giving Alpha Grit a shot. The door's always open if you want
        to come back.
      </Text>

      <Text style={signature}>
        — The Alpha Grit Team
      </Text>
    </EmailLayout>
  );
};

export default RefundProcessedEmail;

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 24px',
};

const text = {
  color: '#e5e5e5',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const refundBox = {
  backgroundColor: '#262626',
  borderRadius: '6px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const refundLabel = {
  color: '#737373',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '1px',
  margin: '0 0 8px',
};

const refundAmount = {
  color: '#10b981',
  fontSize: '32px',
  fontWeight: '900',
  margin: '8px 0',
};

const refundSubtext = {
  color: '#a3a3a3',
  fontSize: '14px',
  margin: '8px 0 0',
};

const infoSection = {
  backgroundColor: '#1a1a1a',
  borderRadius: '6px',
  padding: '20px',
  margin: '24px 0',
};

const infoTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 16px',
};

const infoText = {
  color: '#e5e5e5',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
};

const divider = {
  borderColor: '#262626',
  margin: '24px 0',
};

const buttonSection = {
  margin: '24px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#f97316',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  letterSpacing: '1px',
};

const footerText = {
  color: '#a3a3a3',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '24px 0 16px',
  textAlign: 'center' as const,
};

const signature = {
  color: '#737373',
  fontSize: '14px',
  fontStyle: 'italic',
  margin: '8px 0',
  textAlign: 'center' as const,
};
