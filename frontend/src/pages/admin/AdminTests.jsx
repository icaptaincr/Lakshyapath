import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";

import { FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";

import api from "../../services/api";

function AdminTests() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [tests, setTests] = useState([]);

  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "20",
    questionIds: [],
  });

  // =========================
  // LOAD EXAMS
  // =========================

  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/exams");

        setExams(response.data.exams || []);
      } catch (error) {
        console.error("Load exams error:", error);

        setError(
          error.response?.data?.message || "Unable to load exams."
        );
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, []);

  // =========================
  // LOAD TESTS
  // =========================

  const loadTests = async () => {
    try {
      const response = await api.get("/tests");

      setTests(response.data.tests || []);
    } catch (error) {
      console.error("Load tests error:", error);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  // =========================
  // EXAM CHANGE
  // =========================

  const handleExamChange = async (e) => {
    const examId = e.target.value;

    setSelectedExam(examId);
    setSelectedSubject("");
    setSelectedTopic("");

    setSubjects([]);
    setTopics([]);
    setQuestions([]);

    setFormData((prev) => ({
      ...prev,
      questionIds: [],
    }));

    if (!examId) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/subjects/exam/${examId}`);

      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error("Load subjects error:", error);

      setError(
        error.response?.data?.message || "Unable to load subjects."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SUBJECT CHANGE
  // =========================

  const handleSubjectChange = async (e) => {
    const subjectId = e.target.value;

    setSelectedSubject(subjectId);
    setSelectedTopic("");

    setTopics([]);
    setQuestions([]);

    setFormData((prev) => ({
      ...prev,
      questionIds: [],
    }));

    if (!subjectId) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/topics/subject/${subjectId}`);

      setTopics(response.data.topics || []);
    } catch (error) {
      console.error("Load topics error:", error);

      setError(
        error.response?.data?.message || "Unable to load topics."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // TOPIC CHANGE
  // =========================

  const handleTopicChange = async (e) => {
    const topicId = e.target.value;

    setSelectedTopic(topicId);
    setQuestions([]);

    setFormData((prev) => ({
      ...prev,
      questionIds: [],
    }));

    if (!topicId) return;

    try {
      setLoadingQuestions(true);
      setError("");

      const response = await api.get(`/questions/topic/${topicId}`);

      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error("Load questions error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load questions."
      );
    } finally {
      setLoadingQuestions(false);
    }
  };

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // QUESTION SELECTION
  // =========================

  const handleQuestionToggle = (questionId) => {
    setFormData((prev) => {
      const exists = prev.questionIds.includes(questionId);

      return {
        ...prev,
        questionIds: exists
          ? prev.questionIds.filter((id) => id !== questionId)
          : [...prev.questionIds, questionId],
      };
    });
  };

  // =========================
  // CREATE TEST
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedExam) {
      setError("Please select an exam.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Test title is required.");
      return;
    }

    if (!formData.duration || Number(formData.duration) <= 0) {
      setError("Duration must be greater than 0.");
      return;
    }

    if (formData.questionIds.length === 0) {
      setError("Please select at least one question.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/tests", {
        examId: selectedExam,
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration: Number(formData.duration),
        questionIds: formData.questionIds,
      });

      setSuccess("Mock test created successfully.");

      setFormData({
        title: "",
        description: "",
        duration: "20",
        questionIds: [],
      });

      setSelectedSubject("");
      setSelectedTopic("");
      setTopics([]);
      setQuestions([]);

      await loadTests();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Create test error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to create mock test."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE TEST
  // =========================

  const handleDelete = async (test) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this mock test?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/tests/${test._id}`);

      setSuccess("Mock test deleted successfully.");

      await loadTests();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Delete test error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete mock test."
      );
    }
  };

  return (
    <Box minH="100vh" bg="khaki.50">
      {/* HEADER */}
      <Box
        bg="brand.900"
        color="white"
        borderBottom="4px solid"
        borderColor="gold.500"
      >
        <Container maxW="1280px">
          <Flex
            minH="82px"
            align="center"
            justify="space-between"
            gap={4}
          >
            <Box>
              <Text
                fontSize="xs"
                fontWeight="800"
                letterSpacing="0.12em"
                color="gold.300"
              >
                LAKSHYAPATH ADMIN
              </Text>

              <Heading
                fontSize={{ base: "xl", md: "2xl" }}
              >
                Mock Test Management
              </Heading>
            </Box>

            <Button
              variant="outline"
              borderColor="gold.400"
              color="gold.300"
              onClick={() => navigate("/admin/dashboard")}
              _hover={{ bg: "whiteAlpha.100" }}
            >
              <FiArrowLeft />
              <Text ml={2}>Dashboard</Text>
            </Button>
          </Flex>
        </Container>
      </Box>

      <Container
        maxW="1280px"
        py={{ base: 8, md: 12 }}
      >
        {/* MESSAGES */}

        {error && (
          <Box
            mb={6}
            p={4}
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            borderRadius="lg"
          >
            <Text color="red.600" fontSize="sm">
              {error}
            </Text>
          </Box>
        )}

        {success && (
          <Box
            mb={6}
            p={4}
            bg="green.50"
            border="1px solid"
            borderColor="green.200"
            borderRadius="lg"
          >
            <Text color="green.700" fontSize="sm">
              {success}
            </Text>
          </Box>
        )}

        {/* CREATE TEST */}

        <Box
          bg="white"
          border="1px solid"
          borderColor="khaki.200"
          borderRadius="16px"
          p={{ base: 5, md: 7 }}
          mb={8}
        >
          <Heading
            fontSize="xl"
            color="brand.900"
            mb={2}
          >
            Create Mock Test
          </Heading>

          <Text
            color="charcoal.500"
            fontSize="sm"
            mb={6}
          >
            Select an exam and questions, then create a
            mock test for students.
          </Text>

          {/* EXAM / SUBJECT / TOPIC */}

          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(3, 1fr)",
            }}
            gap={5}
            mb={6}
          >
            <Box>
              <Text
                mb={2}
                fontWeight="600"
                color="brand.900"
              >
                Exam
              </Text>

              <Box
                as="select"
                value={selectedExam}
                onChange={handleExamChange}
                disabled={loading}
                width="100%"
                height="40px"
                px={3}
                border="1px solid"
                borderColor="gray.300"
                borderRadius="6px"
                bg="white"
              >
                <option value="">Select Exam</option>

                {exams.map((exam) => (
                  <option
                    key={exam._id}
                    value={exam._id}
                  >
                    {exam.name}
                  </option>
                ))}
              </Box>
            </Box>

            <Box>
              <Text
                mb={2}
                fontWeight="600"
                color="brand.900"
              >
                Subject
              </Text>

              <Box
                as="select"
                value={selectedSubject}
                onChange={handleSubjectChange}
                disabled={!selectedExam || loading}
                width="100%"
                height="40px"
                px={3}
                border="1px solid"
                borderColor="gray.300"
                borderRadius="6px"
                bg="white"
              >
                <option value="">
                  Select Subject
                </option>

                {subjects.map((subject) => (
                  <option
                    key={subject._id}
                    value={subject._id}
                  >
                    {subject.name}
                  </option>
                ))}
              </Box>
            </Box>

            <Box>
              <Text
                mb={2}
                fontWeight="600"
                color="brand.900"
              >
                Topic
              </Text>

              <Box
                as="select"
                value={selectedTopic}
                onChange={handleTopicChange}
                disabled={!selectedSubject || loading}
                width="100%"
                height="40px"
                px={3}
                border="1px solid"
                borderColor="gray.300"
                borderRadius="6px"
                bg="white"
              >
                <option value="">
                  Select Topic
                </option>

                {topics.map((topic) => (
                  <option
                    key={topic._id}
                    value={topic._id}
                  >
                    {topic.name}
                  </option>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* TEST DETAILS */}

          <VStack
            gap={5}
            align="stretch"
            mb={6}
          >
            <Box>
              <Text
                mb={2}
                fontWeight="600"
                color="brand.900"
              >
                Test Title
              </Text>

              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: SSC CGL Quantitative Aptitude Mock Test 3"
              />
            </Box>

            <Box>
              <Text
                mb={2}
                fontWeight="600"
                color="brand.900"
              >
                Description
              </Text>

              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe this mock test"
                rows={3}
              />
            </Box>

            <Box maxW="300px">
              <Text
                mb={2}
                fontWeight="600"
                color="brand.900"
              >
                Duration (minutes)
              </Text>

              <Input
                type="number"
                name="duration"
                min="1"
                value={formData.duration}
                onChange={handleChange}
              />
            </Box>
          </VStack>

          {/* QUESTIONS */}

          {selectedTopic && (
            <Box mb={6}>
              <Text
                fontWeight="700"
                color="brand.900"
                mb={4}
              >
                Select Questions
              </Text>

              {loadingQuestions ? (
                <Text color="charcoal.500">
                  Loading questions...
                </Text>
              ) : questions.length === 0 ? (
                <Box
                  p={5}
                  bg="khaki.50"
                  borderRadius="10px"
                >
                  <Text color="charcoal.500">
                    No questions available for this
                    topic.
                  </Text>
                </Box>
              ) : (
                <VStack
                  gap={3}
                  align="stretch"
                >
                  {questions.map((question, index) => {
                    const selected =
                      formData.questionIds.includes(
                        question._id
                      );

                    return (
                      <Box
                        key={question._id}
                        p={4}
                        border="1px solid"
                        borderColor={
                          selected
                            ? "gold.400"
                            : "khaki.200"
                        }
                        borderRadius="10px"
                        bg={
                          selected
                            ? "gold.50"
                            : "white"
                        }
                        cursor="pointer"
                        onClick={() =>
                          handleQuestionToggle(
                            question._id
                          )
                        }
                      >
                        <Flex
                          align="flex-start"
                          gap={3}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              handleQuestionToggle(
                                question._id
                              )
                            }
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          />

                          <Box>
                            <Text
                              fontSize="xs"
                              fontWeight="700"
                              color="gold.600"
                              mb={1}
                            >
                              QUESTION {index + 1}
                            </Text>

                            <Text
                              fontWeight="600"
                              color="brand.900"
                            >
                              {question.questionText}
                            </Text>

                            <Text
                              fontSize="sm"
                              color="charcoal.500"
                              mt={2}
                            >
                              {question.marks} marks
                            </Text>
                          </Box>
                        </Flex>
                      </Box>
                    );
                  })}
                </VStack>
              )}
            </Box>
          )}

          <Flex justify="flex-end">
            <Button
              bg="brand.700"
              color="white"
              onClick={handleSubmit}
              loading={saving}
              loadingText="Creating..."
              _hover={{
                bg: "brand.800",
              }}
            >
              <FiPlus />
              <Text ml={2}>Create Mock Test</Text>
            </Button>
          </Flex>
        </Box>

        {/* EXISTING TESTS */}

        <Box>
          <Heading
            fontSize="xl"
            color="brand.900"
            mb={5}
          >
            Existing Mock Tests
          </Heading>

          {tests.length === 0 ? (
            <Box
              bg="white"
              border="1px solid"
              borderColor="khaki.200"
              borderRadius="16px"
              p={10}
              textAlign="center"
            >
              <Heading
                fontSize="lg"
                color="brand.900"
                mb={2}
              >
                No mock tests yet
              </Heading>

              <Text color="charcoal.500">
                Create your first mock test above.
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
              {tests.map((test) => (
                <Box
                  key={test._id}
                  bg="white"
                  border="1px solid"
                  borderColor="khaki.200"
                  borderRadius="16px"
                  p={6}
                  boxShadow="sm"
                >
                  <Heading
                    fontSize="lg"
                    color="brand.900"
                    mb={2}
                  >
                    {test.title}
                  </Heading>

                  <Text
                    fontSize="sm"
                    color="charcoal.500"
                    mb={4}
                  >
                    {test.description ||
                      "No description provided."}
                  </Text>

                  <Flex
                    gap={3}
                    wrap="wrap"
                    mb={5}
                  >
                    <Box
                      px={3}
                      py={1}
                      bg="brand.50"
                      color="brand.700"
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="600"
                    >
                      {test.totalQuestions} Questions
                    </Box>

                    <Box
                      px={3}
                      py={1}
                      bg="gold.50"
                      color="gold.700"
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="600"
                    >
                      {test.duration} Minutes
                    </Box>

                    <Box
                      px={3}
                      py={1}
                      bg="green.50"
                      color="green.700"
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="600"
                    >
                      {test.totalMarks} Marks
                    </Box>
                  </Flex>

                  <Button
                    width="100%"
                    variant="outline"
                    borderColor="red.400"
                    color="red.600"
                    onClick={() =>
                      handleDelete(test)
                    }
                  >
                    <FiTrash2 />
                    <Text ml={2}>Delete</Text>
                  </Button>
                </Box>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default AdminTests;