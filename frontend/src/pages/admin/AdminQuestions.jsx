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
  Spinner,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";

import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

import api from "../../services/api";

function AdminQuestions() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);

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
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "0",
    explanation: "",
    difficulty: "Medium",
    marks: "2",
    negativeMarks: "0.5",
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
          error.response?.data?.message ||
            "Unable to load exams."
        );
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, []);

  // =========================
  // LOAD SUBJECTS
  // =========================

  const handleExamChange = async (e) => {
    const examId = e.target.value;

    setSelectedExam(examId);
    setSelectedSubject("");
    setSelectedTopic("");
    setSubjects([]);
    setTopics([]);
    setQuestions([]);

    if (!examId) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/subjects/exam/${examId}`
      );

      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error("Load subjects error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load subjects."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD TOPICS
  // =========================

  const handleSubjectChange = async (e) => {
    const subjectId = e.target.value;

    setSelectedSubject(subjectId);
    setSelectedTopic("");
    setTopics([]);
    setQuestions([]);

    if (!subjectId) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/topics/subject/${subjectId}`
      );

      setTopics(response.data.topics || []);
    } catch (error) {
      console.error("Load topics error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load topics."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD QUESTIONS
  // =========================

  const handleTopicChange = async (e) => {
    const topicId = e.target.value;

    setSelectedTopic(topicId);
    setQuestions([]);

    if (!topicId) return;

    try {
      setLoadingQuestions(true);
      setError("");

      const response = await api.get(
        `/questions/topic/${topicId}`
      );

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
  // FORM HANDLERS
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...formData.options];

    updatedOptions[index] = value;

    setFormData({
      ...formData,
      options: updatedOptions,
    });
  };

  const resetForm = () => {
    setFormData({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "0",
      explanation: "",
      difficulty: "Medium",
      marks: "2",
      negativeMarks: "0.5",
    });
  };

  // =========================
  // CREATE QUESTION
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedTopic) {
      setError("Please select a topic.");
      return;
    }

    if (!formData.questionText.trim()) {
      setError("Question text is required.");
      return;
    }

    if (
      formData.options.some(
        (option) => !option.trim()
      )
    ) {
      setError("All 4 options are required.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/questions", {
        topicId: selectedTopic,
        questionText: formData.questionText.trim(),
        options: formData.options.map((option) =>
          option.trim()
        ),
        correctAnswer: Number(formData.correctAnswer),
        explanation: formData.explanation.trim(),
        difficulty: formData.difficulty,
        marks: Number(formData.marks),
        negativeMarks: Number(
          formData.negativeMarks
        ),
      });

      setSuccess("Question created successfully.");

      resetForm();

      await handleTopicChange({
        target: {
          value: selectedTopic,
        },
      });

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Create question error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to create question."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE QUESTION
  // =========================

  const handleDelete = async (question) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/questions/${question._id}`
      );

      setSuccess("Question deleted successfully.");

      await handleTopicChange({
        target: {
          value: selectedTopic,
        },
      });

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Delete question error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete question."
      );
    }
  };

  return (
    <Box minH="100vh" bg="khaki.50">
      {/* =========================
          HEADER
      ========================== */}

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
                Question Management
              </Heading>
            </Box>

            <Button
              variant="outline"
              borderColor="gold.400"
              color="gold.300"
              onClick={() =>
                navigate("/admin/dashboard")
              }
              _hover={{
                bg: "whiteAlpha.100",
              }}
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
        {/* =========================
            MESSAGES
        ========================== */}

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

        {/* =========================
            SELECTION
        ========================== */}

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
            Question Location
          </Heading>

          <Text
            color="charcoal.500"
            mb={6}
          >
            Select the exam, subject and topic where
            the question should be stored.
          </Text>

          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(3, 1fr)",
            }}
            gap={5}
          >
            {/* Exam */}

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
  <option value="">
    Select Exam
  </option>

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

            {/* Subject */}

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

            {/* Topic */}

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
        </Box>

        {/* =========================
            ADD QUESTION
        ========================== */}

        {selectedTopic && (
          <Box
            bg="white"
            border="1px solid"
            borderColor="khaki.200"
            borderRadius="16px"
            p={{ base: 5, md: 7 }}
            mb={8}
          >
            <Flex
              justify="space-between"
              align="center"
              mb={6}
            >
              <Box>
                <Heading
                  fontSize="xl"
                  color="brand.900"
                >
                  Add Question
                </Heading>

                <Text
                  color="charcoal.500"
                  fontSize="sm"
                  mt={1}
                >
                  Create a question with four answer
                  options.
                </Text>
              </Box>

              <Box
                bg="brand.50"
                color="brand.700"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight="700"
              >
                {questions.length} existing
              </Box>
            </Flex>

            <form onSubmit={handleSubmit}>
              <VStack
                gap={5}
                align="stretch"
              >
                {/* Question */}

                <Box>
                  <Text
                    mb={2}
                    fontWeight="600"
                    color="brand.900"
                  >
                    Question
                  </Text>

                  <Textarea
                    name="questionText"
                    value={formData.questionText}
                    onChange={handleChange}
                    placeholder="Enter the question"
                    rows={4}
                  />
                </Box>

                {/* Options */}

                <Box>
                  <Text
                    mb={3}
                    fontWeight="600"
                    color="brand.900"
                  >
                    Answer Options
                  </Text>

                  <Grid
                    templateColumns={{
                      base: "1fr",
                      md: "repeat(2, 1fr)",
                    }}
                    gap={4}
                  >
                    {formData.options.map(
                      (option, index) => (
                        <Box key={index}>
                          <Text
                            fontSize="sm"
                            mb={2}
                            color="charcoal.600"
                          >
                            Option{" "}
                            {String.fromCharCode(
                              65 + index
                            )}
                          </Text>

                          <Input
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(
                                index,
                                e.target.value
                              )
                            }
                            placeholder={`Option ${String.fromCharCode(
                              65 + index
                            )}`}
                          />
                        </Box>
                      )
                    )}
                  </Grid>
                </Box>

                {/* Correct Answer */}

                <Box>
                  <Text
                    mb={2}
                    fontWeight="600"
                    color="brand.900"
                  >
                    Correct Answer
                  </Text>

                  <Box
  as="select"
  name="correctAnswer"
  value={formData.correctAnswer}
  onChange={handleChange}
  width="100%"
  height="40px"
  px={3}
  border="1px solid"
  borderColor="gray.300"
  borderRadius="6px"
  bg="white"
>
  <option value="0">
    Option A
  </option>

  <option value="1">
    Option B
  </option>

  <option value="2">
    Option C
  </option>

  <option value="3">
    Option D
  </option>
</Box>
                </Box>

                {/* Explanation */}

                <Box>
                  <Text
                    mb={2}
                    fontWeight="600"
                    color="brand.900"
                  >
                    Explanation
                  </Text>

                  <Textarea
                    name="explanation"
                    value={formData.explanation}
                    onChange={handleChange}
                    placeholder="Explain why this answer is correct"
                    rows={4}
                  />
                </Box>

                {/* Question settings */}

                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "repeat(3, 1fr)",
                  }}
                  gap={5}
                >
                  <Box>
                    <Text
                      mb={2}
                      fontWeight="600"
                    >
                      Difficulty
                    </Text>

                    <Box
  as="select"
  name="difficulty"
  value={formData.difficulty}
  onChange={handleChange}
  width="100%"
  height="40px"
  px={3}
  border="1px solid"
  borderColor="gray.300"
  borderRadius="6px"
  bg="white"
>
  <option value="Easy">Easy</option>
  <option value="Medium">Medium</option>
  <option value="Hard">Hard</option>
</Box>
                  </Box>

                  <Box>
                    <Text
                      mb={2}
                      fontWeight="600"
                    >
                      Marks
                    </Text>

                    <Input
                      type="number"
                      name="marks"
                      min="0"
                      step="0.5"
                      value={formData.marks}
                      onChange={handleChange}
                    />
                  </Box>

                  <Box>
                    <Text
                      mb={2}
                      fontWeight="600"
                    >
                      Negative Marks
                    </Text>

                    <Input
                      type="number"
                      name="negativeMarks"
                      min="0"
                      step="0.25"
                      value={formData.negativeMarks}
                      onChange={handleChange}
                    />
                  </Box>
                </Grid>

                <Flex
                  justify="flex-end"
                  gap={3}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Clear
                  </Button>

                  <Button
                    type="submit"
                    bg="brand.700"
                    color="white"
                    loading={saving}
                    loadingText="Creating..."
                    _hover={{
                      bg: "brand.800",
                    }}
                  >
                    <FiPlus />
                    <Text ml={2}>
                      Add Question
                    </Text>
                  </Button>
                </Flex>
              </VStack>
            </form>
          </Box>
        )}

        {/* =========================
            QUESTION LIST
        ========================== */}

        {selectedTopic && (
          <Box>
            <Heading
              fontSize="xl"
              color="brand.900"
              mb={5}
            >
              Existing Questions
            </Heading>

            {loadingQuestions ? (
              <Flex
                minH="250px"
                align="center"
                justify="center"
              >
                <VStack gap={4}>
                  <Spinner
                    size="lg"
                    color="brand.600"
                  />

                  <Text color="charcoal.500">
                    Loading questions...
                  </Text>
                </VStack>
              </Flex>
            ) : questions.length === 0 ? (
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
                  No questions yet
                </Heading>

                <Text color="charcoal.500">
                  Add the first question for this topic.
                </Text>
              </Box>
            ) : (
              <VStack
                gap={5}
                align="stretch"
              >
                {questions.map(
                  (question, index) => (
                    <Box
                      key={question._id}
                      bg="white"
                      border="1px solid"
                      borderColor="khaki.200"
                      borderRadius="16px"
                      p={{ base: 5, md: 6 }}
                      boxShadow="sm"
                    >
                      <Flex
                        justify="space-between"
                        align="flex-start"
                        gap={5}
                      >
                        <Box flex="1">
                          <Text
                            fontSize="xs"
                            fontWeight="700"
                            color="gold.600"
                            mb={2}
                          >
                            QUESTION {index + 1}
                          </Text>

                          <Heading
                            fontSize="md"
                            color="brand.900"
                            lineHeight="1.6"
                            mb={4}
                          >
                            {question.questionText}
                          </Heading>

                          <Grid
                            templateColumns={{
                              base: "1fr",
                              md: "repeat(2, 1fr)",
                            }}
                            gap={3}
                          >
                            {question.options?.map(
                              (option, optionIndex) => (
                                <Box
                                  key={optionIndex}
                                  p={3}
                                  border="1px solid"
                                  borderColor={
                                    optionIndex ===
                                    question.correctAnswer
                                      ? "green.300"
                                      : "khaki.200"
                                  }
                                  bg={
                                    optionIndex ===
                                    question.correctAnswer
                                      ? "green.50"
                                      : "white"
                                  }
                                  borderRadius="8px"
                                >
                                  <Text
                                    fontSize="sm"
                                    fontWeight={
                                      optionIndex ===
                                      question.correctAnswer
                                        ? "700"
                                        : "400"
                                    }
                                  >
                                    {String.fromCharCode(
                                      65 + optionIndex
                                    )}
                                    . {option}
                                  </Text>
                                </Box>
                              )
                            )}
                          </Grid>

                          <Flex
                            gap={3}
                            mt={5}
                            wrap="wrap"
                          >
                            <Box
                              px={3}
                              py={1}
                              bg="blue.50"
                              color="blue.700"
                              borderRadius="full"
                              fontSize="xs"
                              fontWeight="600"
                            >
                              {question.difficulty}
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
                              +{question.marks} marks
                            </Box>

                            <Box
                              px={3}
                              py={1}
                              bg="red.50"
                              color="red.700"
                              borderRadius="full"
                              fontSize="xs"
                              fontWeight="600"
                            >
                              -{question.negativeMarks}
                            </Box>
                          </Flex>

                          {question.explanation && (
                            <Box
                              mt={5}
                              p={4}
                              bg="khaki.50"
                              borderRadius="8px"
                            >
                              <Text
                                fontSize="xs"
                                fontWeight="700"
                                color="brand.700"
                                mb={1}
                              >
                                EXPLANATION
                              </Text>

                              <Text
                                fontSize="sm"
                                color="charcoal.600"
                              >
                                {question.explanation}
                              </Text>
                            </Box>
                          )}
                        </Box>

                        <Button
                          variant="outline"
                          borderColor="red.400"
                          color="red.600"
                          onClick={() =>
                            handleDelete(question)
                          }
                        >
                          <FiTrash2 />
                        </Button>
                      </Flex>
                    </Box>
                  )
                )}
              </VStack>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default AdminQuestions;