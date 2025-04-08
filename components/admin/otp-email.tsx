import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface OTPEmailProps {
  otp: string;
  expiryTime?: string;
  userName?: string;
}

export const OTPEmail = ({
  otp,
  expiryTime = "24 hours",
  userName = "Admin",
}: OTPEmailProps) => {
  return (
    <Html>
      <Tailwind>
        <Head>
          <title>WEETOO Admin Access OTP Verification</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>
        <Preview>Your WEETOO Admin Access OTP Code: {otp}</Preview>
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] mx-auto p-[24px] max-w-[600px] shadow-sm">
            {/* Header with Logo */}
            <Section className="mb-[32px]">
              <Row>
                <Column align="center">
                  <table className="mx-auto">
                    <tr>
                      <td>
                        <div
                          style={{
                            textAlign: "center",
                            fontWeight: 600,
                            fontSize: "24px",
                            lineHeight: "1.2",
                          }}
                        >
                          <span style={{ color: "#e74c3c" }}>W</span>
                          <span>EE</span>
                          <span style={{ color: "#e74c3c" }}>T</span>
                          <span>OO</span>
                        </div>
                      </td>
                    </tr>
                  </table>
                </Column>
              </Row>
            </Section>

            <Heading className="text-[24px] font-bold text-gray-800 mt-[0px] mb-[24px] text-center">
              Admin Access Verification
            </Heading>

            <Text className="text-[16px] text-gray-600 mb-[12px]">
              Hello {userName},
            </Text>

            <Text className="text-[16px] text-gray-600 mb-[24px]">
              You&apos;ve requested access to the WEETOO admin panel. Please use
              the following One-Time Password (OTP) to verify your identity:
            </Text>

            <Section className="bg-gradient-to-r from-[#f8f9fa] to-[#f1f3f5] border border-gray-200 rounded-[8px] py-[24px] px-[24px] text-center mb-[24px]">
              <Text className="text-[32px] font-bold tracking-[8px] text-gray-800 m-0">
                {otp}
              </Text>
              <Text className="text-[14px] text-gray-500 mt-[8px] mb-0">
                Valid for {expiryTime}
              </Text>
            </Section>

            <Text className="text-[16px] text-gray-600 mb-[8px]">
              <strong>Important:</strong> This OTP will expire after{" "}
              {expiryTime} from the time of request.
            </Text>

            <Text className="text-[16px] text-gray-600 mb-[24px]">
              If you did not request this OTP, please ignore this email or
              contact your system administrator immediately as your account may
              be at risk.
            </Text>

            <Section className="bg-gray-50 rounded-[8px] p-[16px] border-l-[4px] border-blue-500 mb-[24px]">
              <Text className="text-[14px] text-gray-600 m-0">
                <strong>Security Tip:</strong> Never share your OTP with anyone,
                including WEETOO staff. Our team will never ask for your OTP.
              </Text>
            </Section>

            <Hr className="border-gray-200 my-[24px]" />

            <Text className="text-[14px] text-gray-500 mb-[8px]">
              This is an automated message. Please do not reply to this email.
            </Text>

            <Hr className="border-gray-200 my-[24px]" />

            <Section className="text-center">
              <Text className="text-[12px] text-gray-400 m-0">
                © {new Date().getFullYear()} WEETOO Technologies. All rights
                reserved.
              </Text>

              <Text className="text-[12px] text-gray-400 m-0">
                123 Business Street, Pune, India
              </Text>

              <Text className="text-[12px] text-gray-400 mt-[8px]">
                <a
                  href="https://weetoo-admin.com/unsubscribe"
                  className="text-gray-400"
                >
                  Unsubscribe
                </a>{" "}
                •
                <a
                  href="https://weetoo-admin.com/privacy"
                  className="text-gray-400 ml-[4px]"
                >
                  Privacy Policy
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
