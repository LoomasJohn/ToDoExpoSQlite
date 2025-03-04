import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { List, Switch, Text, Avatar, useTheme } from "react-native-paper";

export default function TabSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const { colors } = useTheme();

  const SectionHeader = ({ title }) => (
    <List.Subheader style={[styles.sectionHeader, { color: colors.primary }]}>
      {title}
    </List.Subheader>
  );

  const SettingItem = ({ icon, title, subtitle, right, onPress }) => (
    <List.Item
      title={title}
      description={subtitle}
      left={props => <List.Icon {...props} icon={icon} />}
      right={right}
      onPress={onPress}
      style={styles.listItem}
    />
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Avatar.Text size={72} label="TA" />
        <Text style={[styles.profileName, { color: colors.text }]}>Tamirat Abegaz</Text>
        <Text style={{ color: colors.text }}>tamirat.abegaz@ung.edu</Text>
      </View>

      {/* Preferences */}
      <SectionHeader title="Preferences" />
      <SettingItem
        icon="translate"
        title="Language"
        subtitle="English (United States)"
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => alert('Navigate to language settings')}
      />
      <SettingItem
        icon="wifi"
        title="Wi-Fi Only"
        subtitle="Download content only via Wi-Fi"
        right={() => (
          <Switch
            value={true}
            onValueChange={() => {}}
          />
        )}
      />

      {/* Notifications */}
      <SectionHeader title="Notifications" />
      <SettingItem
        icon="bell"
        title="Enable Notifications"
        right={() => (
          <Switch
            value={notificationsEnabled}
            onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
          />
        )}
      />

      {/* Support */}
      <SectionHeader title="Support" />
      <SettingItem
        icon="help-circle"
        title="Help & Support"
        onPress={() => alert('Navigate to help')}
      />
      <SettingItem
        icon="file-document"
        title="Terms of Service"
        onPress={() => alert('Navigate to terms')}
      />
      <SettingItem
        icon="shield-lock"
        title="Privacy Policy"
        onPress={() => alert('Navigate to privacy policy')}
      />

      {/* Account */}
      <SectionHeader title="Account" />
      <SettingItem
        icon="logout"
        title="Log Out"
        onPress={() => alert('Confirm logout')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    marginVertical: 16,
  },
  profileName: {
    fontSize: 20,
    marginTop: 12,
    marginBottom: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  listItem: {
    paddingHorizontal: 16,
  },
});


