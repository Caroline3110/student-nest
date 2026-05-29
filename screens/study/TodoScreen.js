import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { db, auth } from '../../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';

export default function TodoScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // all, study, personal
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Study',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
  });

  // Load tasks from Firebase when screen mounts
  useEffect(() => {
    if (!auth.currentUser) {
      console.log('No user logged in');
      return;
    }

    const tasksRef = collection(db, 'users', auth.currentUser.uid, 'tasks');
    const q = query(tasksRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedTasks = [];
      snapshot.forEach((doc) => {
        loadedTasks.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      console.log('Loaded tasks:', loadedTasks.length);
      setTasks(loadedTasks);
    }, (error) => {
      console.error('Error loading tasks:', error);
    });

    return unsubscribe;
  }, []);

  const toggleTaskComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', taskId);
      
      await updateDoc(taskRef, {
        completed: !task.completed,
      });

      console.log('Task updated');
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', taskId);
              await deleteDoc(taskRef);
              console.log('Task deleted');
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Could not delete task');
            }
          }
        }
      ]
    );
  };

  const addTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      const tasksRef = collection(db, 'users', auth.currentUser.uid, 'tasks');
      
      await addDoc(tasksRef, {
        title: newTask.title,
        category: newTask.category,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
      });

      // Reset form
      setModalVisible(false);
      setNewTask({
        title: '',
        category: 'Study',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
      });

      console.log('Task added to Firebase');
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Could not save task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'study') return task.category === 'Study';
    if (filter === 'personal') return task.category === 'Personal';
    return true;
  });

  const activeTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };

  const isOverdue = (dateString) => {
    const taskDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return taskDate < today;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>To-Do</Text>
        <Text style={styles.headerSubtitle}>
          {activeTasks.length} active · {completedTasks.length} completed
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterText,
            filter === 'all' && styles.filterTextActive
          ]}>
            All ({tasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'study' && styles.filterTabActive]}
          onPress={() => setFilter('study')}
        >
          <Text style={[
            styles.filterText,
            filter === 'study' && styles.filterTextActive
          ]}>
            Study ({tasks.filter(t => t.category === 'Study').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'personal' && styles.filterTabActive]}
          onPress={() => setFilter('personal')}
        >
          <Text style={[
            styles.filterText,
            filter === 'personal' && styles.filterTextActive
          ]}>
            Personal ({tasks.filter(t => t.category === 'Personal').length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Tasks</Text>
            {activeTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onLongPress={() => deleteTask(task.id)}
              >
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => toggleTaskComplete(task.id)}
                >
                  <Text style={styles.checkboxIcon}>☐</Text>
                </TouchableOpacity>

                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.taskMeta}>
                    <View style={[
                      styles.categoryBadge,
                      { backgroundColor: task.category === 'Study' ? '#4A90E2' : '#9B59B6' }
                    ]}>
                      <Text style={styles.categoryText}>{task.category}</Text>
                    </View>
                    <Text style={[
                      styles.dueDate,
                      isOverdue(task.dueDate) && styles.overdue
                    ]}>
                      {isOverdue(task.dueDate) ? '⚠️ ' : '📅 '}
                      {formatDate(task.dueDate)}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.priorityIndicator,
                    {
                      backgroundColor:
                        task.priority === 'high'
                          ? '#E74C3C'
                          : task.priority === 'medium'
                          ? '#F39C12'
                          : '#95A5A6',
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed ✓</Text>
            {completedTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskCard, styles.completedCard]}
                onLongPress={() => deleteTask(task.id)}
              >
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => toggleTaskComplete(task.id)}
                >
                  <Text style={styles.checkboxIconChecked}>☑</Text>
                </TouchableOpacity>

                <View style={styles.taskContent}>
                  <Text style={styles.taskTitleCompleted}>{task.title}</Text>
                  <View style={styles.taskMeta}>
                    <View style={[
                      styles.categoryBadge,
                      styles.categoryBadgeCompleted
                    ]}>
                      <Text style={styles.categoryTextCompleted}>{task.category}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filteredTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>No tasks yet!</Text>
            <Text style={styles.emptyText}>Tap the + button to add your first task</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>

            <TextInput
              style={styles.input}
              placeholder="Task title"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
            />

            {/* Category */}
            <Text style={styles.label}>Category</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  newTask.category === 'Study' && styles.optionButtonActive
                ]}
                onPress={() => setNewTask({ ...newTask, category: 'Study' })}
              >
                <Text style={[
                  styles.optionButtonText,
                  newTask.category === 'Study' && styles.optionButtonTextActive
                ]}>
                  Study
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  newTask.category === 'Personal' && styles.optionButtonActive
                ]}
                onPress={() => setNewTask({ ...newTask, category: 'Personal' })}
              >
                <Text style={[
                  styles.optionButtonText,
                  newTask.category === 'Personal' && styles.optionButtonTextActive
                ]}>
                  Personal
                </Text>
              </TouchableOpacity>
            </View>

            {/* Priority */}
            <Text style={styles.label}>Priority</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  newTask.priority === 'high' && styles.optionButtonActive
                ]}
                onPress={() => setNewTask({ ...newTask, priority: 'high' })}
              >
                <Text style={[
                  styles.optionButtonText,
                  newTask.priority === 'high' && styles.optionButtonTextActive
                ]}>
                  High
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  newTask.priority === 'medium' && styles.optionButtonActive
                ]}
                onPress={() => setNewTask({ ...newTask, priority: 'medium' })}
              >
                <Text style={[
                  styles.optionButtonText,
                  newTask.priority === 'medium' && styles.optionButtonTextActive
                ]}>
                  Medium
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  newTask.priority === 'low' && styles.optionButtonActive
                ]}
                onPress={() => setNewTask({ ...newTask, priority: 'low' })}
              >
                <Text style={[
                  styles.optionButtonText,
                  newTask.priority === 'low' && styles.optionButtonTextActive
                ]}>
                  Low
                </Text>
              </TouchableOpacity>
            </View>

            {/* Due Date */}
            <Text style={styles.label}>Due Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={newTask.dueDate}
              onChangeText={(text) => setNewTask({ ...newTask, dueDate: text })}
            />

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.addTaskButton]}
                onPress={addTask}
              >
                <Text style={styles.addTaskButtonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingTop: 12,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundDark,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  completedCard: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxIcon: {
    fontSize: 28,
    color: Colors.textLight,
  },
  checkboxIconChecked: {
    fontSize: 28,
    color: Colors.success,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  taskTitleCompleted: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeCompleted: {
    backgroundColor: Colors.backgroundDark,
  },
  categoryText: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: '600',
  },
  categoryTextCompleted: {
    color: Colors.textLight,
  },
  dueDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  overdue: {
    color: '#E74C3C',
    fontWeight: '600',
  },
  priorityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginLeft: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  addButtonText: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.backgroundDark,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.backgroundDark,
  },
  optionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  optionButtonTextActive: {
    color: Colors.white,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background,
  },
  addTaskButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  addTaskButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});