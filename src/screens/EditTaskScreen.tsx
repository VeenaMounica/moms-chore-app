import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTasks } from "../context/TaskContext";
import { Frequency, Task } from "../types/Tasks";
import { addTaskStyles } from "../styles/common";

type Props = NativeStackScreenProps<RootStackParamList, "EditTask">;

export default function EditTaskScreen({ navigation, route }: Props) {
  const { taskId } = route.params;
  const { tasks, updateTask } = useTasks();
  
  console.log('EditTaskScreen - taskId:', taskId);
  console.log('EditTaskScreen - available tasks:', tasks);
  
  const existingTask = tasks.find(task => task.id === taskId);
  
  console.log('EditTaskScreen - found task:', existingTask);
  
  const [title, setTitle] = useState(existingTask?.title || "");
  const [frequency, setFrequency] = useState<Frequency>(existingTask?.frequency || "daily");
  const [time, setTime] = useState(existingTask?.time || "09:00");
  const [startDate, setStartDate] = useState(existingTask ? 
    (existingTask.startDate ? new Date(existingTask.startDate) : new Date()) : 
    new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState<number>(existingTask?.dayOfWeek || 1);
  const [dayOfMonth, setDayOfMonth] = useState<number>(existingTask?.dayOfMonth || 1);

  // Calculate date ranges (no minimum date, max 1 year ahead)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setFrequency(existingTask.frequency);
      setTime(existingTask.time);
      const taskDate = existingTask.startDate ? new Date(existingTask.startDate) : new Date();
      setStartDate(taskDate);
      // Initialize manual date with a simple format that's easy to edit
      setManualDate(taskDate.toISOString().split('T')[0]); // YYYY-MM-DD format
      setDayOfWeek(existingTask.dayOfWeek || 1);
      setDayOfMonth(existingTask.dayOfMonth || 1);
    }
  }, [existingTask]);

  const handleSave = () => {
    if (!existingTask) return;

    // Create a proper date object at noon to avoid timezone issues
    const saveDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      12, 0, 0 // Set to noon to avoid timezone offset issues
    );

    const dateString = saveDate.toISOString().split('T')[0];
    console.log('Saving date details:', {
      originalDate: startDate,
      saveDate: saveDate,
      dateString: dateString,
      year: saveDate.getFullYear(),
      month: saveDate.getMonth() + 1,
      day: saveDate.getDate()
    });

    console.log('Saving task with data:', {
      title,
      frequency,
      time,
      startDate: dateString,
      dayOfWeek,
      dayOfMonth
    });

    const updatedTask: Task = {
      ...existingTask,
      title,
      frequency,
      time,
      startDate: dateString,
      ...(frequency === "weekly" && { dayOfWeek }),
      ...(frequency === "monthly" && { dayOfMonth }),
    };

    console.log('Updated task object:', updatedTask);
    updateTask(updatedTask);
    navigation.goBack();
  };

  const [manualDate, setManualDate] = useState("");

  const formatDateForDisplay = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const parseDateInput = (text: string): Date | null => {
    // Remove any extra whitespace
    const cleanText = text.trim();
    
    // Try different date parsing strategies
    const strategies = [
      // ISO format: YYYY-MM-DD
      () => {
        const match = cleanText.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (match) {
          const [, year, month, day] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        return null;
      },
      // European format with dots: DD.MM.YYYY
      () => {
        const match = cleanText.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (match) {
          const [, day, month, year] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        return null;
      },
      // European format with dashes: DD-MM-YYYY
      () => {
        const match = cleanText.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
        if (match) {
          const [, day, month, year] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        return null;
      },
      // Smart slash format detection
      () => {
        const match = cleanText.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match) {
          const [, first, second, year] = match;
          // If first number > 12, it must be day (European format)
          // If second number > 12, it must be day (European format)
          // Otherwise, assume European format for consistency
          const firstNum = parseInt(first);
          const secondNum = parseInt(second);
          
          if (firstNum > 12 || secondNum > 12 || (firstNum <= 12 && secondNum <= 12)) {
            // European: DD/MM/YYYY
            return new Date(parseInt(year), firstNum - 1, secondNum);
          } else {
            // US: MM/DD/YYYY
            return new Date(parseInt(year), secondNum - 1, firstNum);
          }
        }
        return null;
      },
      // Natural language fallback
      () => new Date(cleanText)
    ];

    for (const strategy of strategies) {
      try {
        const date = strategy();
        if (date && !isNaN(date.getTime())) {
          return date;
        }
      } catch (e) {
        // Continue to next strategy
      }
    }
    
    return null;
  };

  const handleManualDateChange = (text: string) => {
    console.log('Manual date input:', text);
    setManualDate(text); // Update the input field immediately
    
    // Try to parse the date as user types
    const parsedDate = parseDateInput(text);
    if (parsedDate) {
      console.log('Successfully parsed date:', parsedDate);
      console.log('Parsed date details:', {
        year: parsedDate.getFullYear(),
        month: parsedDate.getMonth() + 1,
        day: parsedDate.getDate(),
        isoString: parsedDate.toISOString(),
        localDateString: parsedDate.toLocaleDateString()
      });
      setStartDate(parsedDate);
    } else {
      console.log('Not yet a valid date, waiting for more input');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    console.log('Date picker changed:', event, selectedDate);
    setShowDatePicker(false);
    if (selectedDate) {
      console.log('Setting new date:', selectedDate);
      setStartDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    console.log('Time picker changed:', event, selectedTime);
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const newTime = `${hours}:${minutes}`;
      console.log('Setting new time:', newTime);
      setTime(newTime);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (!existingTask) {
    console.log('Task not found for ID:', taskId);
    return (
      <View style={addTaskStyles.container}>
        <Text style={addTaskStyles.label}>Task not found</Text>
        <Text>Task ID: {taskId}</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={addTaskStyles.container}>
      <Text style={addTaskStyles.label}>Task Title</Text>
      <TextInput
        style={addTaskStyles.input}
        placeholder="e.g. Change bedsheets"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={addTaskStyles.label}>Start Date</Text>
      {Platform.OS === 'web' ? (
        <TextInput
          style={addTaskStyles.input}
          placeholder="YYYY-MM-DD (e.g., 2026-02-25)"
          value={startDate.toISOString().split('T')[0]}
          onChangeText={(text) => {
            const date = new Date(text);
            if (!isNaN(date.getTime())) {
              setStartDate(date);
            }
          }}
        />
      ) : (
        <TouchableOpacity 
          style={addTaskStyles.dateButton}
          onPress={() => {
            alert('Date picker pressed!');
            console.log('Date picker button pressed');
            setShowDatePicker(true);
          }}
        >
          <Text style={addTaskStyles.dateButtonText}>{startDate.toISOString().split('T')[0]}</Text>
        </TouchableOpacity>
      )}

      {Platform.OS !== 'web' && showDatePicker && (
        <>
          {console.log('Rendering date picker')}
          <DateTimePicker
            value={startDate}
            mode="date"
            display="calendar"
            maximumDate={maxDate}
            onChange={onDateChange}
            style={{ height: 200, marginTop: 20 }}
          />
          <View style={{ marginTop: 10 }}>
            <Text style={addTaskStyles.label}>Or enter date manually:</Text>
            <TextInput
              style={addTaskStyles.input}
              placeholder="Try: 2026-02-25, 20-02-2026, 20.02.2026, 20/02/2026, Feb 25, 2026"
              value={manualDate}
              onChangeText={handleManualDateChange}
            />
          </View>
        </>
      )}

      <Text style={addTaskStyles.label}>Time</Text>
      {Platform.OS === 'web' ? (
        <TextInput
          style={addTaskStyles.input}
          placeholder="HH:MM (e.g., 09:00)"
          value={time}
          onChangeText={(text) => {
            // Validate time format HH:MM
            const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
            if (timeRegex.test(text)) {
              setTime(text);
            }
          }}
        />
      ) : (
        <TouchableOpacity 
          style={addTaskStyles.dateButton}
          onPress={() => {
            console.log('Time picker button pressed');
            setShowTimePicker(true);
          }}
        >
          <Text style={addTaskStyles.dateButtonText}>{time}</Text>
        </TouchableOpacity>
      )}

      {Platform.OS !== 'web' && showTimePicker && (
        <DateTimePicker
          value={new Date(`2000-01-01T${time}`)}
          mode="time"
          display="spinner"
          onChange={onTimeChange}
          style={{ height: 200, marginTop: 20 }}
        />
      )}

      <Text style={addTaskStyles.label}>Frequency</Text>
      <View style={addTaskStyles.buttonRow}>
        <TouchableOpacity 
          style={[
            addTaskStyles.frequencyButton,
            frequency === "daily" && addTaskStyles.frequencyButtonSelected
          ]}
          onPress={() => setFrequency("daily")}
        >
          <Text style={[
            addTaskStyles.frequencyButtonText,
            frequency === "daily" && addTaskStyles.frequencyButtonTextSelected
          ]}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            addTaskStyles.frequencyButton,
            frequency === "weekly" && addTaskStyles.frequencyButtonSelected
          ]}
          onPress={() => setFrequency("weekly")}
        >
          <Text style={[
            addTaskStyles.frequencyButtonText,
            frequency === "weekly" && addTaskStyles.frequencyButtonTextSelected
          ]}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            addTaskStyles.frequencyButton,
            frequency === "biweekly" && addTaskStyles.frequencyButtonSelected
          ]}
          onPress={() => setFrequency("biweekly")}
        >
          <Text style={[
            addTaskStyles.frequencyButtonText,
            frequency === "biweekly" && addTaskStyles.frequencyButtonTextSelected
          ]}>Biweekly</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            addTaskStyles.frequencyButton,
            frequency === "monthly" && addTaskStyles.frequencyButtonSelected
          ]}
          onPress={() => setFrequency("monthly")}
        >
          <Text style={[
            addTaskStyles.frequencyButtonText,
            frequency === "monthly" && addTaskStyles.frequencyButtonTextSelected
          ]}>Monthly</Text>
        </TouchableOpacity>
      </View>

      {frequency === "weekly" && (
        <>
          <Text style={addTaskStyles.label}>Day of Week</Text>
          <View style={addTaskStyles.buttonRow}>
            {daysOfWeek.map((day, index) => (
              <Button
                key={day}
                title={day}
                onPress={() => setDayOfWeek(index)}
                color={dayOfWeek === index ? "#007AFF" : "#007AFF"}
              />
            ))}
          </View>
        </>
      )}

      {frequency === "monthly" && (
        <>
          <Text style={addTaskStyles.label}>Day of Month (1-31)</Text>
          <TextInput
            style={addTaskStyles.input}
            placeholder="1"
            value={dayOfMonth.toString()}
            onChangeText={(text) => setDayOfMonth(parseInt(text) || 1)}
            keyboardType="numeric"
          />
        </>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Update Task" onPress={handleSave} />
      </View>
    </View>
  );
}
