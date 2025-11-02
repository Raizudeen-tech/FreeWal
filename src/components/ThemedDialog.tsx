import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Theme } from '../constants/theme';

interface ThemedDialogButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'primary' | 'destructive';
}

interface ThemedDialogProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: ThemedDialogButton[];
  theme: Theme;
  onDismiss?: () => void;
}

export const ThemedDialog: React.FC<ThemedDialogProps> = ({
  visible,
  title,
  message,
  buttons,
  theme,
  onDismiss,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onDismiss}
        >
          <View
            style={[
              styles.dialog,
              {
                backgroundColor: theme.colors.dialog?.background || theme.colors.surfaceElevated,
              },
              theme.shadows.lg,
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
              {message}
            </Text>
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => {
                let buttonStyle = {};
                let textStyle = {};

                if (button.style === 'primary') {
                  buttonStyle = { backgroundColor: theme.colors.primary };
                  textStyle = { color: theme.colors.onPrimary || '#FFFFFF' };
                } else if (button.style === 'destructive') {
                  buttonStyle = { backgroundColor: theme.colors.error };
                  textStyle = { color: theme.colors.onError || '#FFFFFF' };
                } else {
                  buttonStyle = { backgroundColor: 'transparent' };
                  textStyle = { color: theme.colors.primary };
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.button, buttonStyle]}
                    onPress={button.onPress}
                  >
                    <Text style={[styles.buttonText, textStyle]}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
