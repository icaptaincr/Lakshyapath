import { useEffect, useMemo, useState } from "react";

import {
  useParams,
  Link as RouterLink,
  useNavigate,
} from "react-router-dom";

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

import {
  FiArrowLeft,
  FiArrowRight,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiCreditCard,
} from "react-icons/fi";

import api from "../../services/api";

function ExamDetails() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [premiumPlan, setPremiumPlan] = useState(null);

  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadExamDetails = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Exam ID from URL:", examId);

        const [examResponse, subjectResponse] = await Promise.all([
          api.get(`/exams/${examId}`),
          api.get(`/subjects/exam/${examId}`),
        ]);

        setExam(examResponse.data.exam);
        setSubjects(subjectResponse.data.subjects || []);
      } catch (error) {
        console.error("Exam details error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load exam"
        );
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      loadExamDetails();
    } else {
      setLoading(false);
      setError("Exam ID is missing");
    }
  }, [examId]);

  /*
   * Load the Premium plan configured by the admin
   * for this particular examination.
   */
  useEffect(() => {
    const loadPremiumPlan = async () => {
      try {
        setPlanLoading(true);

        const response = await api.get(
          `/plans?examId=${examId}`
        );

        const plans = response.data?.plans || [];

        const premium = plans.find(
          (plan) =>
            plan.name === "Premium" &&
            plan.isActive !== false
        );

        setPremiumPlan(premium || null);
      } catch (error) {
        console.error(
          "Premium plan loading error:",
          error
        );

        setPremiumPlan(null);
      } finally {
        setPlanLoading(false);
      }
    };

    if (examId) {
      loadPremiumPlan();
    }
  }, [examId]);

  const daysUntilExam = useMemo(() => {
    if (!exam?.expectedExamDate) return null;

    const today = new Date();
    const examDate = new Date(exam.expectedExamDate);

    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);

    const difference =
      examDate.getTime() - today.getTime();

    return Math.max(
      0,
      Math.ceil(
        difference / (1000 * 60 * 60 * 24)
      )
    );
  }, [exam]);

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
            Loading exam details...
          </Text>
        </VStack>
      </Flex>
    );
  }

  if (error || !exam) {
    return (
      <Box
        minH="calc(100vh - 76px)"
        bg="khaki.50"
        py={10}
      >
        <Container maxW="1280px">
          <Box
            bg="white"
            border="1px solid"
            borderColor="red.200"
            borderRadius="xl"
            p={8}
            textAlign="center"
          >
            <Heading
              fontSize="xl"
              color="brand.900"
              mb={3}
            >
              Unable to load exam
            </Heading>

            <Text
              color="red.600"
              fontSize="sm"
              mb={6}
            >
              {error || "Exam not found."}
            </Text>

            <Button
              as={RouterLink}
              to="/exams"
              variant="outline"
              borderColor="brand.600"
              color="brand.700"
            >
              <FiArrowLeft />
              <Text ml={2}>Back to Exams</Text>
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  const formattedDate = exam.expectedExamDate
    ? new Date(
        exam.expectedExamDate
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date not announced";

  const premiumAmount = premiumPlan
    ? premiumPlan.offerPrice ??
      premiumPlan.price
    : null;

  return (
    <Box
      minH="calc(100vh - 76px)"
      bg="khaki.50"
      py={10}
    >
      <Container maxW="1280px">

        {/* Back */}
        <Button
          as={RouterLink}
          to="/exams"
          variant="ghost"
          size="sm"
          color="brand.700"
          mb={6}
          _hover={{
            bg: "brand.50",
          }}
        >
          <FiArrowLeft />
          <Text ml={2}>Back to Exams</Text>
        </Button>

        {/* Exam Hero */}
        <Box
          bg="brand.800"
          color="white"
          borderRadius="xl"
          p={{ base: 6, md: 9 }}
          mb={8}
          boxShadow="md"
        >
          <Flex
            direction={{
              base: "column",
              lg: "row",
            }}
            justify="space-between"
            gap={8}
          >
            <Box maxW="720px">
              <HStack mb={4} gap={3}>
                <Badge
                  bg="gold.200"
                  color="gold.900"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {exam.category}
                </Badge>

                <Badge
                  bg="rgba(255,255,255,0.12)"
                  color="white"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {exam.notificationStatus}
                </Badge>
              </HStack>

              <Heading
                fontSize={{
                  base: "2xl",
                  md: "4xl",
                }}
                lineHeight="1.2"
              >
                {exam.name}
              </Heading>

              <Text
                mt={4}
                color="brand.100"
                fontSize="sm"
                lineHeight="1.8"
              >
                {exam.description ||
                  "Prepare systematically with LakshyaPath."}
              </Text>

              <HStack
                mt={6}
                gap={2}
                color="brand.100"
              >
                <FiCalendar />

                <Text fontSize="sm">
                  Expected Exam Date: {formattedDate}
                </Text>
              </HStack>
            </Box>

            {/* Countdown */}
            <Box
              minW={{ lg: "190px" }}
              bg="rgba(255,255,255,0.08)"
              borderRadius="xl"
              p={6}
              textAlign="center"
              alignSelf={{ lg: "center" }}
            >
              <FiClock
                size={24}
                style={{
                  margin: "0 auto 10px",
                }}
              />

              <Text
                fontSize="3xl"
                fontWeight="800"
                color="gold.300"
              >
                {daysUntilExam ?? "—"}
              </Text>

              <Text
                fontSize="xs"
                color="brand.100"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="0.08em"
              >
                Days Remaining
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Exam Actions */}
        <Flex
          justify="flex-end"
          gap={3}
          mb={8}
          wrap="wrap"
        >
          {/* My Progress */}
          <Button
            as={RouterLink}
            to={`/exams/${examId}/progress`}
            bg="brand.700"
            color="white"
            _hover={{
              bg: "brand.800",
            }}
          >
            <FiBarChart2 />
            <Text ml={2}>My Progress</Text>
          </Button>

          {/* Mock Tests */}
          <Button
            as={RouterLink}
            to={`/exams/${examId}/tests`}
            bg="gold.500"
            color="brand.900"
            _hover={{
              bg: "gold.400",
            }}
          >
            <FiFileText />
            <Text ml={2}>Mock Tests</Text>
          </Button>

          {/* Premium Plans */}
          <Button
            bg="#3F4F3A"
            color="white"
            border="1px solid"
            borderColor="#A27B1A"
            _hover={{
              bg: "#2F3C2C",
            }}
            onClick={() => {
              if (premiumPlan?._id) {
                navigate(`/payment/${premiumPlan._id}`);
              }
            }}
            disabled={
              planLoading || !premiumPlan
            }
          >
            <FiCreditCard />

            <Text ml={2}>
              {planLoading
                ? "Loading Plan..."
                : premiumPlan
                ? "Premium Plans"
                : "Premium Unavailable"}
            </Text>
          </Button>
        </Flex>

        {/* Premium Plan Summary */}
        {!planLoading && premiumPlan && (
          <Box
            mb={10}
            p={{ base: 5, md: 6 }}
            bg="white"
            border="1px solid"
            borderColor="gold.300"
            borderRadius="xl"
            boxShadow="sm"
          >
            <Flex
              direction={{
                base: "column",
                md: "row",
              }}
              justify="space-between"
              align={{
                base: "stretch",
                md: "center",
              }}
              gap={5}
            >
              <Box>
                <HStack mb={2}>
                  <Badge
                    bg="gold.100"
                    color="gold.800"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    PREMIUM
                  </Badge>

                  {premiumPlan.offerName && (
                    <Badge
                      bg="brand.50"
                      color="brand.700"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {premiumPlan.offerName}
                    </Badge>
                  )}
                </HStack>

                <Heading
                  fontSize="xl"
                  color="brand.900"
                >
                  Upgrade your {exam.name} preparation
                </Heading>

                <Text
                  mt={2}
                  color="charcoal.500"
                  fontSize="sm"
                >
                  Get access to premium preparation
                  features for {premiumPlan.durationDays}{" "}
                  days.
                </Text>
              </Box>

              <Box textAlign={{ base: "left", md: "right" }}>
                {premiumPlan.offerPrice !== null &&
                  premiumPlan.offerPrice !== undefined && (
                    <Text
                      textDecoration="line-through"
                      color="gray.500"
                      fontSize="sm"
                    >
                      ₹{premiumPlan.price}
                    </Text>
                  )}

                <Text
                  fontSize="2xl"
                  fontWeight="800"
                  color="#A27B1A"
                >
                  ₹{premiumAmount}
                </Text>

                <Button
                  mt={2}
                  bg="#3F4F3A"
                  color="white"
                  _hover={{
                    bg: "#2F3C2C",
                  }}
                  onClick={() =>
                    navigate(
                      `/payment/${premiumPlan._id}`
                    )
                  }
                >
                  <FiCreditCard />

                  <Text ml={2}>
                    View Premium Plan
                  </Text>
                </Button>
              </Box>
            </Flex>
          </Box>
        )}

        {/* Subjects */}
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
          gap={3}
          mb={6}
        >
          <Box>
            <Heading
              fontSize="2xl"
              color="brand.900"
            >
              Subjects
            </Heading>

            <Text
              mt={1}
              color="charcoal.500"
              fontSize="sm"
            >
              Build your preparation subject by subject.
            </Text>
          </Box>

          <Badge
            bg="brand.50"
            color="brand.700"
            px={3}
            py={1}
            borderRadius="full"
          >
            {subjects.length}{" "}
            {subjects.length === 1
              ? "Subject"
              : "Subjects"}
          </Badge>
        </Flex>

        {subjects.length === 0 ? (
          <Box
            bg="white"
            border="1px dashed"
            borderColor="khaki.300"
            borderRadius="xl"
            p={10}
            textAlign="center"
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
              No subjects available yet
            </Heading>

            <Text
              color="charcoal.500"
              fontSize="sm"
            >
              Subjects for this examination will appear
              here once they are added.
            </Text>
          </Box>
        ) : (
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={5}
          >
            {subjects.map((subject) => (
              <SubjectCard
                key={subject._id}
                subject={subject}
                examId={exam._id}
              />
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

function SubjectCard({ subject, examId }) {
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
        transform: "translateY(-4px)",
        boxShadow: "md",
        borderColor: "gold.400",
      }}
    >
      <HStack
        justify="space-between"
        align="flex-start"
        mb={5}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="42px"
          h="42px"
          borderRadius="lg"
          bg="brand.50"
          color="brand.700"
          fontSize="20px"
        >
          <FiBookOpen />
        </Box>

        <Text
          fontSize="xs"
          fontWeight="800"
          color="gold.600"
          letterSpacing="0.08em"
        >
          SUBJECT
        </Text>
      </HStack>

      <Heading
        fontSize="lg"
        color="brand.900"
        mb={2}
      >
        {subject.name}
      </Heading>

      <Text
        color="charcoal.500"
        fontSize="sm"
        lineHeight="1.7"
        minH="48px"
      >
        {subject.description ||
          "Start preparing this subject with focused topic-wise practice."}
      </Text>

      <Flex
        mt={6}
        justify="space-between"
        align="center"
      >
        <HStack gap={2}>
          <FiCheckCircle color="#526B48" />

          <Text
            fontSize="xs"
            color="charcoal.500"
          >
            Preparation ready
          </Text>
        </HStack>

        <Button
          as={RouterLink}
          to={`/exams/${examId}/subjects/${subject._id}`}
          size="sm"
          variant="outline"
          borderColor="brand.600"
          color="brand.700"
          _hover={{
            bg: "brand.50",
          }}
        >
          Open
          <FiArrowRight />
        </Button>
      </Flex>
    </Box>
  );
}

export default ExamDetails;