import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";
import { formatMoney, formatDateFormatted } from "@/lib/invoice";

export interface InvoicePDFProps {
  number: string;
  sender: {
    name: string;
    email: string;
    phone: string;
    address: string;
    bankDetails: string;
    companyLogoUrl?: string;
    signatureUrl?: string;
  };
  client: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  projectName: string;
  issueDate: string;
  dueDate?: string | null;
  currency: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  subtotal: number;
  discount: number;
  taxRate: number;
  total: number;
  paymentMethod: string;
  notes: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1E293B",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 12,
    marginBottom: 12,
  },
  logo: {
    height: 38,
    width: "auto",
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#0F172A",
  },
  companySubtext: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  numberText: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 10,
    marginBottom: 12,
  },
  metaCol: {
    width: "32%",
  },
  labelCaps: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  billedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 12,
    marginBottom: 14,
  },
  billedCol: {
    width: "48%",
  },
  addressText: {
    fontSize: 9,
    color: "#475569",
    lineHeight: 1.35,
  },
  table: {
    width: "100%",
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    paddingBottom: 5,
    marginBottom: 5,
  },
  thItem: {
    width: "55%",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    textTransform: "uppercase",
  },
  thPrice: {
    width: "15%",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    textTransform: "uppercase",
    textAlign: "right",
  },
  thQty: {
    width: "10%",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    textTransform: "uppercase",
    textAlign: "right",
  },
  thTotal: {
    width: "20%",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    textTransform: "uppercase",
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 5,
    alignItems: "flex-start",
  },
  tdItem: {
    width: "55%",
    fontSize: 9,
    color: "#1E293B",
    paddingRight: 8,
  },
  tdPrice: {
    width: "15%",
    fontSize: 9,
    textAlign: "right",
    color: "#1E293B",
  },
  tdQty: {
    width: "10%",
    fontSize: 9,
    textAlign: "right",
    color: "#1E293B",
  },
  tdTotal: {
    width: "20%",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    color: "#0F172A",
  },
  paymentSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 12,
    marginBottom: 12,
  },
  paymentLeft: {
    width: "55%",
  },
  paymentRight: {
    width: "40%",
    alignItems: "flex-end",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 9,
    color: "#64748B",
  },
  summaryValue: {
    fontSize: 9,
    color: "#0F172A",
  },
  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#0F172A",
  },
  totalAmount: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
  },
  signatureImage: {
    height: 32,
    width: "auto",
    marginBottom: 6,
  },
  dueText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    marginBottom: 2,
  },
  instructionText: {
    fontSize: 8.5,
    color: "#64748B",
    lineHeight: 1.3,
  },
});

export function InvoicePDF({
  number,
  sender,
  client,
  projectName,
  issueDate,
  dueDate,
  currency,
  items,
  subtotal,
  discount,
  taxRate,
  total,
  paymentMethod,
  notes,
}: InvoicePDFProps) {
  const displayNum = number.startsWith("#") ? number : `#${number.replace(/^INV-/, "")}`;
  const cleanNotes = (notes || "").replace(/\[(Payment Method|Project):.*?\]/g, "").trim();

  return (
    <Document title={`Invoice-${displayNum.replace(/^#/, "")}`}>
      <Page size="A4" style={styles.page} wrap>
        {/* 1. Clean Header (Logo/Name on Left | NO. #0001 on Right — NO STATUS BADGE) */}
        <View style={styles.header}>
          <View>
            {sender.companyLogoUrl ? (
              <Image src={sender.companyLogoUrl} style={styles.logo} />
            ) : (
              <Text style={styles.companyName}>{sender.name || "DUELY STUDIO"}</Text>
            )}
            <Text style={styles.companySubtext}>{sender.email}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.numberText}>NO. {displayNum}</Text>
          </View>
        </View>

        {/* 2. Meta Row (3 Columns: INVOICE TO | DATE | PROJECT NAME) */}
        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={styles.labelCaps}>INVOICE TO</Text>
            <Text style={styles.metaValue}>{client.name || "Client Name"}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.labelCaps}>DATE</Text>
            <Text style={styles.metaValue}>{formatDateFormatted(issueDate)}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.labelCaps}>PROJECT NAME</Text>
            <Text style={styles.metaValue}>{projectName || "Website Redesign"}</Text>
          </View>
        </View>

        {/* 3. Billed To / From */}
        <View style={styles.billedRow}>
          <View style={styles.billedCol}>
            <Text style={styles.labelCaps}>BILLED TO</Text>
            <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", marginBottom: 2 }}>
              {client.name || "Client Name"}
            </Text>
            <Text style={styles.addressText}>{client.address}</Text>
            <Text style={styles.addressText}>{client.email}</Text>
            <Text style={styles.addressText}>{client.phone}</Text>
          </View>
          <View style={styles.billedCol}>
            <Text style={styles.labelCaps}>FROM</Text>
            <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", marginBottom: 2 }}>
              {sender.name}
            </Text>
            <Text style={styles.addressText}>{sender.email}</Text>
            <Text style={styles.addressText}>{sender.address}</Text>
            {sender.phone ? <Text style={styles.addressText}>{sender.phone}</Text> : null}
          </View>
        </View>

        {/* 4. Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.thItem}>ITEM</Text>
            <Text style={styles.thPrice}>PRICE</Text>
            <Text style={styles.thQty}>QTY</Text>
            <Text style={styles.thTotal}>TOTAL</Text>
          </View>
          {items.map((item, idx) => (
            <View key={idx} style={styles.tableRow} wrap={false}>
              <Text style={styles.tdItem}>{item.description}</Text>
              <Text style={styles.tdPrice}>{formatMoney(item.unit_price, currency)}</Text>
              <Text style={styles.tdQty}>{item.quantity}</Text>
              <Text style={styles.tdTotal}>
                {formatMoney(item.quantity * item.unit_price, currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* 5. Payment Method & Totals Breakdown */}
        <View style={styles.paymentSection} wrap={false}>
          <View style={styles.paymentLeft}>
            <Text style={styles.labelCaps}>PAYMENT METHOD</Text>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 5 }}>
              {paymentMethod || "Bank Transfer"}
            </Text>
            {sender.bankDetails ? (
              <>
                <Text style={styles.labelCaps}>BANK DETAILS</Text>
                <Text style={styles.addressText}>{sender.bankDetails}</Text>
              </>
            ) : null}
          </View>
          <View style={styles.paymentRight}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatMoney(subtotal, currency)}</Text>
            </View>
            {discount > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={styles.summaryValue}>− {formatMoney(discount, currency)}</Text>
              </View>
            ) : null}
            {taxRate > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax ({taxRate}%)</Text>
                <Text style={styles.summaryValue}>
                  {formatMoney((subtotal - discount) * (taxRate / 100), currency)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* 6. Invoice Total Box */}
        <View style={styles.totalBox} wrap={false}>
          <Text style={styles.totalLabel}>INVOICE TOTAL</Text>
          <Text style={styles.totalAmount}>{formatMoney(total, currency)}</Text>
        </View>

        {/* 7. Footer & Instructions (ONLY rendered if dueDate or signature or notes exist) */}
        {(dueDate || sender.signatureUrl || cleanNotes) ? (
          <View style={styles.footerSection} wrap={false}>
            {sender.signatureUrl ? (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.labelCaps}>AUTHORIZED SIGNATURE</Text>
                <Image src={sender.signatureUrl} style={styles.signatureImage} />
              </View>
            ) : null}

            {dueDate ? (
              <>
                <Text style={styles.dueText}>Payment due by {formatDateFormatted(dueDate)}</Text>
                <Text style={styles.instructionText}>
                  Please reference the invoice number ({displayNum}) when making payment.
                </Text>
              </>
            ) : null}

            {cleanNotes ? (
              <Text style={[styles.instructionText, { marginTop: 3 }]}>{cleanNotes}</Text>
            ) : null}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

/** Utility to generate PDF Blob and trigger immediate browser file download */
export async function downloadInvoicePDF(props: InvoicePDFProps) {
  const displayNum = props.number.startsWith("#")
    ? props.number
    : `#${props.number.replace(/^INV-/, "")}`;
  const filename = `Invoice-${displayNum}.pdf`;

  const blob = await pdf(<InvoicePDF {...props} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
