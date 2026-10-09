import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
} from "@chakra-ui/react";

import {
  FiBookOpen,
  FiBell,
  FiFileText,
  FiLogOut,
  FiHelpCircle,
  FiCreditCard,
  FiHome,
  FiUsers,
  FiDollarSign,
} from "react-icons/fi";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((response) => setStats(response.data.stats)).catch((error) => console.error("Admin dashboard stats error:", error));
  }, []);

  const [admin] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("lakshyapath_admin_user")
      );
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("lakshyapath_admin_token");
    localStorage.removeItem("lakshyapath_admin_user");

    navigate("/admin/login");
  };

  const cards = [
    {
      title: "Exams",
      description:
        "Create and manage competitive examinations.",
      icon: FiBookOpen,
      action: () => navigate("/admin/exams"),
    },
    {
      title: "Subjects & Topics",
      description:
        "Manage subjects and preparation topics.",
      icon: FiFileText,
      action: () => navigate("/admin/subjects"),
    },
    {
      title: "Questions",
      description:
        "Create and manage practice questions.",
      icon: FiHelpCircle,
      action: () => navigate("/admin/questions"),
    },
    {
      title: "Mock Tests",
      description:
        "Create and manage competitive exam mock tests.",
      icon: FiFileText,
      action: () => navigate("/admin/tests"),
    },
    {
  title: "Plans & Pricing",
  description:
    "Manage premium plans, pricing and festive offers.",
  icon: FiCreditCard,
  action: () => navigate("/admin/plans"),
},
    {
      title: "Home Content",
      description:
        "Add, edit, reorder and remove public Home-page content.",
      icon: FiHome,
      action: () => navigate("/admin/home-content"),
    },
    {
      title: "Notifications",
      description:
        "Send exam and application notifications to students.",
      icon: FiBell,
      action: () => navigate("/admin/notifications"),
    },
  ];

  return (
    <Box
      minH="100vh"
      bg="khaki.50"
    >
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
            gap={5}
          >
            <Box>
              <Text
                fontSize="xs"
                fontWeight="800"
                letterSpacing="0.12em"
                color="gold.300"
              >
                LAKSHYAPATH
              </Text>

              <Heading
                fontSize={{ base: "xl", md: "2xl" }}
                mt={1}
              >
                Admin Dashboard
              </Heading>
            </Box>

            <Button
              variant="outline"
              borderColor="gold.400"
              color="gold.300"
              onClick={handleLogout}
              _hover={{
                bg: "whiteAlpha.100",
              }}
            >
              <FiLogOut />
              <Text ml={2}>Logout</Text>
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* Main */}
      <Container
        maxW="1280px"
        py={{ base: 8, md: 12 }}
      >
        <Box mb={8}>
          <Heading
            color="brand.900"
            fontSize={{ base: "2xl", md: "3xl" }}
          >
            Welcome, {admin?.fullName || "Admin"}
          </Heading>

          <Text
            color="charcoal.500"
            mt={2}
          >
            Manage LakshyaPath preparation content and student notifications.
          </Text>
        </Box>

        {stats && (
          <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4} mb={8}>
            {[
              ["Students", stats.students],
              ["Premium Active", stats.premiumSubscriptions],
              ["Test Attempts", stats.attempts],
              ["Revenue", `₹${stats.revenue}`],
            ].map(([label, value]) => (
              <Box key={label} bg="white" border="1px solid" borderColor="khaki.200" borderRadius="xl" p={5}>
                <Text fontSize="xs" color="charcoal.500">{label}</Text>
                <Heading mt={1} fontSize="2xl" color="brand.900">{value}</Heading>
              </Box>
            ))}
          </Grid>
        )}

        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={6}
        >
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Box
                key={card.title}
                bg="white"
                border="1px solid"
                borderColor="khaki.200"
                borderRadius="16px"
                p={7}
                boxShadow="sm"
                transition="all 0.2s ease"
                _hover={{
                  transform: "translateY(-3px)",
                  boxShadow: "md",
                  borderColor: "gold.400",
                }}
              >
                <Box
                  w="50px"
                  h="50px"
                  borderRadius="12px"
                  bg="brand.50"
                  color="brand.700"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mb={5}
                >
                  <Icon size={24} />
                </Box>

                <Heading
                  fontSize="lg"
                  color="brand.900"
                  mb={2}
                >
                  {card.title}
                </Heading>

                <Text
                  fontSize="sm"
                  color="charcoal.500"
                  lineHeight="1.7"
                  mb={6}
                >
                  {card.description}
                </Text>

                <Button
                  width="100%"
                  bg="brand.700"
                  color="white"
                  onClick={card.action}
                  _hover={{
                    bg: "brand.800",
                  }}
                >
                  Manage {card.title}
                </Button>
              </Box>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}

export default AdminDashboard;