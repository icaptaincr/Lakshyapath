import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
} from "@chakra-ui/react";

import api from "../../services/api";

const Payment = () => {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const response = await api.get(`/plans/${planId}`);

        if (response.data?.success) {
          setPlan(response.data.plan);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load payment plan."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [planId]);

  const handlePayment = async () => {
    try {
      setPaying(true);
      setError("");

      if (!window.Razorpay) {
        setError(
          "Razorpay Checkout failed to load. Please refresh the page."
        );
        return;
      }

      // Create order from backend
      const response = await api.post("/payments/order", {
        planId,
      });

      const data = response.data;

      if (!data.success) {
        throw new Error(
          data.message || "Failed to create payment order."
        );
      }

      const options = {
        key: data.razorpayKeyId,

        amount: data.order.amount,

        currency: data.order.currency,

        name: "LakshyaPath",

        description: `${data.plan.examName} - ${data.plan.name} Plan`,

        order_id: data.order.id,

        handler: async function (paymentResponse) {
          try {
            // Verify payment on backend
            const verifyResponse = await api.post(
              "/payments/verify",
              {
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature,
              }
            );

            if (verifyResponse.data?.success) {
              navigate(
                `/payment/success/${verifyResponse.data.payment.id}`
              );
            } else {
              setError(
                verifyResponse.data?.message ||
                  "Payment verification failed."
              );
            }
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Payment verification failed."
            );
          }
        },

        prefill: {
          name:
            localStorage.getItem("lakshyapath_user_name") ||
            "",
        },

        theme: {
          color: "#3F4F3A",
        },

        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Razorpay payment failed:",
            response.error
          );

          setError(
            response.error?.description ||
              "Payment failed. Please try again."
          );

          setPaying(false);
        }
      );

      razorpay.open();
    } catch (err) {
      console.error("Payment error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start payment."
      );

      setPaying(false);
    }
  };

  if (loading) {
    return (
      <Box
        minH="70vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box
      maxW="700px"
      mx="auto"
      px={{ base: 4, md: 8 }}
      py={10}
    >
      <VStack gap={6} align="stretch">
        <Box textAlign="center">
          <Text
            fontSize="sm"
            fontWeight="bold"
            color="gray.500"
            letterSpacing="wide"
          >
            LAKSHYAPATH PREMIUM
          </Text>

          <Heading
            mt={2}
            color="#26352A"
          >
            Complete Your Payment
          </Heading>
        </Box>

        {error && (
          <Box
            p={4}
            borderRadius="md"
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
          >
            <Text color="red.600">
              {error}
            </Text>
          </Box>
        )}

        {plan && (
          <Box
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor="#D6C8A8"
            bg="#F7F3E8"
            boxShadow="md"
          >
            <VStack align="stretch" gap={4}>
              <Box>
                <Text
                  fontSize="sm"
                  color="gray.600"
                >
                  EXAM
                </Text>

                <Heading
                  size="md"
                  color="#26352A"
                >
                  {plan.examId?.name || "Premium Plan"}
                </Heading>
              </Box>

              <HStack
                justify="space-between"
                align="center"
              >
                <Box>
                  <Text
                    fontSize="sm"
                    color="gray.600"
                  >
                    PLAN
                  </Text>

                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                  >
                    {plan.name}
                  </Text>
                </Box>

                <Box textAlign="right">
                  {plan.offerPrice !== null &&
                    plan.offerPrice !== undefined && (
                      <Text
                        textDecoration="line-through"
                        color="gray.500"
                        fontSize="sm"
                      >
                        ₹{plan.price}
                      </Text>
                    )}

                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color="#A27B1A"
                  >
                    ₹
                    {plan.offerPrice ??
                      plan.price}
                  </Text>
                </Box>
              </HStack>

              <Text color="gray.600">
                Duration: {plan.durationDays} days
              </Text>

              {plan.offerName && (
                <Box
                  px={3}
                  py={2}
                  borderRadius="md"
                  bg="#E5D7A7"
                >
                  <Text
                    fontWeight="bold"
                    color="#26352A"
                  >
                    {plan.offerName}
                  </Text>
                </Box>
              )}

              <Box>
                <Text
                  fontWeight="bold"
                  mb={2}
                >
                  Included Features
                </Text>

                <VStack
                  align="stretch"
                  gap={1}
                >
                  {(plan.features || []).map(
                    (feature, index) => (
                      <Text key={index}>
                        ✓ {feature}
                      </Text>
                    )
                  )}
                </VStack>
              </Box>
            </VStack>
          </Box>
        )}

        <Button
  size="lg"
  bg="#3F4F3A"
  color="white"
  _hover={{
    bg: "#2F3C2C",
  }}
  onClick={handlePayment}
  disabled={paying}
>
  {paying ? "Opening Razorpay..." : "Pay Now"}
</Button>

        <Text
          textAlign="center"
          fontSize="sm"
          color="gray.500"
        >
          Secure payment powered by Razorpay
        </Text>
      </VStack>
    </Box>
  );
};

export default Payment;