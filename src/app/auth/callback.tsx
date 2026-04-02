import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../../services/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1] || '');
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }
      router.replace('/(tabs)');
    };

    handleUrl();
  }, []);

  return null;
}
