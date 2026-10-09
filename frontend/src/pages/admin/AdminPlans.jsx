import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";

import api from "../../services/api";

const AdminPlans = () => {
  const [exams, setExams] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    examId: "",
    name: "Premium",
    durationDays: 30,
    price: "",
    offerPrice: "",
    offerName: "",
    offerStartDate: "",
    offerEndDate: "",
    features: "",
  });

  const loadData = async () => {
    try {
      const [examResponse, planResponse] = await Promise.all([
        api.get("/exams"),
        api.get("/plans"),
      ]);

      setExams(examResponse.data?.exams || []);
      setPlans(planResponse.data?.plans || []);
    } catch (error) {
      console.error("Failed to load plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createPlan = async (e) => {
    e.preventDefault();

    try {
      const features = form.features
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      await api.post("/plans", {
        examId: form.examId,
        name: form.name,
        durationDays: Number(form.durationDays),
        price: Number(form.price),
        offerPrice:
          form.offerPrice === ""
            ? null
            : Number(form.offerPrice),
        offerName:
          form.offerName.trim() || null,
        offerStartDate:
          form.offerStartDate || null,
        offerEndDate:
          form.offerEndDate || null,
        features,
        isActive: true,
      });

      alert("Plan created successfully.");

      setForm({
        examId: "",
        name: "Premium",
        durationDays: 30,
        price: "",
        offerPrice: "",
        offerName: "",
        offerStartDate: "",
        offerEndDate: "",
        features: "",
      });

      loadData();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create plan."
      );
    }
  };

  if (loading) {
    return (
      <Box p={8}>
        <Text>Loading plans...</Text>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Heading
        mb={2}
        color="#26352A"
      >
        Plan Management
      </Heading>

      <Text
        mb={8}
        color="gray.600"
      >
        Manage exam pricing, premium plans and
        festive offers.
      </Text>

      {/* Create Plan */}
      <Box
        maxW="800px"
        p={6}
        mb={10}
        border="1px solid"
        borderColor="#D6C8A8"
        borderRadius="xl"
        bg="#F7F3E8"
      >
        <Heading
          size="md"
          mb={5}
          color="#26352A"
        >
          Create New Plan
        </Heading>

        <form onSubmit={createPlan}>
          <VStack
            align="stretch"
            gap={4}
          >
            <Box>
              <Text mb={1} fontWeight="bold">
                Exam
              </Text>

              <Box
                as="select"
                name="examId"
                value={form.examId}
                onChange={handleChange}
                w="100%"
                p={3}
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
                bg="white"
                required
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

            <Box>
              <Text mb={1} fontWeight="bold">
                Plan Type
              </Text>

              <Box
                as="select"
                name="name"
                value={form.name}
                onChange={handleChange}
                w="100%"
                p={3}
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
                bg="white"
              >
                <option value="Premium">
                  Premium
                </option>
                <option value="Free">
                  Free
                </option>
              </Box>
            </Box>

            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              gap={4}
            >
              <Box>
                <Text mb={1} fontWeight="bold">
                  Duration (Days)
                </Text>

                <Input
                  name="durationDays"
                  type="number"
                  value={form.durationDays}
                  onChange={handleChange}
                  bg="white"
                  min="1"
                />
              </Box>

              <Box>
                <Text mb={1} fontWeight="bold">
                  Regular Price (₹)
                </Text>

                <Input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  bg="white"
                  min="0"
                  required
                />
              </Box>
            </SimpleGrid>

            <Heading
              size="sm"
              color="#A27B1A"
              mt={2}
            >
              Festival / Special Offer
            </Heading>

            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              gap={4}
            >
              <Box>
                <Text mb={1} fontWeight="bold">
                  Offer Price (₹)
                </Text>

                <Input
                  name="offerPrice"
                  type="number"
                  value={form.offerPrice}
                  onChange={handleChange}
                  bg="white"
                  min="0"
                />
              </Box>

              <Box>
                <Text mb={1} fontWeight="bold">
                  Offer Name
                </Text>

                <Input
                  name="offerName"
                  value={form.offerName}
                  onChange={handleChange}
                  placeholder="Diwali Special"
                  bg="white"
                />
              </Box>

              <Box>
                <Text mb={1} fontWeight="bold">
                  Offer Start
                </Text>

                <Input
                  name="offerStartDate"
                  type="datetime-local"
                  value={form.offerStartDate}
                  onChange={handleChange}
                  bg="white"
                />
              </Box>

              <Box>
                <Text mb={1} fontWeight="bold">
                  Offer End
                </Text>

                <Input
                  name="offerEndDate"
                  type="datetime-local"
                  value={form.offerEndDate}
                  onChange={handleChange}
                  bg="white"
                />
              </Box>
            </SimpleGrid>

            <Box>
              <Text mb={1} fontWeight="bold">
                Features
              </Text>

              <textarea
                name="features"
                value={form.features}
                onChange={handleChange}
                placeholder={
                  "Premium Mock Tests\nDetailed Performance Analysis\nAdvanced Progress Tracking"
                }
                rows={5}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #CBD5E0",
                  borderRadius: "6px",
                  background: "white",
                }}
              />
            </Box>

            <Button
              type="submit"
              bg="#3F4F3A"
              color="white"
              _hover={{
                bg: "#2F3C2C",
              }}
            >
              Create Plan
            </Button>
          </VStack>
        </form>
      </Box>

      {/* Existing Plans */}
      <Heading
        size="md"
        mb={5}
        color="#26352A"
      >
        Existing Plans
      </Heading>

      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3 }}
        gap={5}
      >
        {plans.map((plan) => (
          <Box
            key={plan._id}
            p={5}
            border="1px solid"
            borderColor="#D6C8A8"
            borderRadius="xl"
            bg="white"
            boxShadow="sm"
          >
            <Text
              fontSize="sm"
              color="gray.500"
            >
              {plan.examId?.name}
            </Text>

            <Heading
              size="md"
              mt={1}
              color="#26352A"
            >
              {plan.name}
            </Heading>

            <HStack mt={4}>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color="#A27B1A"
              >
                ₹{plan.offerPrice || plan.price}
              </Text>

              {plan.offerPrice && (
                <Text
                  textDecoration="line-through"
                  color="gray.500"
                >
                  ₹{plan.price}
                </Text>
              )}
            </HStack>

            {plan.offerName && (
              <Text
                mt={2}
                fontWeight="bold"
                color="#3F4F3A"
              >
                {plan.offerName}
              </Text>
            )}

            <Text
              mt={2}
              fontSize="sm"
              color="gray.600"
            >
              {plan.durationDays} days
            </Text>

            <Text
              mt={3}
              fontSize="sm"
              color={
                plan.isActive
                  ? "green.600"
                  : "red.600"
              }
            >
              {plan.isActive
                ? "Active"
                : "Inactive"}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default AdminPlans;