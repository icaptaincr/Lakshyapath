import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Flex, Heading, Text, VStack, Badge } from "@chakra-ui/react";
import { FiArrowLeft, FiBell, FiClock, FiCheckCircle } from "react-icons/fi";
import api from "../../services/api";

function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get("/user-notifications");
      setItems(response.data.notifications || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const action = async (id, type) => {
    try {
      await api.put(`/user-notifications/${id}/${type}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update notification.");
    }
  };

  return <Box minH="calc(100vh - 76px)" bg="khaki.50" py={10}><Container maxW="1000px">
    <Button variant="ghost" color="brand.700" mb={5} onClick={() => navigate("/dashboard")}><FiArrowLeft /><Text ml={2}>Dashboard</Text></Button>
    <Flex justify="space-between" align="center" mb={7}><Box><Heading color="brand.900">Notifications</Heading><Text mt={2} color="charcoal.500">Exam updates, application dates and important LakshyaPath alerts.</Text></Box><FiBell size={28} color="#A27B1A" /></Flex>
    {error && <Box mb={5} p={4} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg"><Text color="red.700">{error}</Text></Box>}
    {loading ? <Flex justify="center" py={12}><Text>Loading notifications...</Text></Flex> : items.length === 0 ? <Box bg="white" p={10} borderRadius="xl" textAlign="center"><Text color="charcoal.500">No notifications available.</Text></Box> : <VStack align="stretch" gap={4}>{items.map(({ notification, status, userNotificationId, remindAt }) => <Box key={userNotificationId} bg="white" border="1px solid" borderColor={status === "unread" ? "gold.300" : "khaki.200"} borderRadius="xl" p={6} boxShadow="sm">
      <Flex justify="space-between" gap={4}><Box><Text fontSize="xs" fontWeight="800" color="gold.600">{notification.type}</Text><Heading fontSize="lg" color="brand.900" mt={1}>{notification.title}</Heading></Box><Badge colorPalette={status === "unread" ? "yellow" : status === "already_applied" ? "green" : "gray"}>{status.replace("_", " ")}</Badge></Flex>
      <Text mt={4} color="charcoal.700" lineHeight="1.7">{notification.message}</Text>
      <Text mt={3} fontSize="xs" color="charcoal.500">Exam: {notification.examId?.name || "LakshyaPath"}{notification.lastDate ? ` • Last date: ${new Date(notification.lastDate).toLocaleDateString("en-IN")}` : ""}</Text>
      {remindAt && <Text mt={2} fontSize="xs" color="gold.700">Reminder: {new Date(remindAt).toLocaleString("en-IN")}</Text>}
      <Flex mt={5} gap={3} wrap="wrap">
        {status === "unread" && <Button size="sm" variant="outline" onClick={() => action(userNotificationId, "read")}><FiCheckCircle /><Text ml={2}>Mark Read</Text></Button>}
        {(status === "unread" || status === "read") && <Button size="sm" variant="outline" onClick={() => action(userNotificationId, "remind")}><FiClock /><Text ml={2}>Remind Me Later</Text></Button>}
        {(status === "unread" || status === "read" || status === "remind_later") && <Button size="sm" bg="brand.700" color="white" onClick={() => action(userNotificationId, "applied")}><FiCheckCircle /><Text ml={2}>Already Applied</Text></Button>}
      </Flex>
    </Box>)}</VStack>}
  </Container></Box>;
}
export default Notifications;
