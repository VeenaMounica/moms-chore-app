import { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useTasks } from "../context/TaskContext";
import { Task } from "../types/Tasks";
import { homeStyles } from "../styles/common";

// Memoized date calculation functions with caching
const dateCache = new Map<string, Date>();

const getNextDueDate = (task: Task): Date => {
  const cacheKey = `${task.id}-${task.startDate}-${task.frequency}-${task.time}-${task.dayOfWeek}-${task.dayOfMonth}`;
  
  if (dateCache.has(cacheKey)) {
    const cachedDate = dateCache.get(cacheKey)!;
    // Check if cache is still valid (not older than 1 hour)
    const now = new Date();
    const cacheAge = now.getTime() - cachedDate.getTime();
    if (cacheAge < 3600000 && cachedDate > now) {
      return cachedDate;
    }
  }

  const startDate = new Date(task.startDate);
  const now = new Date();
  let nextDue = new Date(startDate);

  // If start date is in future, use that
  if (startDate > now) {
    dateCache.set(cacheKey, new Date(startDate));
    return startDate;
  }

  // Calculate next due date based on frequency
  switch (task.frequency) {
    case "daily":
      // Next due is today or tomorrow
      nextDue = new Date(now);
      nextDue.setHours(parseInt(task.time.split(':')[0]), parseInt(task.time.split(':')[1]), 0, 0);
      if (nextDue <= now) {
        nextDue.setDate(nextDue.getDate() + 1);
      }
      break;

    case "weekly":
      // Next due is specified day of week
      const targetDayOfWeek = task.dayOfWeek || 1; // Monday default
      nextDue = new Date(now);
      nextDue.setHours(parseInt(task.time.split(':')[0]), parseInt(task.time.split(':')[1]), 0, 0);
      
      // Find the next occurrence of the target day
      while (nextDue.getDay() !== targetDayOfWeek) {
        nextDue.setDate(nextDue.getDate() + 1);
      }
      
      // If that time has passed today, go to next week
      if (nextDue <= now) {
        nextDue.setDate(nextDue.getDate() + 7);
      }
      break;

    case "biweekly":
      // Next due is every 14 days from start date (simple version)
      nextDue = new Date(startDate);
      
      // Calculate next due date every 14 days
      while (nextDue <= now) {
        nextDue.setDate(nextDue.getDate() + 14); // Add 14 days
      }
      break;

    case "monthly":
      // Next due is the specified day of month
      const targetDayOfMonth = task.dayOfMonth || 1;
      nextDue = new Date(now.getFullYear(), now.getMonth(), targetDayOfMonth);
      nextDue.setHours(parseInt(task.time.split(':')[0]), parseInt(task.time.split(':')[1]), 0, 0);
      
      // If that date has passed this month, go to next month
      if (nextDue <= now) {
        nextDue.setMonth(nextDue.getMonth() + 1);
      }
      break;

    default:
      nextDue = startDate;
  }

  // Cache the result
  dateCache.set(cacheKey, new Date(nextDue));
  return nextDue;
};

// Memoized date formatting
const formatDateDisplay = useCallback((dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}, []);

// Memoized due date formatting
const formatDueDate = useCallback((task: Task) => {
  const nextDue = getNextDueDate(task);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dueDateOnly = new Date(nextDue.getFullYear(), nextDue.getMonth(), nextDue.getDate());
  
  if (dueDateOnly.getTime() === today.getTime()) {
    return `Today at ${task.time}`;
  } else if (dueDateOnly.getTime() === tomorrow.getTime()) {
    return `Tomorrow at ${task.time}`;
  } else {
    const daysUntil = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7) {
      return `In ${daysUntil} days at ${task.time}`;
    } else if (daysUntil <= 30) {
      return formatDateDisplay(nextDue.toISOString().split('T')[0]) + ` at ${task.time}`;
    } else {
      return formatDateDisplay(nextDue.toISOString().split('T')[0]) + ` at ${task.time}`;
    }
  }
}, [formatDateDisplay]);

export default function HomeScreen({ navigation }: any) {
  const { tasks, toggleTask, deleteTask, completeTask, getLastWeekData, syncFromWeb } = useTasks();
  const lastWeekData = getLastWeekData();

  // Memoized task handlers
  const handleTaskPress = useCallback((taskId: string) => {
    navigation.navigate("EditTask", { taskId });
  }, [navigation]);

  const handleDeleteTask = useCallback((taskId: string) => {
    deleteTask(taskId);
  }, [deleteTask]);

  const handleToggleTask = useCallback((taskId: string) => {
    toggleTask(taskId);
  }, [toggleTask]);

  const handleCompleteTask = useCallback((taskId: string) => {
    completeTask(taskId);
  }, [completeTask]);

  const handleSyncFromWeb = useCallback(() => {
    syncFromWeb();
  }, [syncFromWeb]);

  // Memoized task item component
  const TaskItem = useCallback(({ item }: { item: Task }) => {
    const completionsThisWeek = lastWeekData[item.id] || 0;
    
    return (
      <View style={homeStyles.taskItem}>
        <View style={homeStyles.taskHeader}>
          <TouchableOpacity onPress={() => handleTaskPress(item.id)}>
            <Text style={homeStyles.taskTitle}>{item.title}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={homeStyles.deleteButton}
            onPress={() => handleDeleteTask(item.id)}
          >
            <Text style={homeStyles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        <Text style={homeStyles.taskDetails}>
          {item.frequency} • {formatDueDate(item)} • Started: {formatDateDisplay(item.startDate)}
        </Text>
        <View style={homeStyles.taskActions}>
          <TouchableOpacity 
            style={homeStyles.statusToggle}
            onPress={() => handleToggleTask(item.id)}
          >
            <Text style={homeStyles.taskStatus}>
              {item.isActive ? "✓ Active" : "○ Inactive"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={homeStyles.completeButton}
            onPress={() => handleCompleteTask(item.id)}
          >
            <Text style={homeStyles.completeButtonText}>
              ✓ Complete Today
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={homeStyles.weeklyStats}>
          This week: {completionsThisWeek} completion{completionsThisWeek !== 1 ? 's' : ''}
        </Text>
      </View>
    );
  }, [lastWeekData, handleTaskPress, handleDeleteTask, handleToggleTask, handleCompleteTask, formatDueDate, formatDateDisplay]);

  // Memoized key extractor
  const keyExtractor = useCallback((item: Task) => item.id, []);

  return (
    <View style={homeStyles.container}>
      <View style={homeStyles.header}>
        <Text style={homeStyles.title}>Mom's Chore Reminder</Text>
        <TouchableOpacity 
          style={homeStyles.addButton}
          onPress={() => navigation.navigate("AddTask")}
        >
          <Text style={homeStyles.addButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      </View>

      {/* Sync button for mobile only */}
      {Platform.OS !== 'web' && (
        <TouchableOpacity 
          style={{ 
            backgroundColor: '#007AFF', 
            padding: 10, 
            borderRadius: 8, 
            margin: 10,
            alignItems: 'center'
          }}
          onPress={handleSyncFromWeb}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            🔄 Sync from Web
          </Text>
        </TouchableOpacity>
      )}

      <View style={homeStyles.tasksContainer}>
        <Text style={homeStyles.sectionTitle}>Tasks ({tasks.length})</Text>
        {tasks.length === 0 ? (
          <Text style={homeStyles.emptyText}>No tasks yet. Add your first task!</Text>
        ) : (
          <FlatList
            data={tasks}
            renderItem={TaskItem}
            keyExtractor={keyExtractor}
            style={homeStyles.taskList}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
            getItemLayout={(data, index) => ({
              length: 150, // Approximate height of task item
              offset: 150 * index,
              index,
            })}
          />
        )}
      </View>
    </View>
  );
}
