import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";

import {
  FiArrowLeft,
  FiClock,
  FiFileText,
  FiPlay,
} from "react-icons/fi";

import api from "../../services/api";

function MockTests() {
  const { examId } = useParams();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTests = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/tests");

        setTests(response.data.tests || []);
      } catch (error) {
        console.error("Mock tests error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load mock tests"
        );
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      loadTests();
    }
  }, [examId]);

  if (loading) {
    return (
      <Flex
        minH="70vh"
        align="center"
        justify="center"
      >
        <VStack gap={4}>
          <Spinner
            size="lg"
            color="brand.600"
            borderWidth="3px"
          />

          <Text color="charcoal.600">
            Loading mock tests...
          </Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box bg="khaki.50" minH="calc(100vh - 76px)">
      {/* Header */}
      <Box
        bg="brand.900"
        color="white"
        borderBottom="4px solid"
        borderColor="gold.500"
      >
        <Container
          maxW="1000px"
          py={{ base: 8, md: 12 }}
        >
          <Button
            as={RouterLink}
            to={`/exams/${examId}`}
            variant="ghost"
            color="khaki.100"
            mb={5}
            px={0}
            _hover={{
              bg: "transparent",
              color: "gold.300",
            }}
          >
            <FiArrowLeft />
            <Text ml={2}>Back to Exam</Text>
          </Button>

          <Heading
            fontSize={{ base: "2xl", md: "3xl" }}
            mb={3}
          >
            Mock Tests
          </Heading>

          <Text
            color="khaki.100"
            fontSize="sm"
          >
            Test your preparation under exam-like conditions.
          </Text>
        </Container>
      </Box>

      {/* Tests */}
      <Container
        maxW="1000px"
        py={{ base: 8, md: 12 }}
      >
        {error ? (
          <Box
            bg="white"
            border="1px solid"
            borderColor="red.200"
            borderRadius="14px"
            p={8}
            textAlign="center"
          >
            <Text
              color="red.600"
              fontWeight="600"
            >
              {error}
            </Text>
          </Box>
        ) : tests.length === 0 ? (
          <Box
            bg="white"
            border="1px dashed"
            borderColor="khaki.300"
            borderRadius="14px"
            p={10}
            textAlign="center"
          >
            <FiFileText
              size={36}
              style={{
                margin: "0 auto 16px",
              }}
            />

            <Heading
              fontSize="lg"
              color="brand.900"
              mb={2}
            >
              No Mock Tests Available
            </Heading>

            <Text color="charcoal.500">
              Mock tests for this exam will appear here.
            </Text>
          </Box>
        ) : (
          <VStack
            gap={5}
            align="stretch"
          >
            {tests.map((test) => (
              <Box
                key={test._id}
                bg="white"
                border="1px solid"
                borderColor="khaki.200"
                borderRadius="16px"
                p={{ base: 5, md: 7 }}
                boxShadow="sm"
                transition="all 0.2s ease"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                  borderColor: "gold.400",
                }}
              >
                <Flex
                  justify="space-between"
                  align={{
                    base: "flex-start",
                    md: "center",
                  }}
                  direction={{
                    base: "column",
                    md: "row",
                  }}
                  gap={5}
                >
                  <Box flex="1">
                    <Badge
                      bg="brand.50"
                      color="brand.700"
                      mb={3}
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      MOCK TEST
                    </Badge>

                    <Heading
                      fontSize="lg"
                      color="brand.900"
                      mb={2}
                    >
                      {test.title}
                    </Heading>

                    <Text
                      color="charcoal.500"
                      fontSize="sm"
                      mb={4}
                    >
                      {test.description ||
                        "Practice with this mock test and evaluate your preparation."}
                    </Text>

                    <Flex
                      gap={5}
                      wrap="wrap"
                      fontSize="sm"
                      color="charcoal.600"
                    >
                      <Flex
                        align="center"
                        gap={2}
                      >
                        <FiFileText />
                        {test.totalQuestions} Questions
                      </Flex>

                      <Flex
                        align="center"
                        gap={2}
                      >
                        <FiClock />
                        {test.duration} Minutes
                      </Flex>

                      <Text>
                        {test.totalMarks} Marks
                      </Text>
                    </Flex>
                  </Box>

                  <Button
                    as={RouterLink}
                    to={`/exams/${examId}/tests/${test._id}/start`}
                    bg="brand.700"
                    color="white"
                    px={6}
                    _hover={{
                      bg: "brand.800",
                    }}
                  >
                    <FiPlay />
                    <Text ml={2}>Start Test</Text>
                  </Button>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}
      </Container>
    </Box>
  );
}

export default MockTests;