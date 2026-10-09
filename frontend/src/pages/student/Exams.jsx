import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FiArrowRight, FiBookOpen, FiCalendar } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";

import api from "../../services/api";

function Exams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (error) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [error]);

  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/exams");

        setExams(response.data.exams || []);
      } catch (err) {
        console.error("Exams loading error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load exams. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, []);

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
            Loading available exams...
          </Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box
      minH="calc(100vh - 76px)"
      bg="khaki.50"
      py={10}
    >
      <Container maxW="1280px">
        {/* Page Header */}
        <Box mb={8}>
          <Text
            fontSize="sm"
            fontWeight="800"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color="gold.600"
            mb={2}
          >
            Your Preparation
          </Text>

          <Heading
            fontSize={{ base: "2xl", md: "3xl" }}
            color="brand.900"
          >
            Explore Exams
          </Heading>

          <Text
            mt={2}
            maxW="680px"
            color="charcoal.600"
            fontSize="sm"
            lineHeight="1.7"
          >
            Choose the competitive examination you are
            preparing for and start building your path toward
            success.
          </Text>
        </Box>

        {/* Error */}
        {error && (
          <Box
            mb={6}
            p={4}
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            borderRadius="lg"
          >
            <Text color="red.700" fontSize="sm">
              {error}
            </Text>
          </Box>
        )}

        {/* Empty State */}
        {exams.length === 0 && !error ? (
          <Box
            bg="white"
            border="1px solid"
            borderColor="khaki.200"
            borderRadius="xl"
            p={10}
            textAlign="center"
            boxShadow="sm"
          >
            <FiBookOpen
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
              No exams available
            </Heading>

            <Text
              color="charcoal.500"
              fontSize="sm"
            >
              There are currently no active examinations
              available.
            </Text>
          </Box>
        ) : (
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={6}
          >
            {exams.map((exam) => (
              <ExamCard
                key={exam._id}
                exam={exam}
              />
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

function ExamCard({ exam }) {
  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    try {
      setStarting(true);
      await api.post(`/progress/exam/${exam._id}/initialize`);
    } catch (error) {
      if (error.response?.status !== 400) {
        console.error("Start preparation error:", error);
        return;
      }
    }
    window.location.href = `/exams/${exam._id}`;
  };


  const formattedDate = exam.expectedExamDate
    ? new Date(exam.expectedExamDate).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : "Date not announced";

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="khaki.200"
      borderRadius="xl"
      p={6}
      boxShadow="sm"
      transition="all 0.25s ease"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "md",
        borderColor: "gold.400",
      }}
    >
      <Flex
        justify="space-between"
        align="center"
        mb={5}
      >
        <Badge
          bg="gold.100"
          color="gold.800"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
        >
          {exam.category}
        </Badge>

        <Box
          w="10px"
          h="10px"
          borderRadius="full"
          bg="brand.600"
        />
      </Flex>

      <Heading
        fontSize="xl"
        color="brand.900"
        mb={3}
      >
        {exam.name}
      </Heading>

      <Text
        color="charcoal.600"
        fontSize="sm"
        lineHeight="1.7"
        minH="72px"
      >
        {exam.description ||
          "Prepare systematically with LakshyaPath."}
      </Text>

      <HStack
        mt={5}
        gap={2}
        color="charcoal.500"
      >
        <FiCalendar size={15} />

        <Text fontSize="xs">
          {formattedDate}
        </Text>
      </HStack>

      <Flex mt={6} gap={3} direction={{ base: "column", sm: "row" }}>
        <Button
          onClick={handleStart}
          loading={starting}
          loadingText="Starting..."
          flex="1"
          size="sm"
          bg="brand.700"
          color="white"
          _hover={{ bg: "brand.800" }}
        >
          Start Preparation
          <FiArrowRight />
        </Button>
        <Button
          as={RouterLink}
          to={`/exams/${exam._id}`}
          variant="outline"
          borderColor="brand.600"
          color="brand.700"
          size="sm"
        >
          View Exam
        </Button>
      </Flex>
    </Box>
  );
}

export default Exams;