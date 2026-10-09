import { useState } from "react";
import {
  Link as RouterLink,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";

import {
  FiArrowLeft,
  FiPlay,
  FiClock,
} from "react-icons/fi";

import api from "../../services/api";

function MockTestStart() {
  const { examId, testId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        `/attempts/start/${testId}`
      );

      console.log(
        "START TEST RESPONSE:",
        response.data
      );

      /*
       * Backend returns:
       *
       * attempt: {
       *   id: "...",
       *   testId: "...",
       *   startedAt: "...",
       *   status: "inProgress"
       * }
       */

      const attemptId =
        response.data?.attempt?.id ||
        response.data?.attempt?._id ||
        response.data?.attemptId;

      if (!attemptId) {
        console.error(
          "Attempt ID missing from response:",
          response.data
        );

        throw new Error(
          "Attempt ID was not received."
        );
      }

      console.log(
        "ATTEMPT ID:",
        attemptId
      );

      navigate(
        `/exams/${examId}/tests/${testId}/attempt/${attemptId}`,
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Start test error:",
        error
      );

      /*
       * If an active attempt already exists,
       * backend returns:
       *
       * attemptId: "..."
       *
       * Continue that attempt instead of
       * creating another one.
       */

      const existingAttemptId =
        error.response?.data?.attemptId;

      if (existingAttemptId) {
        console.log(
          "Existing attempt ID:",
          existingAttemptId
        );

        navigate(
          `/exams/${examId}/tests/${testId}/attempt/${existingAttemptId}`,
          {
            replace: true,
          }
        );

        return;
      }

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to start the mock test."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="calc(100vh - 76px)"
      bg="khaki.50"
      py={{ base: 8, md: 12 }}
    >
      <Container maxW="850px">

        {/* Back */}
        <Button
          as={RouterLink}
          to={`/exams/${examId}/tests`}
          variant="ghost"
          color="brand.700"
          mb={6}
          px={0}
          _hover={{
            bg: "transparent",
            color: "gold.600",
          }}
        >
          <FiArrowLeft />
          <Text ml={2}>
            Back to Mock Tests
          </Text>
        </Button>

        {/* Start Card */}
        <Box
          bg="white"
          border="1px solid"
          borderColor="khaki.200"
          borderRadius="2xl"
          boxShadow="md"
          p={{ base: 6, md: 10 }}
          textAlign="center"
        >
          {/* Icon */}
          <Flex
            mx="auto"
            mb={6}
            w="70px"
            h="70px"
            borderRadius="full"
            bg="brand.50"
            color="brand.700"
            align="center"
            justify="center"
          >
            <FiClock size={32} />
          </Flex>

          <Heading
            color="brand.900"
            fontSize={{
              base: "2xl",
              md: "3xl",
            }}
            mb={4}
          >
            Ready to Start?
          </Heading>

          <Text
            color="charcoal.600"
            fontSize="md"
            maxW="600px"
            mx="auto"
            lineHeight="1.8"
            mb={8}
          >
            Your mock test attempt will start when
            you click the button below. The timer
            will begin immediately.
          </Text>

          {/* Error */}
          {error && (
            <Box
              bg="red.50"
              border="1px solid"
              borderColor="red.200"
              borderRadius="lg"
              p={4}
              mb={6}
              textAlign="left"
            >
              <Text
                color="red.700"
                fontSize="sm"
                fontWeight="600"
              >
                {error}
              </Text>
            </Box>
          )}

          {/* Instructions */}
          <VStack
            align="stretch"
            gap={3}
            mb={8}
            textAlign="left"
            maxW="520px"
            mx="auto"
          >
            <Text
              fontSize="sm"
              color="charcoal.600"
              fontWeight="700"
            >
              Important:
            </Text>

            <Text
              fontSize="sm"
              color="charcoal.600"
            >
              • The test timer starts immediately.
            </Text>

            <Text
              fontSize="sm"
              color="charcoal.600"
            >
              • Your answers are submitted to the
              server.
            </Text>

            <Text
              fontSize="sm"
              color="charcoal.600"
            >
              • Do not refresh or close the page
              while taking the test.
            </Text>

            <Text
              fontSize="sm"
              color="charcoal.600"
            >
              • The server will automatically handle
              expiry.
            </Text>
          </VStack>

          {/* Start */}
          <Button
            onClick={handleStart}
            size="lg"
            bg="brand.700"
            color="white"
            loading={loading}
            loadingText="Starting Test..."
            px={10}
            _hover={{
              bg: "brand.800",
              transform: "translateY(-1px)",
            }}
          >
            <FiPlay />
            <Text ml={2}>
              Start Mock Test
            </Text>
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default MockTestStart;