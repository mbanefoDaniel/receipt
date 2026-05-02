import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://raw.githubusercontent.com/google/fonts/main/apache/roboto/Roboto-Regular.ttf",
      fontWeight: "normal"
    },
    {
      src: "https://raw.githubusercontent.com/google/fonts/main/apache/roboto/Roboto-Bold.ttf",
      fontWeight: "bold"
    }
  ]
});

type MinimalTemplateProps = {
  businessName: string;
  footerText: string;
  receiptNumber: string;
  issuedAt: string;
  customerName: string;
  total: number;
};

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 11, fontFamily: "Roboto" },
  heading: { fontSize: 22, marginBottom: 10, fontWeight: 700 },
  muted: { color: "#64748b", marginBottom: 6 },
  total: { marginTop: 18, fontSize: 18, fontWeight: 700 }
});

export function ReceiptPdfTemplateMinimal({
  businessName,
  footerText,
  receiptNumber,
  issuedAt,
  customerName,
  total
}: MinimalTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>{businessName}</Text>
        <Text style={styles.muted}>Receipt #{receiptNumber}</Text>
        <Text style={styles.muted}>Date: {new Date(issuedAt).toLocaleString()}</Text>
        <View style={{ marginTop: 12 }}>
          <Text>Customer: {customerName}</Text>
          <Text style={styles.total}>Total: ₦{total.toLocaleString()}</Text>
        </View>
        <Text style={{ marginTop: 36, color: "#94a3b8" }}>{footerText}</Text>
      </Page>
    </Document>
  );
}
