import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiLayers,
} from "react-icons/fi";

import api from "../../services/api";

function SubjectDetails() {
  const { examId, subjectId } = useParams();

  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubjectDetails = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Exam ID:", examId);
        console.log("Subject ID:", subjectId);

        const [subjectResponse, topicResponse] = await Promise.all([
          api.get(`/subjects/exam/${examId}`),
          api.get(`/topics/subject/${subjectId}`),
        ]);

        const subjects = subjectResponse.data.subjects || [];

        const currentSubject = subjects.find(
          (item) => item._id === subjectId
        );

        setSubject(currentSubject || null);
        setTopics(topicResponse.data.topics || []);
      } catch (error) {
        console.error("Subject details error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load subject details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (examId && subjectId) {
      loadSubjectDetails();
    } else {
      setLoading(false);
      setError("Exam or subject ID is missing");
    }
  }, [examId, subjectId]);

  if (loading) {
    return (
      <Flex minH="70vh" align="center" justify="center">
        <VStack gap={4}>
          <Spinner size="lg" color="brand.600" borderWidth="3px" />
          <Text color="charcoal.600">
            Loading subject...
          </Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Container maxW="1100px" py={16}>
        <Box
          bg="white"
          border="1px solid"
          borderColor="red.200"
          borderRadius="14px"
          p={8}
          textAlign="center"
        >
          <Text color="red.600" fontWeight="600" mb={5}>
            {error}
          </Text>

          <Button
            as={RouterLink}
            to={`/exams/${examId}`}
            variant="outline"
            borderColor="brand.600"
            color="brand.700"
          >
            Back to Exam
          </Button>
        </Box>
      </Container>
    );
  }

  if (!subject) {
    return (
      <Container maxW="1100px" py={16}>
        <Box
          bg="white"
          border="1px solid"
          borderColor="khaki.200"
          borderRadius="14px"
          p={8}
          textAlign="center"
        >
          <Text color="charcoal.600" mb={5}>
            Subject not found.
          </Text>

          <Button
            as={RouterLink}
            to={`/exams/${examId}`}
            variant="outline"
            borderColor="brand.600"
            color="brand.700"
          >
            Back to Exam
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        bg="brand.900"
        color="white"
        borderBottom="4px solid"
        borderColor="gold.500"
      >
        <Container maxW="1100px" py={{ base: 10, md: 14 }}>
          <Button
            as={RouterLink}
            to={`/exams/${examId}`}
            variant="ghost"
            color="khaki.100"
            mb={6}
            px={0}
            _hover={{
              bg: "transparent",
              color: "gold.300",
            }}
          >
            <FiArrowLeft />
            <Text ml={2}>Back to Exam</Text>
          </Button>

          <Badge
            bg="gold.500"
            color="brand.900"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="800"
            letterSpacing="0.06em"
            mb={4}
          >
            SUBJECT
          </Badge>

          <Heading
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="800"
            mb={3}
          >
            {subject.name}
          </Heading>

          <Text
            color="khaki.100"
            maxW="720px"
            lineHeight="1.8"
            fontSize={{ base: "sm", md: "md" }}
          >
            {subject.description ||
              "Build your preparation step by step through focused topics and practice."}
          </Text>
        </Container>
      </Box>

      {/* Topics */}
      <Container maxW="1100px" py={{ base: 10, md: 14 }}>
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
          mb={8}
        >
          <Box>
            <Heading
              color="brand.900"
              fontSize={{ base: "xl", md: "2xl" }}
              mb={2}
            >
              Topics
            </Heading>

            <Text color="charcoal.600" fontSize="sm">
              Follow the path topic by topic and strengthen your preparation.
            </Text>
          </Box>

          <HStack
            bg="white"
            border="1px solid"
            borderColor="khaki.200"
            borderRadius="full"
            px={4}
            py={2}
          >
            <FiLayers color="#526B48" />
            <Text
              fontSize="sm"
              fontWeight="700"
              color="brand.800"
            >
              {topics.length}{" "}
              {topics.length === 1 ? "Topic" : "Topics"}
            </Text>
          </HStack>
        </Flex>

        {topics.length === 0 ? (
          <Box
            bg="white"
            border="1px solid"
            borderColor="khaki.200"
            borderRadius="14px"
            p={10}
            textAlign="center"
          >
            <FiBookOpen
              size={32}
              style={{ margin: "0 auto 16px" }}
            />

            <Heading
              color="brand.900"
              fontSize="lg"
              mb={2}
            >
              No topics available yet
            </Heading>

            <Text color="charcoal.600" fontSize="sm">
              Topics for this subject will appear here once they are added.
            </Text>
          </Box>
        ) : (
          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            gap={5}
          >
            {topics.map((topic, index) => (
              <Box
                key={topic._id}
                bg="white"
                border="1px solid"
                borderColor="khaki.200"
                borderRadius="14px"
                p={6}
                boxShadow="sm"
                transition="all 0.25s ease"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "md",
                  borderColor: "gold.400",
                }}
              >
                <Flex
                  align="flex-start"
                  justify="space-between"
                  gap={4}
                >
                  <HStack align="flex-start">
                    <Box
                      minW="38px"
                      h="38px"
                      borderRadius="10px"
                      bg="brand.50"
                      color="brand.700"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="800"
                    >
                      {index + 1}
                    </Box>

                    <Box>
                      <Heading
                        color="brand.900"
                        fontSize="lg"
                        mb={2}
                      >
                        {topic.name}
                      </Heading>

                      <Text
                        color="charcoal.600"
                        fontSize="sm"
                        lineHeight="1.7"
                      >
                        {topic.description ||
                          "Study this topic and practice questions to improve your preparation."}
                      </Text>
                    </Box>
                  </HStack>

                  <FiCheckCircle
                    color="#526B48"
                    size={20}
                  />
                </Flex>

                <Button
                  as={RouterLink}
                  to={`/exams/${examId}/subjects/${subjectId}/topics/${topic._id}`}
                  mt={6}
                  width="100%"
                  size="sm"
                  bg="brand.700"
                  color="white"
                  _hover={{
                    bg: "brand.800",
                    transform: "translateY(-1px)",
                  }}
                >
                  Open Topic
                  <FiArrowRight style={{ marginLeft: "8px" }} />
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}

export default SubjectDetails;