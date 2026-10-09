import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
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
  FiArrowRight,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

import api from "../../services/api";

function MockTestAttempt() {
  const {
    examId,
    testId,
    attemptId,
  } = useParams();

  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [timeLeft, setTimeLeft] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /*
   * Prevent automatic timer submission from
   * running more than once.
   */
  const autoSubmittedRef = useRef(false);

  // --------------------------------------------------
  // Load active attempt
  // --------------------------------------------------

  useEffect(() => {
    const loadAttempt = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * IMPORTANT:
         *
         * This is NOT:
         * /attempts/review/:attemptId
         *
         * Review is only for submitted/expired attempts.
         *
         * This endpoint loads an active attempt.
         */
        const response = await api.get(
          `/attempts/${attemptId}`
        );

        console.log(
          "ACTIVE ATTEMPT RESPONSE:",
          response.data
        );

        const data = response.data;

        setAttempt(
          data.attempt || null
        );

        setTest(
          data.test || null
        );

        setQuestions(
          data.questions || []
        );

        /*
         * Restore answers if the student resumes
         * an existing attempt.
         */
        if (
          Array.isArray(
            data.attempt?.answers
          )
        ) {
          const existingAnswers = {};

          data.attempt.answers.forEach(
            (answer) => {
              if (
                answer.questionId &&
                answer.selectedAnswer !== null &&
                answer.selectedAnswer !== undefined
              ) {
                existingAnswers[
                  String(answer.questionId)
                ] = Number(
                  answer.selectedAnswer
                );
              }
            }
          );

          setAnswers(existingAnswers);
        }

        /*
         * Calculate remaining time from the
         * original server-side startedAt.
         */
        if (
          data.attempt?.startedAt &&
          data.test?.duration
        ) {
          const startTime = new Date(
            data.attempt.startedAt
          ).getTime();

          const durationMs =
            Number(data.test.duration) *
            60 *
            1000;

          const endTime =
            startTime + durationMs;

          const remaining = Math.max(
            0,
            Math.floor(
              (endTime - Date.now()) / 1000
            )
          );

          setTimeLeft(remaining);
        }
      } catch (error) {
        console.error(
          "Load active attempt error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load the mock test."
        );
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      loadAttempt();
    }
  }, [attemptId]);

  // --------------------------------------------------
  // Submit test
  // --------------------------------------------------

  const handleSubmit = async (
    automatic = false
  ) => {
    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const formattedAnswers =
        questions.map((question) => ({
          questionId: question._id,
          selectedAnswer:
            answers[question._id] ?? null,
        }));

      console.log(
        automatic
          ? "AUTO SUBMIT ANSWERS:"
          : "SUBMIT ANSWERS:",
        formattedAnswers
      );

      const response = await api.post(
        `/attempts/submit/${attemptId}`,
        {
          answers: formattedAnswers,
        }
      );

      console.log(
        "SUBMIT TEST RESPONSE:",
        response.data
      );

      /*
       * The backend returns the result with
       * attemptId, score, correctAnswers,
       * wrongAnswers, unanswered, etc.
       *
       * We will build the Result page next.
       */
      navigate(
        `/exams/${examId}/tests/${testId}/result/${attemptId}`,
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Submit test error:",
        error
      );

      /*
       * If the server says the attempt has
       * already expired, still send the user
       * toward the result/review flow.
       */
      if (
        error.response?.data?.status ===
        "expired"
      ) {
        navigate(
          `/exams/${examId}/tests/${testId}/result/${attemptId}`,
          {
            replace: true,
          }
        );

        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to submit the mock test."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Timer
  // --------------------------------------------------

  useEffect(() => {
    if (
      timeLeft === null ||
      timeLeft <= 0
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);

          if (!autoSubmittedRef.current) {
            autoSubmittedRef.current = true;

            setTimeout(() => {
              handleSubmit(true);
            }, 0);
          }

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // --------------------------------------------------
  // Format timer
  // --------------------------------------------------

  const formatTime = (seconds) => {
    if (seconds === null) {
      return "--:--";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds =
      seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // --------------------------------------------------
  // Select answer
  // --------------------------------------------------

  const handleAnswer = (
    questionId,
    answer
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: Number(answer),
    }));
  };

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
            Loading mock test...
          </Text>
        </VStack>
      </Flex>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error || !attempt) {
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
            Unable to load mock test
          </Heading>

          <Text
            color="red.600"
            fontSize="sm"
            mb={6}
          >
            {error ||
              "Mock test attempt was not found."}
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

  // --------------------------------------------------
  // No questions
  // --------------------------------------------------

  if (questions.length === 0) {
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
          borderColor="khaki.200"
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
            No Questions Available
          </Heading>

          <Text
            color="charcoal.600"
            mb={6}
          >
            This mock test does not contain any
            questions yet.
          </Text>

          <Button
            onClick={() =>
              navigate(
                `/exams/${examId}/tests`
              )
            }
            bg="brand.700"
            color="white"
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

  const currentQuestion =
    questions[currentIndex];

  const selectedAnswer =
    answers[currentQuestion._id];

  const isLastQuestion =
    currentIndex ===
    questions.length - 1;

  const answeredCount =
    Object.keys(answers).length;

  return (
    <Box
      minH="calc(100vh - 76px)"
      bg="khaki.50"
      py={6}
    >
      <Container maxW="1000px">

        {/* Header */}
        <Box
          bg="brand.900"
          color="white"
          borderRadius="xl"
          p={{ base: 5, md: 7 }}
          mb={6}
          boxShadow="md"
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
            gap={4}
          >
            <Box>
              <Heading
                fontSize={{
                  base: "xl",
                  md: "2xl",
                }}
              >
                {test?.title || "Mock Test"}
              </Heading>

              <Text
                mt={2}
                color="khaki.200"
                fontSize="sm"
              >
                Question {currentIndex + 1} of{" "}
                {questions.length}
              </Text>
            </Box>

            {/* Timer */}
            <Flex
              align="center"
              gap={2}
              bg={
                timeLeft !== null &&
                timeLeft <= 60
                  ? "red.600"
                  : "rgba(255,255,255,0.1)"
              }
              px={5}
              py={3}
              borderRadius="lg"
              fontWeight="800"
            >
              <FiClock />

              <Text>
                {formatTime(timeLeft)}
              </Text>
            </Flex>
          </Flex>
        </Box>

        {/* Progress */}
        <Flex
          justify="space-between"
          align="center"
          mb={4}
        >
          <Text
            fontSize="sm"
            color="charcoal.600"
            fontWeight="600"
          >
            Answered: {answeredCount}/
            {questions.length}
          </Text>

          <Text
            fontSize="sm"
            color="brand.700"
            fontWeight="700"
          >
            {test?.totalMarks ?? 0} Marks
          </Text>
        </Flex>

        {/* Question */}
        <Box
          bg="white"
          border="1px solid"
          borderColor="khaki.200"
          borderRadius="xl"
          p={{ base: 5, md: 8 }}
          boxShadow="sm"
        >
          <Text
            fontSize="xs"
            fontWeight="800"
            color="gold.600"
            letterSpacing="0.08em"
            mb={3}
          >
            QUESTION {currentIndex + 1}
          </Text>

          <Heading
            fontSize={{
              base: "lg",
              md: "xl",
            }}
            color="brand.900"
            lineHeight="1.6"
            mb={7}
          >
            {currentQuestion.questionText}
          </Heading>

          <VStack
            align="stretch"
            gap={3}
          >
            {currentQuestion.options?.map(
              (option, index) => {
                const isSelected =
                  selectedAnswer === index;

                return (
                  <Box
                    key={index}
                    as="button"
                    type="button"
                    onClick={() =>
                      handleAnswer(
                        currentQuestion._id,
                        index
                      )
                    }
                    textAlign="left"
                    w="100%"
                    border="2px solid"
                    borderColor={
                      isSelected
                        ? "brand.600"
                        : "khaki.200"
                    }
                    bg={
                      isSelected
                        ? "brand.50"
                        : "white"
                    }
                    borderRadius="lg"
                    px={5}
                    py={4}
                    transition="all 0.2s"
                    _hover={{
                      borderColor:
                        "brand.500",
                      bg: "brand.50",
                    }}
                  >
                    <Flex
                      align="center"
                      gap={4}
                    >
                      {/* Option letter */}
                      <Flex
                        w="32px"
                        h="32px"
                        borderRadius="full"
                        align="center"
                        justify="center"
                        bg={
                          isSelected
                            ? "brand.700"
                            : "khaki.100"
                        }
                        color={
                          isSelected
                            ? "white"
                            : "brand.700"
                        }
                        fontWeight="800"
                        flexShrink={0}
                      >
                        {String.fromCharCode(
                          65 + index
                        )}
                      </Flex>

                      <Text
                        color="charcoal.700"
                        fontSize="sm"
                        fontWeight={
                          isSelected
                            ? "700"
                            : "500"
                        }
                      >
                        {option}
                      </Text>
                    </Flex>
                  </Box>
                );
              }
            )}
          </VStack>
        </Box>

        {/* Error */}
        {error && (
          <Box
            mt={5}
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            borderRadius="lg"
            p={4}
          >
            <Text
              color="red.700"
              fontSize="sm"
            >
              {error}
            </Text>
          </Box>
        )}

        {/* Navigation */}
        <Flex
          justify="space-between"
          mt={6}
          gap={3}
        >
          {/* Previous */}
          <Button
            onClick={() =>
              setCurrentIndex(
                (previous) =>
                  Math.max(
                    0,
                    previous - 1
                  )
              )
            }
            disabled={currentIndex === 0}
            variant="outline"
            borderColor="brand.600"
            color="brand.700"
          >
            <FiArrowLeft />
            <Text ml={2}>
              Previous
            </Text>
          </Button>

          {/* Next / Submit */}
          {!isLastQuestion ? (
            <Button
              onClick={() =>
                setCurrentIndex(
                  (previous) =>
                    Math.min(
                      questions.length - 1,
                      previous + 1
                    )
                )
              }
              bg="brand.700"
              color="white"
              _hover={{
                bg: "brand.800",
              }}
            >
              <Text mr={2}>
                Next
              </Text>

              <FiArrowRight />
            </Button>
          ) : (
            <Button
              onClick={() =>
                handleSubmit(false)
              }
              loading={submitting}
              loadingText="Submitting..."
              bg="gold.500"
              color="brand.900"
              _hover={{
                bg: "gold.400",
              }}
            >
              <FiCheckCircle />

              <Text ml={2}>
                Submit Test
              </Text>
            </Button>
          )}
        </Flex>

      </Container>
    </Box>
  );
}

export default MockTestAttempt;