/* eslint-disable jsx-a11y/alt-text */
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

type ReceiptPdfDocumentProps = {
  receipt: {
    receiptNumber: string;
    issuedAt: string;
    paymentMethod: string;
    subtotal: number;
    discount: number;
    total: number;
    notes?: string | null;
    warrantyNotes?: string | null;
    customer: {
      name: string;
      email?: string | null;
      phone?: string | null;
    };
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }>;
  };
  settings: {
    businessName: string;
    motto?: string | null;
    logoUrl?: string | null;
    footerText: string;
    contactPhone?: string | null;
    contactPhoneAlt?: string | null;
    socialHandle?: string | null;
    contactEmail?: string | null;
    address?: string | null;
  };
  verifyUrl: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: {
    fontSize: 20,
    fontWeight: "bold"
  },
  small: {
    fontSize: 9,
    color: "#64748b"
  },
  section: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
    paddingBottom: 6,
    marginBottom: 6,
    fontWeight: "bold"
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    paddingVertical: 5
  }
});

const currency = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(value || 0);

export function ReceiptPdfDocument({ receipt, settings, verifyUrl }: ReceiptPdfDocumentProps) {
  const canUseLogoInPdf = Boolean(settings.logoUrl && !settings.logoUrl.toLowerCase().endsWith(".svg"));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.row}>
          <View>
            <Text style={styles.title}>{settings.businessName}</Text>
            {settings.motto ? <Text style={{ ...styles.small, fontStyle: "italic" }}>{settings.motto}</Text> : null}
            <Text style={styles.small}>Receipt #{receipt.receiptNumber}</Text>
            <Text style={styles.small}>{new Date(receipt.issuedAt).toLocaleString()}</Text>
            {settings.contactPhone ? <Text style={styles.small}>Phone: {settings.contactPhone}</Text> : null}
            {settings.contactPhoneAlt ? <Text style={styles.small}>Alt Phone: {settings.contactPhoneAlt}</Text> : null}
            {settings.socialHandle ? <Text style={styles.small}>Social: {settings.socialHandle}</Text> : null}
            {settings.contactEmail ? <Text style={styles.small}>Email: {settings.contactEmail}</Text> : null}
            {settings.address ? <Text style={styles.small}>Address: {settings.address}</Text> : null}
          </View>
          {canUseLogoInPdf && settings.logoUrl ? (
            <Image src={settings.logoUrl} style={{ width: 52, height: 52 }} />
          ) : (
            <View
              style={{
                width: 52,
                height: 52,
                borderWidth: 1,
                borderColor: "#cbd5e1",
                borderRadius: 6,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>NG</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Customer Details</Text>
          <Text>{receipt.customer.name}</Text>
          {receipt.customer.email ? <Text style={styles.small}>{receipt.customer.email}</Text> : null}
          {receipt.customer.phone ? <Text style={styles.small}>{receipt.customer.phone}</Text> : null}
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={{ flex: 2 }}>Item</Text>
            <Text style={{ flex: 1 }}>Qty</Text>
            <Text style={{ flex: 1 }}>Unit Price</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>Amount</Text>
          </View>
          {receipt.items.map((item, index) => (
            <View key={`${item.description}-${index}`} style={styles.tableRow}>
              <Text style={{ flex: 2 }}>{item.description}</Text>
              <Text style={{ flex: 1 }}>{item.quantity}</Text>
              <Text style={{ flex: 1 }}>{currency(item.unitPrice)}</Text>
              <Text style={{ flex: 1, textAlign: "right" }}>{currency(item.lineTotal)}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { marginLeft: "auto", width: 220 }]}>
          <View style={styles.row}>
            <Text>Subtotal</Text>
            <Text>{currency(receipt.subtotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Discount</Text>
            <Text>{currency(receipt.discount)}</Text>
          </View>
          <View style={[styles.row, { marginTop: 8 }]}>
            <Text style={{ fontWeight: "bold" }}>Total</Text>
            <Text style={{ fontWeight: "bold" }}>{currency(receipt.total)}</Text>
          </View>
          <Text style={[styles.small, { marginTop: 8 }]}>Payment Method: {receipt.paymentMethod}</Text>
        </View>

        <View style={[styles.section, { marginTop: 18 }]}>
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Notes</Text>
          <Text>{receipt.notes || "No additional notes."}</Text>
          <Text style={{ marginTop: 8, fontWeight: "bold", marginBottom: 4 }}>Warranty</Text>
          <Text>{receipt.warrantyNotes || "No warranty notes."}</Text>
          <Text style={[styles.small, { marginTop: 10 }]}>Verify: {verifyUrl}</Text>
          <Text style={[styles.small, { marginTop: 3 }]}>{settings.footerText}</Text>
        </View>
      </Page>
    </Document>
  );
}
