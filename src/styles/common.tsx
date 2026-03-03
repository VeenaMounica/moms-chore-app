import { StyleSheet } from "react-native";

// Common button styles
const buttonStyles = {
  primary: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  danger: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  success: {
    backgroundColor: "#28a745",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  secondary: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
};

// Common text styles
const textStyles = {
  button: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  buttonTextSmall: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  buttonTextTiny: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500" as const,
  },
};

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: buttonStyles.primary,
  addButtonText: textStyles.button,
  tasksContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  taskList: {
    flex: 1,
  },
  taskItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#007AFF",
    padding: 5,
    textDecorationLine: "underline",
  },
  deleteButton: {
    ...buttonStyles.danger,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  completeButton: buttonStyles.success,
  completeButtonText: textStyles.buttonTextSmall,
  taskDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  taskActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusToggle: buttonStyles.secondary,
  taskStatus: textStyles.buttonTextTiny,
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 50,
  },
  weeklyStats: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
  },
  weeklyStatsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  weeklyStatsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});

export const addTaskStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 2,
    flexWrap: "wrap",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  frequencyButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  frequencyButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  frequencyButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  frequencyButtonTextSelected: {
    color: "#fff",
  },
});
