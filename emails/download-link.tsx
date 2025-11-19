import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

interface DownloadLinkEmailProps {
  customerName: string;
  products: Array<{
    title: string;
    downloadUrl: string;
  }>;
  expiryDays: number;
  maxDownloads: number;
}

export const DownloadLinkEmail = ({
  customerName = 'Champion',
  products = [
    {
      title: 'Mental Toughness Masterclass',
      downloadUrl: 'https://alphagrit.vercel.app/download/123',
    },
    {
      title: 'The Discipline Blueprint',
      downloadUrl: 'https://alphagrit.vercel.app/download/456',
    },
  ],
  expiryDays = 7,
  maxDownloads = 5,
}: DownloadLinkEmailProps) => {
  return (
    <EmailLayout preview="Your downloads are ready. No excuses.">
      <Heading style={h1}>Your downloads are ready. No excuses.</Heading>

      <Text style={text}>
        {customerName},
      </Text>

      <Text style={text}>
        Your e-books are locked and loaded. Time to consume this content and
        put it to work. Knowledge without action is useless.
      </Text>

      {/* Download Links */}
      <Section style={downloadsSection}>
        <Text style={sectionTitle}>YOUR E-BOOKS</Text>
        {products.map((product, index) => (
          <Section key={index} style={downloadBox}>
            <Text style={productTitle}>{product.title}</Text>
            <Button style={button} href={product.downloadUrl}>
              DOWNLOAD NOW
            </Button>
          </Section>
        ))}
      </Section>

      {/* Important Notice */}
      <Section style={noticeBox}>
        <Text style={noticeTitle}>⏱️ IMPORTANT</Text>
        <Text style={noticeText}>
          • Links expire in <strong>{expiryDays} days</strong>
        </Text>
        <Text style={noticeText}>
          • Maximum <strong>{maxDownloads} downloads</strong> per item
        </Text>
        <Text style={noticeText}>
          • Download now and save to your device
        </Text>
      </Section>

      <Hr style={divider} />

      <Text style={supportText}>
        Having issues? Don't let tech problems stop you. Hit us on WhatsApp and
        we'll sort you out immediately.
      </Text>

      <Text style={motivationalText}>
        "You bought it. Now read it. Then apply it. That's how you win."
      </Text>
    </EmailLayout>
  );
};

export default DownloadLinkEmail;

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
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

const sectionTitle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '1px',
  margin: '0 0 16px',
};

const downloadsSection = {
  margin: '24px 0',
};

const downloadBox = {
  backgroundColor: '#262626',
  borderRadius: '6px',
  padding: '20px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const productTitle = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 16px',
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

const noticeBox = {
  backgroundColor: '#1a0a0a',
  border: '2px solid #ef4444',
  borderRadius: '6px',
  padding: '20px',
  margin: '24px 0',
};

const noticeTitle = {
  color: '#ef4444',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
  letterSpacing: '1px',
};

const noticeText = {
  color: '#e5e5e5',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
};

const divider = {
  borderColor: '#262626',
  margin: '24px 0',
};

const supportText = {
  color: '#a3a3a3',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const motivationalText = {
  color: '#ef4444',
  fontSize: '16px',
  fontWeight: '600',
  fontStyle: 'italic',
  textAlign: 'center' as const,
  margin: '24px 0',
  padding: '16px',
  borderLeft: '4px solid #ef4444',
  backgroundColor: '#1a0a0a',
};
