import { useEffect, useMemo, useState } from "react";

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
  Progress,
  Text,
  VStack,
} from "@chakra-ui/react";

import { Link as RouterLink } from "react-router-dom";

import {
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiBell,
  FiArrowRight,
  FiCreditCard,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function Dashboard() {
  const { user } = useAuth();

  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [preparations, setPreparations] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          examResponse,
          attemptResponse,
          notificationResponse,
          subscriptionResponse,
          preparationResponse,
        ] = await Promise.all([
          api.get("/exams"),
          api.get("/attempts/my-attempts"),
          api.get("/user-notifications/unread-count"),
          api.get("/subscriptions/my-subscriptions"),
          api.get("/progress/overview"),
        ]);

        setExams(examResponse.data.exams || []);

        setAttempts(
          attemptResponse.data.attempts || []
        );

        setUnreadNotifications(
          notificationResponse.data.unreadCount || 0
        );

        setSubscriptions(
          subscriptionResponse.data.subscriptions || []
        );

        setPreparations(
          preparationResponse.data.preparations || []
        );
      } catch (err) {
        console.error("Dashboard data error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const completedTests = useMemo(() => {
    return attempts.filter(
      (attempt) => attempt.status === "submitted"
    ).length;
  }, [attempts]);

  const activeExams = useMemo(() => {
    return exams.filter((exam) => exam.isActive);
  }, [exams]);

  const overallProgress = useMemo(() => {
    if (!preparations.length) return 0;
    return Math.round(
      preparations.reduce((total, item) => total + Number(item.overallProgress || 0), 0) / preparations.length
    );
  }, [preparations]);

  const nextExam = useMemo(() => {
    const upcoming = activeExams
      .filter((exam) => exam.expectedExamDate)
      .sort(
        (a, b) =>
          new Date(a.expectedExamDate) -
          new Date(b.expectedExamDate)
      );

    return upcoming[0] || null;
  }, [activeExams]);

  const daysUntilExam = useMemo(() => {
    if (!nextExam?.expectedExamDate) return null;

    const today = new Date();
    const examDate = new Date(
      nextExam.expectedExamDate
    );

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
  }, [nextExam]);

  /*
   * Only show active subscriptions.
   */
  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter(
      (subscription) =>
        subscription.status === "active"
    );
  }, [subscriptions]);

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
            Loading your preparation dashboard...
          </Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box
      bg="khaki.50"
      minH="calc(100vh - 76px)"
      py={10}
    >
      <Container maxW="1280px">

        {/* Header */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{
            base: "flex-start",
            md: "center",
          }}
          gap={5}
          mb={8}
        >
          <Box>
            <Text
              fontSize="sm"
              fontWeight="700"
              color="gold.600"
              letterSpacing="0.08em"
              textTransform="uppercase"
              mb={2}
            >
              Your Preparation
            </Text>

            <Heading
              color="brand.900"
              fontSize={{
                base: "2xl",
                md: "3xl",
              }}
            >
              Welcome back,{" "}
              {user?.fullName || "Student"}.
            </Heading>

            <Text
              mt={2}
              color="charcoal.600"
              fontSize="sm"
            >
              Stay disciplined, keep learning, and move one
              step closer to your goal.
            </Text>
          </Box>

          <Button
            as={RouterLink}
            to="/exams"
            bg="brand.700"
            color="white"
            size="sm"
            _hover={{
              bg: "brand.800",
              transform: "translateY(-1px)",
            }}
          >
            Explore Exams
            <FiArrowRight />
          </Button>
        </Flex>

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
            <Text
              color="red.700"
              fontSize="sm"
            >
              {error}
            </Text>
          </Box>
        )}

        {/* Stats */}
        <Grid
          templateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={5}
          mb={8}
        >
          <StatCard
            icon={<FiBookOpen />}
            label="Active Exams"
            value={activeExams.length}
            description="Available for preparation"
          />

          <StatCard
            icon={<FiCheckCircle />}
            label="Tests Completed"
            value={completedTests}
            description="Submitted mock tests"
          />

          <StatCard
            icon={<FiTrendingUp />}
            label="Overall Progress"
            value={`${overallProgress}%`}
            description="Preparation progress"
          />

          <StatCard
            icon={<FiBell />}
            label="Notifications"
            value={unreadNotifications}
            description="Unread notifications"
          />
        </Grid>

        {/* Exam Countdown */}
        {nextExam && (
          <Box
            bg="brand.800"
            color="white"
            borderRadius="xl"
            p={{ base: 6, md: 8 }}
            mb={8}
            boxShadow="md"
          >
            <Flex
              direction={{
                base: "column",
                md: "row",
              }}
              justify="space-between"
              align={{
                base: "flex-start",
                md: "center",
              }}
              gap={6}
            >
              <Box>
                <HStack mb={3} gap={3}>
                  <FiClock />

                  <Text
                    fontSize="xs"
                    fontWeight="800"
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    color="gold.300"
                  >
                    Upcoming Exam
                  </Text>
                </HStack>

                <Heading
                  fontSize={{
                    base: "xl",
                    md: "2xl",
                  }}
                >
                  {nextExam.name}
                </Heading>

                <Text
                  mt={2}
                  color="brand.100"
                  fontSize="sm"
                >
                  {nextExam.expectedExamDate
                    ? new Date(
                        nextExam.expectedExamDate
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Date not announced"}
                </Text>
              </Box>

              <Box
                minW={{ md: "170px" }}
                textAlign={{
                  base: "left",
                  md: "center",
                }}
                bg="rgba(255,255,255,0.08)"
                borderRadius="lg"
                px={6}
                py={4}
              >
                <Text
                  fontSize="3xl"
                  fontWeight="800"
                  color="gold.300"
                >
                  {daysUntilExam}
                </Text>

                <Text
                  fontSize="xs"
                  fontWeight="700"
                  color="brand.100"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                >
                  Days Remaining
                </Text>
              </Box>
            </Flex>
          </Box>
        )}

        {/* Premium Subscriptions */}
        <Box
          bg="white"
          border="1px solid"
          borderColor="gold.300"
          borderRadius="xl"
          p={{ base: 6, md: 7 }}
          mb={8}
          boxShadow="sm"
        >
          <Flex
            direction={{
              base: "column",
              md: "row",
            }}
            justify="space-between"
            align={{
              base: "flex-start",
              md: "center",
            }}
            gap={4}
            mb={6}
          >
            <Box>
              <HStack gap={3}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w="42px"
                  h="42px"
                  borderRadius="lg"
                  bg="gold.100"
                  color="gold.800"
                  fontSize="20px"
                >
                  <FiCreditCard />
                </Box>

                <Box>
                  <Heading
                    fontSize="lg"
                    color="brand.900"
                  >
                    My Premium Access
                  </Heading>

                  <Text
                    mt={1}
                    fontSize="sm"
                    color="charcoal.500"
                  >
                    Your active LakshyaPath subscriptions
                  </Text>
                </Box>
              </HStack>
            </Box>

            <Badge
              bg={
                activeSubscriptions.length > 0
                  ? "green.100"
                  : "gray.100"
              }
              color={
                activeSubscriptions.length > 0
                  ? "green.800"
                  : "gray.700"
              }
              px={3}
              py={1}
              borderRadius="full"
            >
              {activeSubscriptions.length > 0
                ? `${activeSubscriptions.length} Active`
                : "No Active Plan"}
            </Badge>
          </Flex>

          {activeSubscriptions.length === 0 ? (
            <Box
              p={5}
              bg="khaki.50"
              borderRadius="lg"
              border="1px dashed"
              borderColor="khaki.300"
            >
              <Text
                fontWeight="700"
                color="brand.800"
              >
                No premium subscription yet
              </Text>

              <Text
                mt={1}
                fontSize="sm"
                color="charcoal.500"
              >
                Choose an exam and explore premium
                preparation features.
              </Text>

              <Button
                as={RouterLink}
                to="/exams"
                mt={4}
                size="sm"
                bg="brand.700"
                color="white"
                _hover={{
                  bg: "brand.800",
                }}
              >
                Explore Premium Plans
                <FiArrowRight />
              </Button>
            </Box>
          ) : (
            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
              }}
              gap={4}
            >
              {activeSubscriptions.map(
                (subscription) => {
                  const startDate = subscription.startDate
                    ? new Date(
                        subscription.startDate
                      )
                    : null;

                  const endDate = subscription.endDate
                    ? new Date(
                        subscription.endDate
                      )
                    : null;

                  const daysRemaining = endDate
                    ? Math.max(
                        0,
                        Math.ceil(
                          (endDate.getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      )
                    : 0;

                  return (
                    <Box
                      key={subscription._id}
                      p={5}
                      border="1px solid"
                      borderColor="khaki.200"
                      borderRadius="lg"
                      bg="khaki.50"
                    >
                      <Flex
                        justify="space-between"
                        align="flex-start"
                        gap={4}
                      >
                        <Box>
                          <Text
                            fontSize="xs"
                            fontWeight="800"
                            color="gold.600"
                            letterSpacing="0.08em"
                            textTransform="uppercase"
                          >
                            Premium Plan
                          </Text>

                          <Heading
                            mt={1}
                            fontSize="lg"
                            color="brand.900"
                          >
                            {subscription.examId?.name ||
                              "Exam"}
                          </Heading>
                        </Box>

                        <Badge
                          bg="green.100"
                          color="green.800"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          Active
                        </Badge>
                      </Flex>

                      <Grid
                        templateColumns="repeat(2, 1fr)"
                        gap={4}
                        mt={5}
                      >
                        <Box>
                          <Text
                            fontSize="xs"
                            color="charcoal.500"
                          >
                            Plan
                          </Text>

                          <Text
                            mt={1}
                            fontWeight="700"
                            color="brand.800"
                          >
                            {subscription.planName}
                          </Text>
                        </Box>

                        <Box>
                          <Text
                            fontSize="xs"
                            color="charcoal.500"
                          >
                            Amount Paid
                          </Text>

                          <Text
                            mt={1}
                            fontWeight="700"
                            color="brand.800"
                          >
                            ₹{subscription.amount}
                          </Text>
                        </Box>

                        <Box>
                          <Text
                            fontSize="xs"
                            color="charcoal.500"
                          >
                            Started
                          </Text>

                          <Text
                            mt={1}
                            fontSize="sm"
                            fontWeight="600"
                            color="brand.800"
                          >
                            {startDate
                              ? startDate.toLocaleDateString(
                                  "en-IN"
                                )
                              : "-"}
                          </Text>
                        </Box>

                        <Box>
                          <Text
                            fontSize="xs"
                            color="charcoal.500"
                          >
                            Expires
                          </Text>

                          <Text
                            mt={1}
                            fontSize="sm"
                            fontWeight="600"
                            color="brand.800"
                          >
                            {endDate
                              ? endDate.toLocaleDateString(
                                  "en-IN"
                                )
                              : "-"}
                          </Text>
                        </Box>
                      </Grid>

                      <Flex
                        mt={5}
                        justify="space-between"
                        align="center"
                        gap={3}
                        wrap="wrap"
                      >
                        <HStack gap={2}>
                          <FiClock color="#A27B1A" />

                          <Text
                            fontSize="sm"
                            fontWeight="700"
                            color="gold.700"
                          >
                            {daysRemaining} days remaining
                          </Text>
                        </HStack>

                        {subscription.examId?._id && (
                          <Button
                            as={RouterLink}
                            to={`/exams/${subscription.examId._id}`}
                            size="sm"
                            variant="outline"
                            borderColor="brand.600"
                            color="brand.700"
                            _hover={{
                              bg: "brand.50",
                            }}
                          >
                            View Exam
                            <FiArrowRight />
                          </Button>
                        )}
                      </Flex>
                    </Box>
                  );
                }
              )}
            </Grid>
          )}
        </Box>

        {/* Preparation Overview */}
        <Box
          bg="white"
          border="1px solid"
          borderColor="khaki.200"
          borderRadius="xl"
          p={{ base: 6, md: 7 }}
          boxShadow="sm"
          mb={6}
        >
          <Flex justify="space-between" align="center" mb={6}>
            <Box>
              <Heading fontSize="lg" color="brand.900">Preparation Overview</Heading>
              <Text mt={1} fontSize="sm" color="charcoal.500">Progress for every exam you have started.</Text>
            </Box>
            <Badge bg="gold.100" color="gold.800" px={3} py={1} borderRadius="full">
              {preparations.length} {preparations.length === 1 ? "Exam" : "Exams"}
            </Badge>
          </Flex>

          {preparations.length === 0 ? (
            <Box p={6} bg="khaki.50" borderRadius="lg" textAlign="center">
              <Text color="charcoal.500">No exam preparation selected yet.</Text>
              <Button as={RouterLink} to="/exams" mt={4} size="sm" bg="brand.700" color="white">Start a Preparation</Button>
            </Box>
          ) : (
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
              {preparations.map((item) => (
                <Box key={item.exam?._id} p={5} bg="khaki.50" border="1px solid" borderColor="khaki.200" borderRadius="lg">
                  <Flex justify="space-between" gap={3}>
                    <Box><Text fontSize="xs" fontWeight="800" color="gold.600">{item.exam?.category}</Text><Heading fontSize="md" color="brand.900" mt={1}>{item.exam?.name}</Heading></Box>
                    <Text fontWeight="800" color="brand.700">{Math.round(item.overallProgress || 0)}%</Text>
                  </Flex>
                  <Progress.Root value={item.overallProgress || 0} size="sm" colorPalette="green" mt={4}><Progress.Track><Progress.Range /></Progress.Track></Progress.Root>
                  <Flex justify="space-between" mt={3} align="center"><Text fontSize="xs" color="charcoal.500">{item.testProgress?.testsAttempted || 0} mock tests attended</Text><Button as={RouterLink} to={`/exams/${item.exam?._id}/progress`} size="xs" variant="outline" borderColor="brand.600" color="brand.700">View Progress</Button></Flex>
                </Box>
              ))}
            </Grid>
          )}
        </Box>

        <Grid
          templateColumns={{
            base: "1fr",
            lg: "1.5fr 1fr",
          }}
          gap={6}
        >
          <Box
            bg="white"
            border="1px solid"
            borderColor="khaki.200"
            borderRadius="xl"
            p={{ base: 6, md: 7 }}
            boxShadow="sm"
          >
            <Flex
              justify="space-between"
              align="center"
              mb={6}
            >
              <Box>
                <Heading
                  fontSize="lg"
                  color="brand.900"
                >
                  Preparation Overview
                </Heading>

                <Text
                  mt={1}
                  fontSize="sm"
                  color="charcoal.500"
                >
                  Your current preparation status
                </Text>
              </Box>

              <Badge
                bg="gold.100"
                color="gold.800"
                px={3}
                py={1}
                borderRadius="full"
              >
                {overallProgress}% Complete
              </Badge>
            </Flex>

            <Box
              h="10px"
              bg="khaki.200"
              borderRadius="full"
              overflow="hidden"
            >
              <Box
                h="100%"
                w={`${overallProgress}%`}
                bg="gold.500"
                borderRadius="full"
                transition="width 0.4s ease"
              />
            </Box>

            <Text
              mt={4}
              fontSize="sm"
              color="charcoal.600"
            >
              Start studying your selected exam topics to
              build your preparation progress.
            </Text>

            <Button
              as={RouterLink}
              to="/exams"
              mt={5}
              size="sm"
              variant="outline"
              borderColor="brand.600"
              color="brand.700"
              _hover={{
                bg: "brand.50",
              }}
            >
              View My Exams
            </Button>
          </Box>

          {/* Recent Activity */}
          <Box
            bg="white"
            border="1px solid"
            borderColor="khaki.200"
            borderRadius="xl"
            p={{ base: 6, md: 7 }}
            boxShadow="sm"
          >
            <Heading
              fontSize="lg"
              color="brand.900"
              mb={2}
            >
              Recent Activity
            </Heading>

            <Text
              fontSize="sm"
              color="charcoal.500"
              mb={6}
            >
              Your latest preparation activity
            </Text>

            {attempts.length === 0 ? (
              <Box
                textAlign="center"
                py={8}
                border="1px dashed"
                borderColor="khaki.300"
                borderRadius="lg"
              >
                <FiBookOpen
                  size={28}
                  style={{
                    margin: "0 auto 12px",
                    color: "#526B48",
                  }}
                />

                <Text
                  fontWeight="700"
                  color="brand.800"
                  fontSize="sm"
                >
                  No activity yet
                </Text>

                <Text
                  mt={1}
                  color="charcoal.500"
                  fontSize="xs"
                >
                  Complete a mock test to see your
                  activity here.
                </Text>
              </Box>
            ) : (
              <VStack
                align="stretch"
                gap={3}
              >
                {attempts
                  .slice(0, 4)
                  .map((attempt) => (
                    <Flex
                      key={attempt._id}
                      justify="space-between"
                      align="center"
                      p={3}
                      bg="khaki.50"
                      borderRadius="md"
                    >
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="700"
                          color="brand.800"
                        >
                          {attempt.testId?.title ||
                            "Mock Test"}
                        </Text>

                        <Text
                          fontSize="xs"
                          color="charcoal.500"
                        >
                          {attempt.status}
                        </Text>
                      </Box>

                      <Badge
                        colorPalette={
                          attempt.status === "submitted"
                            ? "green"
                            : "yellow"
                        }
                      >
                        {attempt.score ?? 0}
                      </Badge>
                    </Flex>
                  ))}
              </VStack>
            )}
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="khaki.200"
      borderRadius="xl"
      p={5}
      boxShadow="sm"
      transition="all 0.2s ease"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "md",
      }}
    >
      <HStack
        justify="space-between"
        align="flex-start"
        mb={4}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="40px"
          h="40px"
          borderRadius="lg"
          bg="brand.50"
          color="brand.700"
          fontSize="20px"
        >
          {icon}
        </Box>

        <Text
          fontSize="2xl"
          fontWeight="800"
          color="brand.900"
        >
          {value}
        </Text>
      </HStack>

      <Text
        fontSize="sm"
        fontWeight="700"
        color="charcoal.800"
      >
        {label}
      </Text>

      <Text
        mt={1}
        fontSize="xs"
        color="charcoal.500"
      >
        {description}
      </Text>
    </Box>
  );
}

export default Dashboard;