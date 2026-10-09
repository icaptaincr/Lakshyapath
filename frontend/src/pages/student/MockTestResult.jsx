import { useEffect, useState } from "react";
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
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiHome,
  FiXCircle,
} from "react-icons/fi";

import api from "../../services/api";

function MockTestResult() {
  const {
    examId,
    testId,
    attemptId,
  } = useParams();

  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [test, setTest] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/attempts/review/${attemptId}`
        );

        console.log(
          "RESULT RESPONSE:",
          response.data
        );

        const data = response.data;

        setResult(
          data.attempt || data.result || null
        );

        setTest(data.test || null);
      } catch (error) {
        console.error(
          "Load result error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load test result."
        );
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      loadResult();
    }
  }, [attemptId]);

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <Flex
        minH="70vh"
        align="center"
        justify="center"
        bg="khaki.50"
      >
        <VStack gap={4}>
          <Spinner
            size="xl"
            color="brand.600"
            borderWidth="3px"
          />

          <Text color="charcoal.600">
            Loading your result...
          </Text>
        </VStack>
      </Flex>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error || !result) {
    return (
      <Flex
        minH="70vh"
        align="center"
        justify="center"
        bg="khaki.50"
        px={4}
      >
        <Box
          bg="white"
          border="1px solid"
          borderColor="red.200"
          borderRadius="xl"
          p={8}
          maxW="600px"
          w="100%"
          textAlign="center"
        >
          <Heading
            fontSize="xl"
            color="brand.900"
            mb={3}
          >
            Unable to load result
          </Heading>

          <Text
            color="red.600"
            fontSize="sm"
            mb={6}
          >
            {error ||
              "Test result was not found."}
          </Text>

          <Button
            onClick={() =>
              navigate(
                `/exams/${examId}/tests`
              )
            }
            bg="brand.700"
            color="white"
            _hover={{
              bg: "brand.800",
            }}
          >
            <FiArrowLeft />

            <Text ml={2}>
              Back to Mock Tests
            </Text>
          </Button>
        </Box>
      </Flex>
    );
  }

  const score =
    result.score ??
    result.totalScore ??
    0;

  const correctAnswers =
    result.correctAnswers ?? 0;

  const wrongAnswers =
    result.wrongAnswers ?? 0;

  const unanswered =
    result.unanswered ?? 0;

  const totalQuestions =
    test?.totalQuestions ??
    result.answers?.length ??
    0;

  const timeTaken =
    result.timeTaken ?? 0;

  const minutes = Math.floor(
    timeTaken / 60
  );

  const seconds = timeTaken % 60;

  return (
    <Box
      minH="calc(100vh - 76px)"
      bg="khaki.50"
      py={{ base: 8, md: 12 }}
    >
      <Container maxW="950px">

        {/* Header */}
        <Box
          bg="brand.900"
          color="white"
          borderRadius="2xl"
          p={{ base: 6, md: 10 }}
          mb={6}
          textAlign="center"
          boxShadow="md"
        >
          <Flex
            mx="auto"
            mb={5}
            w="72px"
            h="72px"
            borderRadius="full"
            bg="gold.500"
            color="brand.900"
            align="center"
            justify="center"
          >
            <FiCheckCircle size={36} />
          </Flex>

          <Text
            color="gold.300"
            fontSize="xs"
            fontWeight="800"
            letterSpacing="0.12em"
            mb={3}
          >
            TEST COMPLETED
          </Text>

          <Heading
            fontSize={{
              base: "2xl",
              md: "3xl",
            }}
          >
            {test?.title || "Mock Test Result"}
          </Heading>

          <Text
            mt={3}
            color="khaki.200"
          >
            Your mock test has been evaluated.
          </Text>
        </Box>

        {/* Score */}
        <Box
          bg="white"
          border="1px solid"
          borderColor="khaki.200"
          borderRadius="2xl"
          p={{ base: 6, md: 8 }}
          mb={6}
          textAlign="center"
          boxShadow="sm"
        >
          <Text
            fontSize="sm"
            color="charcoal.500"
            fontWeight="700"
            mb={2}
          >
            YOUR SCORE
          </Text>

          <Heading
            fontSize={{
              base: "4xl",
              md: "5xl",
            }}
            color="brand.900"
          >
            {score}
          </Heading>

          <Text
            color="charcoal.500"
            mt={2}
          >
            out of {test?.totalMarks ?? 0}
          </Text>
        </Box>

        {/* Statistics */}
        <SimpleGrid
          columns={{
            base: 1,
            sm: 2,
            md: 4,
          }}
          gap={4}
          mb={6}
        >
          {/* Correct */}
          <Box
            bg="white"
            border="1px solid"
            borderColor="green.200"
            borderRadius="xl"
            p={5}
            textAlign="center"
          >
            <Flex
              justify="center"
              mb={3}
              color="green.600"
            >
              <FiCheckCircle size={25} />
            </Flex>

            <Text
              fontSize="2xl"
              fontWeight="800"
              color="green.700"
            >
              {correctAnswers}
            </Text>

            <Text
              fontSize="sm"
              color="charcoal.500"
            >
              Correct
            </Text>
          </Box>

          {/* Wrong */}
          <Box
            bg="white"
            border="1px solid"
            borderColor="red.200"
            borderRadius="xl"
            p={5}
            textAlign="center"
          >
            <Flex
              justify="center"
              mb={3}
              color="red.600"
            >
              <FiXCircle size={25} />
            </Flex>

            <Text
              fontSize="2xl"
              fontWeight="800"
              color="red.700"
            >
              {wrongAnswers}
            </Text>

            <Text
              fontSize="sm"
              color="charcoal.500"
            >
              Wrong
            </Text>
          </Box>

          {/* Unanswered */}
          <Box
            bg="white"
            border="1px solid"
            borderColor="khaki.300"
            borderRadius="xl"
            p={5}
            textAlign="center"
          >
            <Flex
              justify="center"
              mb={3}
              color="gold.600"
            >
              <FiEye size={25} />
            </Flex>

            <Text
              fontSize="2xl"
              fontWeight="800"
              color="brand.700"
            >
              {unanswered}
            </Text>

            <Text
              fontSize="sm"
              color="charcoal.500"
            >
              Unanswered
            </Text>
          </Box>

          {/* Time */}
          <Box
            bg="white"
            border="1px solid"
            borderColor="khaki.300"
            borderRadius="xl"
            p={5}
            textAlign="center"
          >
            <Flex
              justify="center"
              mb={3}
              color="brand.700"
            >
              <FiClock size={25} />
            </Flex>

            <Text
              fontSize="2xl"
              fontWeight="800"
              color="brand.700"
            >
              {minutes}:
              {String(seconds).padStart(
                2,
                "0"
              )}
            </Text>

            <Text
              fontSize="sm"
              color="charcoal.500"
            >
              Time Taken
            </Text>
          </Box>
        </SimpleGrid>

        {/* Question count */}
        <Box
          bg="white"
          border="1px solid"
          borderColor="khaki.200"
          borderRadius="xl"
          p={5}
          mb={6}
        >
          <Flex
            justify="space-between"
            align="center"
          >
            <Text
              color="charcoal.600"
              fontWeight="600"
            >
              Total Questions
            </Text>

            <Text
              color="brand.900"
              fontWeight="800"
            >
              {totalQuestions}
            </Text>
          </Flex>
        </Box>

        {/* Actions */}
        <Flex
          justify="center"
          gap={3}
          wrap="wrap"
        >
          <Button
            as={RouterLink}
            to={`/exams/${examId}/tests`}
            variant="outline"
            borderColor="brand.600"
            color="brand.700"
          >
            <FiArrowLeft />

            <Text ml={2}>
              Mock Tests
            </Text>
          </Button>

          <Button
            as={RouterLink}
            to={`/exams/${examId}`}
            bg="brand.700"
            color="white"
            _hover={{
              bg: "brand.800",
            }}
          >
            <FiHome />

            <Text ml={2}>
              Back to Exam
            </Text>
          </Button>
        </Flex>
      </Container>
    </Box>
  );
}

export default MockTestResult;