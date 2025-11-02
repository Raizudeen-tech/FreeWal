import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  useColorScheme,
} from 'react-native';
import { useCategoryStore } from '../stores/categoryStore';
import { useSettingsStore } from '../stores/settingsStore';
import { getTheme } from '../constants/theme';
import { CATEGORY_ICONS } from '../constants/data';
import { ThemedDialog } from '../components/ThemedDialog';

export const CategoriesScreen: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, getCategoryExpenseCount } = useCategoryStore();
  const { theme: themeMode, useMaterial3 } = useSettingsStore();
  const colorScheme = useColorScheme();
  const resolvedTheme = themeMode === 'system' ? colorScheme : themeMode;
  const theme = getTheme(resolvedTheme === 'dark' ? 'dark' : 'light', useMaterial3);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(theme.colors.categoryColors[0]);
  const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICONS[0]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [deleteMessage, setDeleteMessage] = useState('');

  const handleAdd = () => {
    setEditingCategory(null);
    setName('');
    setSelectedColor(theme.colors.categoryColors[0]);
    setSelectedIcon(CATEGORY_ICONS[0]);
    setModalVisible(true);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setName(category.name);
    setSelectedColor(category.color);
    setSelectedIcon(category.icon);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          name,
          color: selectedColor,
          icon: selectedIcon,
        });
        Alert.alert('Success', 'Category updated successfully');
      } else {
        await addCategory({
          name,
          color: selectedColor,
          icon: selectedIcon,
        });
        Alert.alert('Success', 'Category added successfully');
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save category');
    }
  };

  const handleDelete = async (category: any) => {
    const count = await getCategoryExpenseCount(category.id);
    setCategoryToDelete(category);
    setDeleteMessage(
      count > 0
        ? `Are you sure you want to delete "${category.name}"?\n\nThis will also delete ${count} expense(s).`
        : `Are you sure you want to delete "${category.name}"?`
    );
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      await deleteCategory(categoryToDelete.id);
      setDeleteDialogVisible(false);
      setCategoryToDelete(null);
      Alert.alert('Success', 'Category deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete category');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Categories
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }, theme.shadows.md]}
          onPress={handleAdd}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {categories.map((category) => (
          <View
            key={category.id}
            style={[styles.categoryCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}
          >
            <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
              <Text style={styles.categoryIconText}>{category.name.charAt(0)}</Text>
            </View>
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                {category.name}
              </Text>
              <Text style={[styles.categoryMeta, { color: theme.colors.textSecondary }]}>
                {category.icon}
              </Text>
            </View>
            <View style={styles.categoryActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }, theme.shadows.sm]}
                onPress={() => handleEdit(category)}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.error }, theme.shadows.sm]}
                onPress={() => handleDelete(category)}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.dialog?.overlay || 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.dialog?.background || theme.colors.surfaceElevated }, theme.shadows.lg]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder="Category name"
              placeholderTextColor={theme.colors.textSecondary}
            />

            <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
              Select Color
            </Text>
            <View style={styles.colorGrid}>
              {theme.colors.categoryColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && [styles.selectedColor, { borderColor: theme.colors.primary }],
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }, theme.shadows.sm]}
                onPress={handleSave}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ThemedDialog
        visible={deleteDialogVisible}
        title="Delete Category"
        message={deleteMessage}
        theme={theme}
        onDismiss={() => {
          setDeleteDialogVisible(false);
          setCategoryToDelete(null);
        }}
        buttons={[
          {
            text: 'Cancel',
            onPress: () => {
              setDeleteDialogVisible(false);
              setCategoryToDelete(null);
            },
            style: 'default',
          },
          {
            text: 'Delete',
            onPress: confirmDelete,
            style: 'destructive',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryMeta: {
    fontSize: 14,
    marginTop: 2,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  selectedColor: {
    borderWidth: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
