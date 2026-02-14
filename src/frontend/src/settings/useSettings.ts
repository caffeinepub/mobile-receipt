import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSettings, saveSettings } from '@/storage/repositories';
import { defaultSettings, type Settings } from '@/models/settings';

export function useSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const settings = await getSettings();
      return settings || defaultSettings;
    },
  });

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const current = settingsQuery.data || defaultSettings;
    const updated = { ...current, ...newSettings };
    await saveSettings(updated);
    queryClient.invalidateQueries({ queryKey: ['settings'] });
  };

  return {
    settings: settingsQuery.data || defaultSettings,
    updateSettings,
    isLoading: settingsQuery.isLoading,
  };
}
