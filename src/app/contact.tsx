import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabase';
import { useThemeColors } from '../hooks/useColorScheme';

type Inquiry = {
  id: string;
  user_id: string;
  user_email: string | null;
  title: string;
  content: string;
  status: 'pending' | 'answered';
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
};

export default function ContactScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();

  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');

  const fetchUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user ?? null);
  }, []);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setInquiries(data as Inquiry[]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchInquiries();
  }, [fetchUser, fetchInquiries]);

  const handleSubmit = async () => {
    if (!titleInput.trim() || !contentInput.trim()) {
      Alert.alert(t('contact'), t('contact_title_placeholder'));
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('inquiries').insert({
        user_id: user.id,
        user_email: user.email,
        title: titleInput.trim(),
        content: contentInput.trim(),
      });
      if (error) throw error;
      Alert.alert(t('contact'), t('contact_submit_success'));
      setTitleInput('');
      setContentInput('');
      setMode('list');
      fetchInquiries();
    } catch {
      Alert.alert(t('contact'), t('contact_submit_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  // Not logged in
  if (!loading && !user) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 16,
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              width: 36, height: 36, borderRadius: 12,
              backgroundColor: colors.surfaceSecondary,
              alignItems: 'center', justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{t('contact')}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <View style={{
            width: 72, height: 72, borderRadius: 22,
            backgroundColor: colors.surfaceSecondary,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 18,
          }}>
            <Ionicons name="lock-closed-outline" size={32} color={colors.textSecondary} />
          </View>
          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' }}>
            {t('login_required')}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>
            {t('login_prompt')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
      }}>
        <TouchableOpacity
          onPress={() => {
            if (mode === 'form') {
              setMode('list');
            } else {
              router.back();
            }
          }}
          activeOpacity={0.7}
          style={{
            width: 36, height: 36, borderRadius: 12,
            backgroundColor: colors.surfaceSecondary,
            alignItems: 'center', justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: '800', color: colors.text }}>{t('contact')}</Text>
        {mode === 'list' && (
          <TouchableOpacity
            onPress={() => setMode('form')}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 7,
              backgroundColor: colors.brand,
              borderRadius: 12,
            }}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>{t('contact_new')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List mode */}
      {mode === 'list' && (
        loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color={colors.brand} />
          </View>
        ) : inquiries.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 22,
              backgroundColor: colors.surfaceSecondary,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 18,
            }}>
              <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.textSecondary} />
            </View>
            <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' }}>
              {t('contact_empty')}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>
              {t('contact_empty_desc')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={inquiries}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => {
              const isExpanded = expandedId === item.id;
              const isAnswered = item.status === 'answered';
              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setExpandedId(isExpanded ? null : item.id)}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: colors.border,
                    overflow: 'hidden',
                  }}
                >
                  {/* Item header row */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 18,
                    paddingVertical: 16,
                  }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text
                        style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 }}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '500' }}>
                        {formatDate(item.created_at)}
                      </Text>
                    </View>
                    <View style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      backgroundColor: isAnswered ? colors.brand + '18' : colors.surfaceSecondary,
                      borderRadius: 8,
                      marginRight: 8,
                    }}>
                      <Text style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: isAnswered ? colors.brand : colors.textSecondary,
                      }}>
                        {isAnswered ? t('contact_status_answered') : t('contact_status_pending')}
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color={colors.textSecondary}
                    />
                  </View>

                  {/* Expanded content */}
                  {isExpanded && (
                    <>
                      <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 18 }} />
                      <View style={{ paddingHorizontal: 18, paddingVertical: 14 }}>
                        <Text style={{ fontSize: 14, color: colors.text, lineHeight: 22, fontWeight: '500' }}>
                          {item.content}
                        </Text>
                      </View>
                      {isAnswered && item.admin_reply && (
                        <>
                          <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 18 }} />
                          <View style={{
                            paddingHorizontal: 18,
                            paddingVertical: 14,
                            backgroundColor: colors.brand + '08',
                          }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                              <Ionicons name="checkmark-circle" size={14} color={colors.brand} style={{ marginRight: 6 }} />
                              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.brand }}>
                                {t('contact_admin_reply')}
                              </Text>
                            </View>
                            <Text style={{ fontSize: 14, color: colors.text, lineHeight: 22, fontWeight: '500' }}>
                              {item.admin_reply}
                            </Text>
                          </View>
                        </>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )
      )}

      {/* Form mode */}
      {mode === 'form' && (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title input */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
              marginBottom: 12,
            }}>
              <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.3 }}>
                  {t('contact_title')}
                </Text>
              </View>
              <TextInput
                value={titleInput}
                onChangeText={setTitleInput}
                placeholder={t('contact_title_placeholder')}
                placeholderTextColor={colors.textSecondary}
                style={{
                  paddingHorizontal: 18,
                  paddingBottom: 14,
                  paddingTop: 6,
                  fontSize: 15,
                  fontWeight: '500',
                  color: colors.text,
                }}
                returnKeyType="next"
                maxLength={100}
              />
            </View>

            {/* Content input */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
              marginBottom: 20,
            }}>
              <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.3 }}>
                  {t('contact_content')}
                </Text>
              </View>
              <TextInput
                value={contentInput}
                onChangeText={setContentInput}
                placeholder={t('contact_content_placeholder')}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={6}
                style={{
                  paddingHorizontal: 18,
                  paddingBottom: 14,
                  paddingTop: 6,
                  fontSize: 15,
                  fontWeight: '500',
                  color: colors.text,
                  minHeight: 140,
                  textAlignVertical: 'top',
                }}
                maxLength={1000}
              />
            </View>

            {/* Submit button */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={submitting}
              style={{
                backgroundColor: colors.brand,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF' }}>
                  {t('contact_submit')}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
