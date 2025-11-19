import {
  Button,
  Column,
  Heading,
  Hr,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

interface PurchaseConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  items: Array<{
    title: string;
    price: number;
  }>;
  total: number;
  downloadUrl: string;
}

export const PurchaseConfirmationEmail = ({
  orderNumber = 'AG-123456',
  customerName = 'Champion',
  items = [
    { title: 'Mental Toughness Masterclass', price: 29.99 },
    { title: 'The Discipline Blueprint', price: 19.99 },
  ],
  total = 49.98,
  downloadUrl = 'https://alphagrit.vercel.app/downloads',
}: PurchaseConfirmationEmailProps) => {
  return (
    <EmailLayout preview="You're in. Now do the work. 💪">
      <Heading style={h1}>You're in. Now do the work. 💪</Heading>

      <Text style={text}>
        What's up {customerName},
      </Text>

      <Text style={text}>
        Your order is confirmed. No turning back now. You invested in yourself
        - that's the first step. Now it's time to execute.
      </Text>

      {/* Order Details */}
      <Section style={orderBox}>
        <Text style={orderLabel}>ORDER NUMBER</Text>
        <Text style={orderNumber}>{orderNumber}</Text>
      </Section>

      {/* Items */}
      <Section style={itemsSection}>
        <Text style={sectionTitle}>YOUR PURCHASE</Text>
        {items.map((item, index) => (
          <Row key={index} style={itemRow}>
            <Column style={itemName}>
              <Text style={itemText}>{item.title}</Text>
            </Column>
            <Column style={itemPrice}>
              <Text style={itemText}>${item.price.toFixed(2)}</Text>
            </Column>
          </Row>
        ))}
        <Hr style={divider} />
        <Row style={itemRow}>
          <Column style={itemName}>
            <Text style={totalText}>TOTAL</Text>
          </Column>
          <Column style={itemPrice}>
            <Text style={totalText}>${total.toFixed(2)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Download Button */}
      <Section style={buttonSection}>
        <Button style={button} href={downloadUrl}>
          GET YOUR DOWNLOADS
        </Button>
      </Section>

      <Text style={textSmall}>
        Your download links are active for 7 days with up to 5 downloads per
        item. Don't sleep on this.
      </Text>

      <Hr style={divider} />

      <Text style={motivationalText}>
        "The only person who can stop you is you. Now get after it."
      </Text>
    </EmailLayout>
  );
};

export default PurchaseConfirmationEmail;

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

const textSmall = {
  color: '#a3a3a3',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '16px 0',
};

const orderBox = {
  backgroundColor: '#262626',
  borderRadius: '6px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const orderLabel = {
  color: '#737373',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '1px',
  margin: '0 0 8px',
};

const orderNumber = {
  color: '#f97316',
  fontSize: '24px',
  fontWeight: '900',
  letterSpacing: '2px',
  margin: '0',
};

const itemsSection = {
  margin: '24px 0',
};

const sectionTitle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '1px',
  margin: '0 0 16px',
};

const itemRow = {
  padding: '12px 0',
};

const itemName = {
  width: '70%',
};

const itemPrice = {
  width: '30%',
  textAlign: 'right' as const,
};

const itemText = {
  color: '#e5e5e5',
  fontSize: '15px',
  margin: '0',
};

const totalText = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0',
};

const divider = {
  borderColor: '#262626',
  margin: '16px 0',
};

const buttonSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#f97316',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
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
  padding: '16px',
  borderLeft: '4px solid #ef4444',
  backgroundColor: '#1a0a0a',
};
