
import ProfileInformationCard from "@/components/settings/ProfileInformationCard";
import NotificationPreferencesCard from "@/components/settings/NotificationPreferencesCard";
import SecuritySettingsCard from "@/components/settings/SecuritySettingsCard";

const AccountSettings = () => {
  return (
    <div className="space-y-6">
      <ProfileInformationCard />
      <NotificationPreferencesCard />
      <SecuritySettingsCard />
    </div>
  );
};

export default AccountSettings;
