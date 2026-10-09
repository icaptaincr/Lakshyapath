import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react";

import api from "../../services/api";

const PaymentSuccess = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayment = async () => {
      try {
        const response = await api.get("/payments/my-payments");

        const payments = response.data?.payments || [];

        const foundPayment = payments.find(
          (item) => item._id === paymentId
        );

        if (foundPayment) {
          setPayment(foundPayment);
        } else {
          setError("Payment record not found.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load payment details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [paymentId]);

  const downloadReceipt = async () => {
    try {
      setDownloading(true);
      setError("");

      const response = await api.get(
        `/payments/receipt/${paymentId}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `LakshyaPath-Receipt-${payment?.razorpayPaymentId || paymentId}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download receipt.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Box
        minH="70vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box
      maxW="650px"
      mx="auto"
      px={4}
      py={12}
    >
      <VStack
        gap={6}
        textAlign="center"
      >
        <Box
          w="90px"
          h="90px"
          borderRadius="full"
          bg="#3F4F3A"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text
            fontSize="45px"
            color="white"
          >
            ✓
          </Text>
        </Box>

        <Heading
          color="#26352A"
        >
          Payment Successful!
        </Heading>

        <Text color="gray.600">
          Your LakshyaPath Premium payment has
          been successfully verified.
        </Text>

        {payment && (
          <Box
            w="100%"
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor="#D6C8A8"
            bg="#F7F3E8"
            textAlign="left"
          >
            <VStack
              align="stretch"
              gap={3}
            >
              <Text>
                <strong>Exam:</strong>{" "}
                {payment.examId?.name || "-"}
              </Text>

              <Text>
                <strong>Plan:</strong>{" "}
                {payment.planName}
              </Text>

              <Text>
                <strong>Amount Paid:</strong>{" "}
                ₹{payment.amount}
              </Text>

              <Text>
                <strong>Payment Status:</strong>{" "}
                <span style={{ color: "green" }}>
                  PAID
                </span>
              </Text>

              <Text>
                <strong>Razorpay Payment ID:</strong>{" "}
                {payment.razorpayPaymentId}
              </Text>

              <Text>
                <strong>Payment Date:</strong>{" "}
                {payment.paymentDate
                  ? new Date(
                      payment.paymentDate
                    ).toLocaleString("en-IN")
                  : "-"}
              </Text>
            </VStack>
          </Box>
        )}

        {error && (
          <Box
            w="100%"
            p={4}
            bg="red.50"
            borderRadius="md"
          >
            <Text color="red.600">
              {error}
            </Text>
          </Box>
        )}

        <VStack
          w="100%"
          gap={3}
        >
          <Button
            w="100%"
            bg="#3F4F3A"
            color="white"
            _hover={{
              bg: "#2F3C2C",
            }}
            onClick={downloadReceipt}
            disabled={downloading}
          >
            {downloading
              ? "Generating Receipt..."
              : "Download Payment Receipt"}
          </Button>

          <Button
            w="100%"
            variant="outline"
            borderColor="#3F4F3A"
            color="#3F4F3A"
            onClick={() => navigate("/exams")}
          >
            Continue to Exams
          </Button>
        </VStack>

        <Text
          fontSize="sm"
          color="gray.500"
        >
          Discipline. Preparation. Consistency.
          Achievement.
        </Text>
      </VStack>
    </Box>
  );
};

export default PaymentSuccess;