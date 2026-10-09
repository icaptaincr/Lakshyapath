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
  Progress,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

import api from "../../services/api";

function TopicDetails() {
  const { examId, subjectId, topicId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [topicDescription, setTopicDescription] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/questions/topic/${topicId}`
        );

        const loadedQuestions = response.data.questions || [];

        setQuestions(loadedQuestions);

        if (loadedQuestions.length > 0) {
          setTopicName(loadedQuestions[0].topicId?.name || "");
        }
      } catch (error) {
        console.error("Topic questions error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load practice questions"
        );
      } finally {
        setLoading(false);
      }
    };

    if (topicId) {
      loadQuestions();
    } else {
      setLoading(false);
      setError("Topic ID is missing");
    }
  }, [topicId]);

  const currentQuestion = questions[currentIndex];

  const handleSelectAnswer = (index) => {
    if (submitted) return;

    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = async () => {
  if (selectedAnswer === null || checkingAnswer) return;

  try {
    setCheckingAnswer(true);
    setError("");

    const response = await api.post(
      `/questions/${currentQuestion._id}/check-answer`,
      {
        selectedAnswer,
      }
    );

    setAnswerResult(response.data.result);
    setSubmitted(true);
  } catch (error) {
    console.error("Check answer error:", error);

    setError(
      error.response?.data?.message ||
        "Unable to check answer"
    );
  } finally {
    setCheckingAnswer(false);
  }
};

  const handleNextQuestion = () => {
  if (currentIndex < questions.length - 1) {
    setCurrentIndex((previous) => previous + 1);
    setSelectedAnswer(null);
    setSubmitted(false);
    setAnswerResult(null);
    setError("");
  }
};

  const handleCompleteTopic = async () => {
  try {
    setError("");

    await api.put(
      `/progress/exam/${examId}/topic/${topicId}/complete`
    );

    setCompleted(true);

    // Show success popup
    setShowSuccessToast(true);

    // Automatically hide after 3 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  } catch (error) {
    console.error("Complete topic error:", error);

    setError(
      error.response?.data?.message ||
        "Unable to update topic progress"
    );
  }
};

  const getOptionState = (index) => {
  if (!submitted) {
    return selectedAnswer === index
      ? {
          bg: "brand.50",
          borderColor: "brand.600",
          color: "brand.900",
        }
      : {
          bg: "white",
          borderColor: "khaki.200",
          color: "charcoal.700",
        };
  }

  if (index === answerResult?.correctAnswer) {
    return {
      bg: "green.50",
      borderColor: "green.500",
      color: "green.800",
    };
  }

  if (
    index === selectedAnswer &&
    index !== answerResult?.correctAnswer
  ) {
    return {
      bg: "red.50",
      borderColor: "red.400",
      color: "red.800",
    };
  }

  return {
    bg: "white",
    borderColor: "khaki.200",
    color: "charcoal.600",
  };
};

  if (loading) {
    return (
      <Flex minH="70vh" align="center" justify="center">
        <VStack gap={4}>
          <Spinner
            size="lg"
            color="brand.600"
            borderWidth="3px"
          />
          <Text color="charcoal.600">
            Loading practice questions...
          </Text>
        </VStack>
      </Flex>
    );
  }

  if (error && questions.length === 0) {
    return (
      <Container maxW="1000px" py={16}>
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
            to={`/exams/${examId}/subjects/${subjectId}`}
            variant="outline"
            borderColor="brand.600"
            color="brand.700"
          >
            <FiArrowLeft />
            <Text ml={2}>Back to Subject</Text>
          </Button>
        </Box>
      </Container>
    );
  }

  if (questions.length === 0) {
    return (
      <Container maxW="1000px" py={16}>
        <Box
          bg="white"
          border="1px solid"
          borderColor="khaki.200"
          borderRadius="14px"
          p={10}
          textAlign="center"
        >
          <FiBookOpen
            size={34}
            style={{ margin: "0 auto 16px" }}
          />

          <Heading
            color="brand.900"
            fontSize="xl"
            mb={3}
          >
            No practice questions yet
          </Heading>

          <Text color="charcoal.600" mb={6}>
            Questions for this topic will appear here once they
            are added.
          </Text>

          <Button
            as={RouterLink}
            to={`/exams/${examId}/subjects/${subjectId}`}
            variant="outline"
            borderColor="brand.600"
            color="brand.700"
          >
            <FiArrowLeft />
            <Text ml={2}>Back to Subject</Text>
          </Button>
        </Box>
      </Container>
    );
  }

  const progressValue =
    ((currentIndex + 1) / questions.length) * 100;

  const isCorrect =
  submitted && answerResult?.isCorrect;

  return (
  <Box>

    {/* SUCCESS POPUP */}
    {showSuccessToast && (
      <Box
        position="fixed"
        top="90px"
        right="30px"
        zIndex="9999"
        bg="brand.900"
        color="white"
        px={5}
        py={4}
        borderRadius="14px"
        boxShadow="0 10px 30px rgba(0,0,0,0.25)"
        borderLeft="5px solid"
        borderColor="gold.500"
        minW="320px"
        maxW="380px"
      >
        <Flex align="center" gap={3}>
          <Box
            bg="gold.500"
            color="brand.900"
            w="38px"
            h="38px"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="xl"
            fontWeight="bold"
            flexShrink={0}
          >
            ✓
          </Box>

          <Box>
            <Text
              fontWeight="800"
              fontSize="md"
              color="gold.300"
            >
              Topic Completed!
            </Text>

            <Text
              fontSize="sm"
              color="whiteAlpha.800"
              mt={1}
            >
              Your progress has been updated successfully.
            </Text>
          </Box>
        </Flex>
      </Box>
    )}

    {/* Header */}
      <Box
        bg="brand.900"
        color="white"
        borderBottom="4px solid"
        borderColor="gold.500"
      >
        <Container maxW="1000px" py={{ base: 8, md: 12 }}>
          <Button
            as={RouterLink}
            to={`/exams/${examId}/subjects/${subjectId}`}
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
            <Text ml={2}>Back to Subject</Text>
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
            PRACTICE
          </Badge>

          <Heading
            fontSize={{ base: "2xl", md: "3xl" }}
            mb={3}
          >
            {topicName || "Practice Questions"}
          </Heading>

          <Text color="khaki.100" fontSize="sm">
            Test your understanding and strengthen your preparation.
          </Text>
        </Container>
      </Box>

      <Container maxW="1000px" py={{ base: 8, md: 12 }}>
        {/* Progress */}
        <Box mb={8}>
          <Flex justify="space-between" mb={2}>
            <Text
              fontSize="sm"
              fontWeight="700"
              color="brand.800"
            >
              Question {currentIndex + 1} of {questions.length}
            </Text>

            <Text
              fontSize="sm"
              color="charcoal.600"
            >
              {Math.round(progressValue)}%
            </Text>
          </Flex>

          <Progress.Root
            value={progressValue}
            size="sm"
            colorPalette="green"
            borderRadius="full"
          >
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>

        {/* Question */}
        <Box
          bg="white"
          border="1px solid"
          borderColor="khaki.200"
          borderRadius="16px"
          p={{ base: 5, md: 8 }}
          boxShadow="sm"
        >
          <HStack
            justify="space-between"
            align="flex-start"
            mb={6}
          >
            <Badge
              colorPalette="green"
              variant="subtle"
              px={3}
              py={1}
              borderRadius="full"
            >
              Question {currentIndex + 1}
            </Badge>

            <Text
              fontSize="sm"
              fontWeight="700"
              color="gold.600"
            >
              {currentQuestion.marks || 0} Marks
            </Text>
          </HStack>

          <Heading
            color="brand.900"
            fontSize={{ base: "lg", md: "2xl" }}
            lineHeight="1.5"
            mb={8}
          >
            {currentQuestion.questionText}
          </Heading>

          {/* Options */}
          <VStack gap={4} align="stretch">
            {currentQuestion.options.map((option, index) => {
              const state = getOptionState(index);

              return (
                <Button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={submitted}
                  justifyContent="flex-start"
                  textAlign="left"
                  whiteSpace="normal"
                  h="auto"
                  minH="60px"
                  px={5}
                  py={4}
                  border="2px solid"
                  borderColor={state.borderColor}
                  bg={state.bg}
                  color={state.color}
                  borderRadius="12px"
                  _hover={
                    submitted
                      ? {}
                      : {
                          bg: "brand.50",
                          borderColor: "brand.500",
                        }
                  }
                >
                  <Flex
                    align="center"
                    gap={4}
                    width="100%"
                  >
                    <Box
                      minW="32px"
                      h="32px"
                      borderRadius="full"
                      bg="khaki.100"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="800"
                    >
                      {String.fromCharCode(65 + index)}
                    </Box>

                    <Text
                      flex="1"
                      fontWeight="600"
                    >
                      {option}
                    </Text>

                    {submitted &&
  index === answerResult?.correctAnswer && (
    <FiCheckCircle
      size={21}
      color="#16A34A"
    />
  )}

{submitted &&
  index === selectedAnswer &&
  index !== answerResult?.correctAnswer && (
    <FiXCircle
      size={21}
      color="#DC2626"
    />
  )}
                  </Flex>
                </Button>
              );
            })}
          </VStack>

          {/* Result */}
          {submitted && (
            <Box
              mt={7}
              p={5}
              borderRadius="12px"
              bg={isCorrect ? "green.50" : "red.50"}
              border="1px solid"
              borderColor={
                isCorrect ? "green.200" : "red.200"
              }
            >
              <HStack mb={2}>
                {isCorrect ? (
                  <FiCheckCircle color="#16A34A" />
                ) : (
                  <FiXCircle color="#DC2626" />
                )}

                <Text
                  fontWeight="800"
                  color={
                    isCorrect ? "green.800" : "red.800"
                  }
                >
                  {isCorrect
                    ? "Correct Answer!"
                    : "Incorrect Answer"}
                </Text>
              </HStack>

              <Text
                color={
                  isCorrect ? "green.700" : "red.700"
                }
                fontSize="sm"
                lineHeight="1.7"
              >
                Correct answer:{" "}
<strong>
  {String.fromCharCode(
    65 + answerResult.correctAnswer
  )}
  .{" "}
  {
    currentQuestion.options[
      answerResult.correctAnswer
    ]
  }
</strong>
              </Text>

              {answerResult?.explanation && (
  <Text
    mt={3}
    color="charcoal.700"
    fontSize="sm"
    lineHeight="1.7"
  >
    <strong>Explanation:</strong>{" "}
    {answerResult.explanation}
  </Text>
)}
            </Box>
          )}
{error && (
  <Box
    mt={5}
    p={4}
    bg="red.50"
    border="1px solid"
    borderColor="red.200"
    borderRadius="10px"
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
          {/* Actions */}
          <Flex
            justify="space-between"
            mt={8}
            gap={4}
            direction={{ base: "column", sm: "row" }}
          >
            {!submitted ? (
              <Button
  width={{ base: "100%", sm: "auto" }}
  bg="brand.700"
  color="white"
  onClick={handleSubmitAnswer}
  disabled={selectedAnswer === null || checkingAnswer}
  loading={checkingAnswer}
  _hover={{
    bg: "brand.800",
  }}
>
  {checkingAnswer ? "Checking..." : "Check Answer"}
</Button>
            ) : currentIndex < questions.length - 1 ? (
              <Button
                width={{ base: "100%", sm: "auto" }}
                bg="brand.700"
                color="white"
                onClick={handleNextQuestion}
                ml="auto"
                _hover={{
                  bg: "brand.800",
                }}
              >
                Next Question
                <FiArrowRight
                  style={{ marginLeft: "8px" }}
                />
              </Button>
            ) : (
              <Button
                width={{ base: "100%", sm: "auto" }}
                ml="auto"
                bg="gold.500"
                color="brand.900"
                onClick={handleCompleteTopic}
                disabled={completed}
                _hover={{
                  bg: "gold.400",
                }}
              >
                <FiCheckCircle />
                <Text ml={2}>
                  {completed
                    ? "Topic Completed"
                    : "Complete Topic"}
                </Text>
              </Button>
            )}
          </Flex>
        </Box>

      </Container>
    </Box>
  );
}

export default TopicDetails;