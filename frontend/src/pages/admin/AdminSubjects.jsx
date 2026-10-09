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
  FiEdit,
  FiTrash2,
} from "react-icons/fi";

import api from "../../services/api";

function AdminSubjects() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [topics, setTopics] = useState([]);

  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);

  const [subjectForm, setSubjectForm] = useState({
    name: "",
    description: "",
    displayOrder: 1,
  });

  const [topicForm, setTopicForm] = useState({
    name: "",
    description: "",
    displayOrder: 1,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================
  // LOAD EXAMS
  // =========================

  const loadExams = async () => {
    try {
      setLoadingExams(true);
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
      setLoadingExams(false);
    }
  };

  useEffect(() => {
    if (error) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [error]);

  useEffect(() => {
    loadExams();
  }, []);

  // =========================
  // LOAD SUBJECTS
  // =========================

  const loadSubjects = async (examId) => {
    try {
      setLoadingSubjects(true);
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
      setLoadingSubjects(false);
    }
  };

  // =========================
  // LOAD TOPICS
  // =========================

  const loadTopics = async (subjectId) => {
    try {
      setLoadingTopics(true);
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
      setLoadingTopics(false);
    }
  };

  // =========================
  // SELECT EXAM
  // =========================

  const handleSelectExam = async (exam) => {
    setSelectedExam(exam);
    setSelectedSubject(null);
    setTopics([]);

    setShowSubjectForm(false);
    setShowTopicForm(false);

    await loadSubjects(exam._id);
  };

  // =========================
  // SELECT SUBJECT
  // =========================

  const handleSelectSubject = async (subject) => {
    setSelectedSubject(subject);
    setShowTopicForm(false);

    await loadTopics(subject._id);
  };

  // =========================
  // SUBJECT FORM
  // =========================

  const handleSubjectChange = (e) => {
    setSubjectForm({
      ...subjectForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();

    if (!selectedExam) return;

    if (!subjectForm.name.trim()) {
      setError("Subject name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.post("/subjects", {
        examId: selectedExam._id,
        name: subjectForm.name.trim(),
        description: subjectForm.description.trim(),
        displayOrder: Number(subjectForm.displayOrder),
      });

      setSuccess("Subject created successfully.");

      setSubjectForm({
        name: "",
        description: "",
        displayOrder: subjects.length + 1,
      });

      setShowSubjectForm(false);

      await loadSubjects(selectedExam._id);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Create subject error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to create subject."
      );
    } finally {
      setSaving(false);
    }
  };


  const handleDeleteSubject = async (subject) => {
    if (!window.confirm(`Delete subject "${subject.name}"? Its topics will no longer be active.`)) return;
    try {
      setError("");
      setSuccess("");
      await api.delete(`/subjects/${subject._id}`);
      if (selectedSubject?._id === subject._id) {
        setSelectedSubject(null);
        setTopics([]);
      }
      setSuccess("Subject deleted successfully.");
      await loadSubjects(selectedExam._id);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to delete subject.");
    }
  };

  const handleDeleteTopic = async (topic) => {
    if (!window.confirm(`Delete topic "${topic.name}"?`)) return;
    try {
      setError("");
      setSuccess("");
      await api.delete(`/topics/${topic._id}`);
      setSuccess("Topic deleted successfully.");
      await loadTopics(selectedSubject._id);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to delete topic.");
    }
  };

  // =========================
  // TOPIC FORM
  // =========================

  const handleTopicChange = (e) => {
    setTopicForm({
      ...topicForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();

    if (!selectedSubject) return;

    if (!topicForm.name.trim()) {
      setError("Topic name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.post("/topics", {
        subjectId: selectedSubject._id,
        name: topicForm.name.trim(),
        description: topicForm.description.trim(),
        displayOrder: Number(topicForm.displayOrder),
      });

      setSuccess("Topic created successfully.");

      setTopicForm({
        name: "",
        description: "",
        displayOrder: topics.length + 1,
      });

      setShowTopicForm(false);

      await loadTopics(selectedSubject._id);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Create topic error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to create topic."
      );
    } finally {
      setSaving(false);
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

              <Heading fontSize={{ base: "xl", md: "2xl" }}>
                Subjects & Topics
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
            SELECT EXAM
        ========================== */}

        <Box mb={8}>
          <Heading
            fontSize="2xl"
            color="brand.900"
            mb={2}
          >
            Select Examination
          </Heading>

          <Text
            color="charcoal.500"
            mb={5}
          >
            Choose an exam to manage its subjects and topics.
          </Text>

          {loadingExams ? (
            <Flex
              minH="150px"
              align="center"
              justify="center"
            >
              <Spinner
                size="lg"
                color="brand.600"
              />
            </Flex>
          ) : (
            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              }}
              gap={5}
            >
              {exams.map((exam) => {
                const active =
                  selectedExam?._id === exam._id;

                return (
                  <Box
                    key={exam._id}
                    bg="white"
                    border="2px solid"
                    borderColor={
                      active
                        ? "gold.400"
                        : "khaki.200"
                    }
                    borderRadius="14px"
                    p={5}
                    cursor="pointer"
                    boxShadow="sm"
                    onClick={() =>
                      handleSelectExam(exam)
                    }
                    _hover={{
                      borderColor: "gold.400",
                      boxShadow: "md",
                    }}
                  >
                    <Heading
                      fontSize="lg"
                      color="brand.900"
                      mb={2}
                    >
                      {exam.name}
                    </Heading>

                    <Text
                      fontSize="sm"
                      color="charcoal.500"
                    >
                      {exam.category}
                    </Text>
                  </Box>
                );
              })}
            </Grid>
          )}
        </Box>

        {/* =========================
            SUBJECTS
        ========================== */}

        {selectedExam && (
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
              align={{ base: "flex-start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap={4}
              mb={6}
            >
              <Box>
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  color="gold.600"
                  letterSpacing="0.08em"
                >
                  SELECTED EXAM
                </Text>

                <Heading
                  fontSize="xl"
                  color="brand.900"
                  mt={1}
                >
                  {selectedExam.name}
                </Heading>
              </Box>

              <Button
                bg="brand.700"
                color="white"
                onClick={() =>
                  setShowSubjectForm(!showSubjectForm)
                }
                _hover={{
                  bg: "brand.800",
                }}
              >
                <FiPlus />
                <Text ml={2}>Add Subject</Text>
              </Button>
            </Flex>

            {/* Subject Form */}

            {showSubjectForm && (
              <Box
                bg="khaki.50"
                border="1px solid"
                borderColor="khaki.200"
                borderRadius="12px"
                p={5}
                mb={6}
              >
                <Heading
                  fontSize="lg"
                  color="brand.900"
                  mb={5}
                >
                  Create Subject
                </Heading>

                <form onSubmit={handleCreateSubject}>
                  <VStack
                    gap={4}
                    align="stretch"
                  >
                    <Box>
                      <Text
                        mb={2}
                        fontWeight="600"
                      >
                        Subject Name
                      </Text>

                      <Input
                        name="name"
                        value={subjectForm.name}
                        onChange={handleSubjectChange}
                        placeholder="Example: Quantitative Aptitude"
                        bg="white"
                      />
                    </Box>

                    <Box>
                      <Text
                        mb={2}
                        fontWeight="600"
                      >
                        Description
                      </Text>

                      <Textarea
                        name="description"
                        value={subjectForm.description}
                        onChange={handleSubjectChange}
                        placeholder="Enter subject description"
                        bg="white"
                      />
                    </Box>

                    <Box>
                      <Text
                        mb={2}
                        fontWeight="600"
                      >
                        Display Order
                      </Text>

                      <Input
                        type="number"
                        name="displayOrder"
                        min="1"
                        value={subjectForm.displayOrder}
                        onChange={handleSubjectChange}
                        bg="white"
                      />
                    </Box>

                    <Flex gap={3}>
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
                        Create Subject
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setShowSubjectForm(false)
                        }
                      >
                        Cancel
                      </Button>
                    </Flex>
                  </VStack>
                </form>
              </Box>
            )}

            {/* Subject List */}

            {loadingSubjects ? (
              <Flex
                minH="180px"
                align="center"
                justify="center"
              >
                <Spinner
                  size="lg"
                  color="brand.600"
                />
              </Flex>
            ) : subjects.length === 0 ? (
              <Box
                bg="khaki.50"
                borderRadius="12px"
                p={8}
                textAlign="center"
              >
                <Heading
                  fontSize="lg"
                  color="brand.900"
                  mb={2}
                >
                  No subjects yet
                </Heading>

                <Text color="charcoal.500">
                  Add the first subject for this exam.
                </Text>
              </Box>
            ) : (
              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                }}
                gap={5}
              >
                {subjects.map((subject) => {
                  const active =
                    selectedSubject?._id ===
                    subject._id;

                  return (
                    <Box
                      key={subject._id}
                      border="2px solid"
                      borderColor={
                        active
                          ? "gold.400"
                          : "khaki.200"
                      }
                      borderRadius="12px"
                      p={5}
                      cursor="pointer"
                      onClick={() =>
                        handleSelectSubject(subject)
                      }
                      _hover={{
                        borderColor: "gold.400",
                      }}
                    >
                      <Flex
                        justify="space-between"
                        align="flex-start"
                      >
                        <Box>
                          <Heading
                            fontSize="md"
                            color="brand.900"
                            mb={2}
                          >
                            {subject.name}
                          </Heading>

                          <Text
                            fontSize="sm"
                            color="charcoal.500"
                          >
                            {subject.description ||
                              "No description"}
                          </Text>
                        </Box>

                        <VStack align="flex-end" gap={2}>
                          <Text fontSize="xs" fontWeight="700" color="charcoal.500">#{subject.displayOrder}</Text>
                          <Button size="xs" variant="outline" borderColor="red.400" color="red.600" onClick={(event) => { event.stopPropagation(); handleDeleteSubject(subject); }}>
                            <FiTrash2 />
                            <Text ml={1}>Delete</Text>
                          </Button>
                        </VStack>
                      </Flex>
                    </Box>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}

        {/* =========================
            TOPICS
        ========================== */}

        {selectedSubject && (
          <Box
            bg="white"
            border="1px solid"
            borderColor="khaki.200"
            borderRadius="16px"
            p={{ base: 5, md: 7 }}
          >
            <Flex
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap={4}
              mb={6}
            >
              <Box>
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  color="gold.600"
                  letterSpacing="0.08em"
                >
                  SELECTED SUBJECT
                </Text>

                <Heading
                  fontSize="xl"
                  color="brand.900"
                  mt={1}
                >
                  {selectedSubject.name}
                </Heading>
              </Box>

              <Button
                bg="brand.700"
                color="white"
                onClick={() =>
                  setShowTopicForm(!showTopicForm)
                }
                _hover={{
                  bg: "brand.800",
                }}
              >
                <FiPlus />
                <Text ml={2}>Add Topic</Text>
              </Button>
            </Flex>

            {/* Topic Form */}

            {showTopicForm && (
              <Box
                bg="khaki.50"
                border="1px solid"
                borderColor="khaki.200"
                borderRadius="12px"
                p={5}
                mb={6}
              >
                <Heading
                  fontSize="lg"
                  color="brand.900"
                  mb={5}
                >
                  Create Topic
                </Heading>

                <form onSubmit={handleCreateTopic}>
                  <VStack
                    gap={4}
                    align="stretch"
                  >
                    <Box>
                      <Text
                        mb={2}
                        fontWeight="600"
                      >
                        Topic Name
                      </Text>

                      <Input
                        name="name"
                        value={topicForm.name}
                        onChange={handleTopicChange}
                        placeholder="Example: Percentage"
                        bg="white"
                      />
                    </Box>

                    <Box>
                      <Text
                        mb={2}
                        fontWeight="600"
                      >
                        Description
                      </Text>

                      <Textarea
                        name="description"
                        value={topicForm.description}
                        onChange={handleTopicChange}
                        placeholder="Enter topic description"
                        bg="white"
                      />
                    </Box>

                    <Box>
                      <Text
                        mb={2}
                        fontWeight="600"
                      >
                        Display Order
                      </Text>

                      <Input
                        type="number"
                        name="displayOrder"
                        min="1"
                        value={topicForm.displayOrder}
                        onChange={handleTopicChange}
                        bg="white"
                      />
                    </Box>

                    <Flex gap={3}>
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
                        Create Topic
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setShowTopicForm(false)
                        }
                      >
                        Cancel
                      </Button>
                    </Flex>
                  </VStack>
                </form>
              </Box>
            )}

            {/* Topic List */}

            {loadingTopics ? (
              <Flex
                minH="180px"
                align="center"
                justify="center"
              >
                <Spinner
                  size="lg"
                  color="brand.600"
                />
              </Flex>
            ) : topics.length === 0 ? (
              <Box
                bg="khaki.50"
                borderRadius="12px"
                p={8}
                textAlign="center"
              >
                <Heading
                  fontSize="lg"
                  color="brand.900"
                  mb={2}
                >
                  No topics yet
                </Heading>

                <Text color="charcoal.500">
                  Add topics for this subject.
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
                {topics.map((topic) => (
                  <Box
                    key={topic._id}
                    border="1px solid"
                    borderColor="khaki.200"
                    borderRadius="12px"
                    p={5}
                  >
                    <Flex
                      justify="space-between"
                      align="flex-start"
                      gap={3}
                    >
                      <Heading
                        fontSize="md"
                        color="brand.900"
                      >
                        {topic.name}
                      </Heading>

                      <Text
                        fontSize="xs"
                        fontWeight="700"
                        color="charcoal.500"
                      >
                        #{topic.displayOrder}
                      </Text>
                    </Flex>

                    <Text mt={3} fontSize="sm" color="charcoal.500">
                      {topic.description || "No description"}
                    </Text>
                    <Button mt={4} size="xs" variant="outline" borderColor="red.400" color="red.600" onClick={() => handleDeleteTopic(topic)}>
                      <FiTrash2 />
                      <Text ml={1}>Delete</Text>
                    </Button>
                  </Box>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default AdminSubjects;