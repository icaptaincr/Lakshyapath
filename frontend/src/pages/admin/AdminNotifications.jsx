import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Flex, Grid, Heading, Input, Text, Textarea, VStack } from "@chakra-ui/react";
import { FiArrowLeft, FiBell, FiEdit, FiPlus, FiTrash2 } from "react-icons/fi";
import api from "../../services/api";

const initialForm = {
  examId: "",
  type: "APPLICATION_OPEN",
  audience: "ALL_STUDENTS",
  title: "",
  message: "",
  applicationStart: "",
  lastDate: "",
  sendEmail: true,
};

function AdminNotifications() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (error) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [error]);

  const load = async () => {
    try {
      setLoading(true);
      const [examRes, notificationRes] = await Promise.all([
        api.get("/exams"),
        api.get("/notifications"),
      ]);
      setExams(examRes.data.exams || []);
      setNotifications(notificationRes.data.notifications || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const reset = () => {
    setForm(initialForm);
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.examId || !form.title.trim() || !form.message.trim()) {
      setError("Exam, title and message are required.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...form,
        title: form.title.trim(),
        message: form.message.trim(),
        applicationStart: form.applicationStart || null,
        lastDate: form.lastDate || null,
      };
      if (editing) {
        await api.put(`/notifications/${editing._id}`, payload);
        setSuccess("Notification updated successfully.");
      } else {
        const response = await api.post("/notifications", payload);
        const summary = response.data?.emailSummary;
        setSuccess(
          summary?.attempted
            ? `Notification created. Email sent: ${summary.sent}, failed: ${summary.failed}.`
            : "Notification created successfully."
        );
      }
      reset();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save notification.");
    } finally {
      setSaving(false);
    }
  };

  const editNotification = (item) => {
    setEditing(item);
    setForm({
      examId: item.examId?._id || item.examId || "",
      type: item.type || "APPLICATION_OPEN",
      audience: item.audience || "ALL_STUDENTS",
      title: item.title || "",
      message: item.message || "",
      applicationStart: item.applicationStart ? item.applicationStart.slice(0, 10) : "",
      lastDate: item.lastDate ? item.lastDate.slice(0, 10) : "",
      sendEmail: Boolean(item.sendEmail),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteNotification = async (item) => {
    if (!window.confirm(`Delete notification "${item.title}"?`)) return;
    try {
      setError("");
      await api.delete(`/notifications/${item._id}`);
      setSuccess("Notification deleted successfully.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete notification.");
    }
  };

  return (
    <Box minH="100vh" bg="khaki.50">
      <Box bg="brand.900" color="white" borderBottom="4px solid" borderColor="gold.500">
        <Container maxW="1280px">
          <Flex minH="82px" align="center" justify="space-between" gap={4}>
            <Box>
              <Text fontSize="xs" fontWeight="800" letterSpacing="0.12em" color="gold.300">LAKSHYAPATH ADMIN</Text>
              <Heading fontSize={{ base: "xl", md: "2xl" }}>Notification Management</Heading>
            </Box>
            <Button variant="outline" borderColor="gold.400" color="gold.300" onClick={() => navigate("/admin/dashboard")}>
              <FiArrowLeft /><Text ml={2}>Dashboard</Text>
            </Button>
          </Flex>
        </Container>
      </Box>

      <Container maxW="1280px" py={{ base: 8, md: 12 }}>
        {error && <Box mb={5} p={4} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg"><Text color="red.700" fontSize="sm">{error}</Text></Box>}
        {success && <Box mb={5} p={4} bg="green.50" border="1px solid" borderColor="green.200" borderRadius="lg"><Text color="green.700" fontSize="sm">{success}</Text></Box>}

        <Box bg="white" border="1px solid" borderColor="khaki.200" borderRadius="xl" p={{ base: 5, md: 7 }} mb={8}>
          <Heading fontSize="xl" color="brand.900" mb={2}>{editing ? "Edit Notification" : "Create Notification"}</Heading>
          <Text color="charcoal.500" fontSize="sm" mb={6}>Send exam/application updates to all students or students tracking a specific exam.</Text>
          <form onSubmit={handleSubmit}>
            <VStack align="stretch" gap={5}>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
                <Box><Text mb={2} fontWeight="600">Exam</Text><Box as="select" name="examId" value={form.examId} onChange={handleChange} w="100%" h="40px" px={3} border="1px solid" borderColor="gray.300" borderRadius="6px" bg="white"><option value="">Select Exam</option>{exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}</Box></Box>
                <Box><Text mb={2} fontWeight="600">Notification Type</Text><Box as="select" name="type" value={form.type} onChange={handleChange} w="100%" h="40px" px={3} border="1px solid" borderColor="gray.300" borderRadius="6px" bg="white"><option value="APPLICATION_OPEN">Application Open</option><option value="DEADLINE">Application Deadline</option><option value="ADMIT_CARD">Admit Card</option><option value="EXAM_DATE_UPDATE">Exam Date Update</option><option value="LAKSHYAPATH">LakshyaPath</option></Box></Box>
                <Box><Text mb={2} fontWeight="600">Audience</Text><Box as="select" name="audience" value={form.audience} onChange={handleChange} w="100%" h="40px" px={3} border="1px solid" borderColor="gray.300" borderRadius="6px" bg="white"><option value="ALL_STUDENTS">All Students</option><option value="TRACKING_EXAM">Students Tracking This Exam</option></Box></Box>
                <Box><Text mb={2} fontWeight="600">Title</Text><Input name="title" value={form.title} onChange={handleChange} placeholder="SSC CGL application is now open" /></Box>
              </Grid>
              <Box><Text mb={2} fontWeight="600">Message</Text><Textarea name="message" value={form.message} onChange={handleChange} rows={4} placeholder="Enter the notification message for students." /></Box>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
                <Box><Text mb={2} fontWeight="600">Application Start</Text><Input type="date" name="applicationStart" value={form.applicationStart} onChange={handleChange} /></Box>
                <Box><Text mb={2} fontWeight="600">Last Date</Text><Input type="date" name="lastDate" value={form.lastDate} onChange={handleChange} /></Box>
              </Grid>
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}><input type="checkbox" name="sendEmail" checked={form.sendEmail} onChange={handleChange} /> Send email to the selected audience</label>
              <Flex gap={3} justify="flex-end">
                {editing && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}
                <Button type="submit" bg="brand.700" color="white" loading={saving} loadingText="Saving..." _hover={{ bg: "brand.800" }}><FiPlus /><Text ml={2}>{editing ? "Update Notification" : "Create Notification"}</Text></Button>
              </Flex>
            </VStack>
          </form>
        </Box>

        <Heading fontSize="xl" color="brand.900" mb={5}>Existing Notifications</Heading>
        {loading ? <Flex justify="center" py={12}><Text>Loading notifications...</Text></Flex> : notifications.length === 0 ? <Box bg="white" p={10} textAlign="center" borderRadius="xl"><FiBell size={32} style={{ margin: "0 auto 12px" }} /><Text color="charcoal.500">No notifications created yet.</Text></Box> : (
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
            {notifications.map(item => <Box key={item._id} bg="white" border="1px solid" borderColor="khaki.200" borderRadius="xl" p={6}>
              <Flex justify="space-between" gap={4}><Box><Text fontSize="xs" color="gold.600" fontWeight="800">{item.type}</Text><Heading fontSize="lg" color="brand.900" mt={1}>{item.title}</Heading></Box><Text fontSize="xs" color="charcoal.500">{item.examId?.name}</Text></Flex>
              <Text mt={4} color="charcoal.600" fontSize="sm" lineHeight="1.7">{item.message}</Text>
              <Text mt={3} fontSize="xs" color="charcoal.500">Audience: {item.audience === "ALL_STUDENTS" ? "All Students" : "Tracking Exam"} • Email: {item.sendEmail ? "Yes" : "No"}</Text>
              <Flex mt={5} gap={3}><Button size="sm" variant="outline" onClick={() => editNotification(item)}><FiEdit /><Text ml={2}>Edit</Text></Button><Button size="sm" variant="outline" borderColor="red.400" color="red.600" onClick={() => deleteNotification(item)}><FiTrash2 /><Text ml={2}>Delete</Text></Button></Flex>
            </Box>)}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
export default AdminNotifications;
