import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Row, Column, Hr, Img,
} from 'npm:@react-email/components@0.0.22'

const SITE_NAME = "WellarShop"
const SITE_URL = "https://wellar.lovable.app"
const PRIMARY_COLOR = "#16a34a" // green accent from brand

interface OrderItem {
  product_name: string
  product_image?: string
  quantity: number
  unit_price: number
  total_price: number
}

interface OrderReceiptProps {
  orderNumber?: string
  orderId?: string
  items?: OrderItem[]
  subtotal?: number
  shipping?: number
  total?: number
  shippingAddress?: string
  phoneNumber?: string
}

const formatPrice = (amount: number) => `${amount.toLocaleString()} FRw`

const OrderReceiptEmail = ({
  orderNumber = "A1B2C3D4",
  orderId = "a1b2c3d4-0000-0000-0000-000000000000",
  items = [
    { product_name: "Playmouth Gin 750ml", quantity: 1, unit_price: 35000, total_price: 35000 },
    { product_name: "SMINORF GIN 1L", quantity: 1, unit_price: 28000, total_price: 28000 },
  ],
  subtotal = 63000,
  shipping = 0,
  total = 63000,
  shippingAddress = "KG 123 St, Kigali",
  phoneNumber = "07XXXXXXXX",
}: OrderReceiptProps) => {
  const confirmationUrl = `${SITE_URL}/order-confirmation?order=${orderId}`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your {SITE_NAME} order #{orderNumber} is confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logoText}>{SITE_NAME}</Heading>
          </Section>

          {/* Success Icon & Title */}
          <Section style={heroSection}>
            <Text style={checkIcon}>✓</Text>
            <Heading style={h1}>Order Confirmed!</Heading>
            <Text style={subtitle}>Thank you for your purchase</Text>
          </Section>

          {/* Order Number */}
          <Section style={orderNumberSection}>
            <Text style={orderLabel}>Order Number</Text>
            <Text style={orderValue}>#{orderNumber}</Text>
          </Section>

          <Hr style={divider} />

          {/* Items */}
          <Section>
            <Heading style={h2}>Items Ordered</Heading>
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemDetails}>
                  <Text style={itemName}>{item.product_name}</Text>
                  <Text style={itemMeta}>
                    {formatPrice(item.unit_price)} × {item.quantity}
                  </Text>
                </Column>
                <Column style={itemPriceCol}>
                  <Text style={itemPrice}>{formatPrice(item.total_price)}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Totals */}
          <Section>
            <Row style={totalRow}>
              <Column><Text style={totalLabel}>Subtotal</Text></Column>
              <Column style={totalValueCol}><Text style={totalValue}>{formatPrice(subtotal)}</Text></Column>
            </Row>
            <Row style={totalRow}>
              <Column><Text style={totalLabel}>Shipping</Text></Column>
              <Column style={totalValueCol}>
                <Text style={totalValue}>{shipping === 0 ? "Free" : formatPrice(shipping)}</Text>
              </Column>
            </Row>
            <Hr style={thinDivider} />
            <Row style={totalRow}>
              <Column><Text style={grandTotalLabel}>Total</Text></Column>
              <Column style={totalValueCol}><Text style={grandTotalValue}>{formatPrice(total)}</Text></Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Delivery Info */}
          <Section>
            <Heading style={h2}>Delivery Details</Heading>
            <Text style={detailText}>
              <strong>Address:</strong> {shippingAddress}
            </Text>
            <Text style={detailText}>
              <strong>Phone:</strong> {phoneNumber}
            </Text>
            <Text style={detailText}>
              We'll contact you to confirm delivery details.
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={confirmationUrl}>
              View Order Details
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              Questions? Reply to this email or visit {SITE_NAME}.
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: OrderReceiptEmail,
  subject: (data: Record<string, any>) =>
    `Your ${SITE_NAME} order #${data.orderNumber || 'ORDER'} is confirmed`,
  displayName: 'Order receipt',
  previewData: {
    orderNumber: "A1B2C3D4",
    orderId: "a1b2c3d4-0000-0000-0000-000000000000",
    items: [
      { product_name: "Playmouth Gin 750ml", quantity: 1, unit_price: 35000, total_price: 35000 },
      { product_name: "SMINORF GIN 1L", quantity: 1, unit_price: 28000, total_price: 28000 },
    ],
    subtotal: 63000,
    shipping: 0,
    total: 63000,
    shippingAddress: "KG 123 St, Kigali",
    phoneNumber: "0788123456",
  },
}

// ── Styles ──────────────────────────────────────────────

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
}

const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '0',
}

const header = {
  backgroundColor: PRIMARY_COLOR,
  padding: '24px 32px',
  borderRadius: '8px 8px 0 0',
}

const logoText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '0',
  textAlign: 'center' as const,
}

const heroSection = {
  textAlign: 'center' as const,
  padding: '32px 32px 16px',
}

const checkIcon = {
  display: 'inline-block',
  width: '48px',
  height: '48px',
  lineHeight: '48px',
  borderRadius: '50%',
  backgroundColor: '#dcfce7',
  color: PRIMARY_COLOR,
  fontSize: '24px',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  margin: '0 auto 12px',
}

const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#111827',
  margin: '0 0 4px',
}

const subtitle = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
}

const orderNumberSection = {
  textAlign: 'center' as const,
  backgroundColor: '#f9fafb',
  margin: '0 32px',
  padding: '16px',
  borderRadius: '8px',
}

const orderLabel = {
  fontSize: '11px',
  color: '#9ca3af',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 4px',
}

const orderValue = {
  fontSize: '20px',
  fontWeight: 'bold' as const,
  fontFamily: 'monospace',
  color: '#111827',
  margin: '0',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 32px',
}

const thinDivider = {
  borderColor: '#e5e7eb',
  margin: '8px 0',
}

const h2 = {
  fontSize: '16px',
  fontWeight: '600' as const,
  color: '#111827',
  margin: '0 32px 12px',
}

const itemRow = {
  padding: '8px 32px',
}

const itemDetails = {
  verticalAlign: 'top' as const,
}

const itemName = {
  fontSize: '14px',
  fontWeight: '500' as const,
  color: '#111827',
  margin: '0 0 2px',
}

const itemMeta = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0',
}

const itemPriceCol = {
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
  width: '120px',
}

const itemPrice = {
  fontSize: '14px',
  fontWeight: '500' as const,
  color: '#111827',
  margin: '0',
}

const totalRow = {
  padding: '4px 32px',
}

const totalLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
}

const totalValueCol = {
  textAlign: 'right' as const,
  width: '120px',
}

const totalValue = {
  fontSize: '14px',
  color: '#374151',
  margin: '0',
}

const grandTotalLabel = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: '#111827',
  margin: '0',
}

const grandTotalValue = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: PRIMARY_COLOR,
  margin: '0',
}

const detailText = {
  fontSize: '14px',
  color: '#374151',
  lineHeight: '1.5',
  margin: '0 32px 8px',
}

const ctaSection = {
  textAlign: 'center' as const,
  padding: '24px 32px',
}

const ctaButton = {
  backgroundColor: PRIMARY_COLOR,
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  padding: '12px 32px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
}

const footerSection = {
  textAlign: 'center' as const,
  padding: '16px 32px 32px',
}

const footerText = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0 0 8px',
}

const footerCopyright = {
  fontSize: '11px',
  color: '#d1d5db',
  margin: '0',
}
