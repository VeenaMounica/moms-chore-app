import AppNavigator from "./src/navigation/AppNavigator";
import { TaskProvider } from "./src/context/TaskContext";

export default function App() {
  return (
    <TaskProvider>
      <AppNavigator />
    </TaskProvider>
  );
}