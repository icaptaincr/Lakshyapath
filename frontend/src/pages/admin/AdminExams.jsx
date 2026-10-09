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
  FiEdit,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import api from "../../services/api";

function AdminExams() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingExam, setEditingExam] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "SSC",
    description: "",
    expectedExamDate: "",
    notificationStatus: "Not Announced",
  });

  // Scroll to top when an error occurs
  useEffect(() => {
    if (error) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [error]);

  // Load exams
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

  useEffect(() => {
    loadExams();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      category: "SSC",
      description: "",
      expectedExamDate: "",
      notificationStatus: "Not Announced",
    });

    setEditingExam(null);
    setShowForm(false);
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Create / Update exam
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Exam name is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        expectedExamDate: formData.expectedExamDate || null,
        notificationStatus: formData.notificationStatus,
      };

      if (editingExam) {
        await api.put(`/exams/${editingExam._id}`, payload);
        setSuccess("Exam updated successfully.");
      } else {
        await api.post("/exams", payload);
        setSuccess("Exam created successfully.");
      }

      resetForm();
      await loadExams();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Save exam error:", error);

      setError(
        error.response?.data?.message || "Unable to save exam."
      );
    } finally {
      setSaving(false);
    }
  };

  // Edit exam
  const handleEdit = (exam) => {
    setEditingExam(exam);

    setFormData({
      name: exam.name || "",
      category: exam.category || "SSC",
      description: exam.description || "",
      expectedExamDate: exam.expectedExamDate
        ? exam.expectedExamDate.split("T")[0]
        : "",
      notificationStatus:
        exam.notificationStatus || "Not Announced",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete exam
  const handleDelete = async (exam) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${exam.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`/exams/${exam._id}`);

      setSuccess("Exam deleted successfully.");

      await loadExams();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Delete exam error:", error);

      setError(
        error.response?.data?.message || "Unable to delete exam."
      );
    }
  };

  return (
    <Box minH="100vh" bg="khaki.50">
      {/* Header */}
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
                Exam Management
              </Heading>
            </Box>

            <Button
              variant="outline"
              borderColor="gold.400"
              color="gold.300"
              onClick={() => navigate("/admin/dashboard")}
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

      <Container maxW="1280px" py={{ base: 8, md: 12 }}>
        {/* Error message */}
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

        {/* Success message */}
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

        {/* Add / Edit Form */}
        {showForm && (
          <Box
            bg="white"
            border="1px solid"
            borderColor="khaki.200"
            borderRadius="16px"
            p={{ base: 5, md: 7 }}
            mb={8}
            boxShadow="sm"
          >
            <Flex
              justify="space-between"
              align="center"
              mb={6}
            >
              <Heading
                fontSize="xl"
                color="brand.900"
              >
                {editingExam ? "Edit Exam" : "Create New Exam"}
              </Heading>

              <Button
                variant="ghost"
                onClick={resetForm}
              >
                <FiX />
              </Button>
            </Flex>

            <form onSubmit={handleSubmit}>
              <VStack gap={5} align="stretch">
                {/* Exam Name */}
                <Box>
                  <Text
                    mb={2}
                    fontWeight="600"
                    color="brand.900"
                  >
                    Exam Name
                  </Text>

                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Example: SSC CGL"
                  />
                </Box>

                {/* Category + Date */}
                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "repeat(2, 1fr)",
                  }}
                  gap={5}
                >
                  {/* Category */}
                  <Box>
                    <Text
                      mb={2}
                      fontWeight="600"
                      color="brand.900"
                    >
                      Category
                    </Text>

                    <Box
                      as="select"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      width="100%"
                      height="40px"
                      px={3}
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="md"
                      bg="white"
                    >
                      <option value="SSC">SSC</option>
                      <option value="RRB">RRB</option>
                      <option value="Banking">Banking</option>
                      <option value="UPSC">UPSC</option>
                      <option value="Defence">Defence</option>
                      <option value="State PSC">State PSC</option>
                    </Box>
                  </Box>

                  {/* Exam Date */}
                  <Box>
                    <Text
                      mb={2}
                      fontWeight="600"
                      color="brand.900"
                    >
                      Expected Exam Date
                    </Text>

                    <Input
                      type="date"
                      name="expectedExamDate"
                      value={formData.expectedExamDate}
                      onChange={handleChange}
                    />
                  </Box>
                </Grid>

                {/* Notification Status */}
                <Box>
                  <Text
                    mb={2}
                    fontWeight="600"
                    color="brand.900"
                  >
                    Notification Status
                  </Text>

                  <Box
                    as="select"
                    name="notificationStatus"
                    value={formData.notificationStatus}
                    onChange={handleChange}
                    width="100%"
                    height="40px"
                    px={3}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="white"
                  >
                    <option value="Not Announced">
                      Not Announced
                    </option>

                    <option value="Expected">
                      Expected
                    </option>

                    <option value="Confirmed">
                      Confirmed
                    </option>
                  </Box>
                </Box>

                {/* Description */}
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
                    placeholder="Enter exam description"
                    rows={4}
                  />
                </Box>

                {/* Buttons */}
                <Flex
                  justify="flex-end"
                  gap={3}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    bg="brand.700"
                    color="white"
                    loading={saving}
                    _hover={{
                      bg: "brand.800",
                    }}
                  >
                    {editingExam ? "Update Exam" : "Create Exam"}
                  </Button>
                </Flex>
              </VStack>
            </form>
          </Box>
        )}

        {/* Page Heading */}
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
              fontSize={{ base: "2xl", md: "3xl" }}
            >
              Competitive Exams
            </Heading>

            <Text
              color="charcoal.500"
              mt={2}
            >
              Add and manage examinations available on LakshyaPath.
            </Text>
          </Box>

          {!showForm && (
            <Button
              bg="brand.700"
              color="white"
              onClick={() => setShowForm(true)}
              _hover={{
                bg: "brand.800",
              }}
            >
              <FiPlus />
              <Text ml={2}>Add Exam</Text>
            </Button>
          )}
        </Flex>

        {/* Exams */}
        {loading ? (
          <Flex
            minH="300px"
            align="center"
            justify="center"
          >
            <VStack gap={4}>
              <Spinner
                size="xl"
                color="brand.600"
                borderWidth="3px"
              />

              <Text color="charcoal.500">
                Loading exams...
              </Text>
            </VStack>
          </Flex>
        ) : exams.length === 0 ? (
          <Box
            bg="white"
            border="1px solid"
            borderColor="khaki.200"
            borderRadius="16px"
            p={10}
            textAlign="center"
          >
            <Heading
              fontSize="xl"
              color="brand.900"
              mb={2}
            >
              No exams found
            </Heading>

            <Text color="charcoal.500">
              Create your first competitive exam.
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
              <Box
                key={exam._id}
                bg="white"
                border="1px solid"
                borderColor="khaki.200"
                borderRadius="16px"
                p={6}
                boxShadow="sm"
              >
                {/* Card Header */}
                <Flex
                  justify="space-between"
                  align="flex-start"
                  gap={3}
                  mb={4}
                >
                  <Heading
                    fontSize="lg"
                    color="brand.900"
                  >
                    {exam.name}
                  </Heading>

                  <Box
                    px={3}
                    py={1}
                    bg="gold.100"
                    color="brand.900"
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="700"
                  >
                    {exam.category}
                  </Box>
                </Flex>

                {/* Description */}
                <Text
                  color="charcoal.500"
                  fontSize="sm"
                  minH="48px"
                  mb={4}
                >
                  {exam.description || "No description available."}
                </Text>

                {/* Status */}
                <Text
                  fontSize="sm"
                  color="charcoal.600"
                  mb={2}
                >
                  <strong>Status:</strong>{" "}
                  {exam.notificationStatus}
                </Text>

                {/* Exam Date */}
                <Text
                  fontSize="sm"
                  color="charcoal.600"
                  mb={6}
                >
                  <strong>Exam Date:</strong>{" "}
                  {exam.expectedExamDate
                    ? new Date(
                        exam.expectedExamDate
                      ).toLocaleDateString("en-IN")
                    : "Not announced"}
                </Text>

                {/* Actions */}
                <Flex gap={3}>
                  <Button
                    flex="1"
                    variant="outline"
                    borderColor="brand.600"
                    color="brand.700"
                    onClick={() => handleEdit(exam)}
                  >
                    <FiEdit />
                    <Text ml={2}>Edit</Text>
                  </Button>

                  <Button
                    variant="outline"
                    borderColor="red.400"
                    color="red.600"
                    onClick={() => handleDelete(exam)}
                  >
                    <FiTrash2 />
                  </Button>
                </Flex>
              </Box>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default AdminExams;