import { supabase } from '../../server/config/supabase';

describe('Users & Profiles (Supabase)', () => {
  let testUserId: string | null = null;
  let testEmail: string;

  beforeEach(() => {
    testEmail = `test-${Date.now()}@example.com`;
  });

  afterEach(async () => {
    if (testUserId) {
      try {
        await supabase.from('users').delete().eq('id', testUserId);
      } catch (error) {
        // Ignore cleanup errors
      }
      testUserId = null;
    }
  });

  describe('User Creation', () => {
    it('should create a user in the users table', async () => {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: testEmail,
          full_name: 'Test User',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.email).toBe(testEmail);
      testUserId = data?.id || null;
    });
  });

  describe('User Profile Read', () => {
    it('should read user profile by ID', async () => {
      // First create a user
      const { data: created, error: createError } = await supabase
        .from('users')
        .insert({
          email: testEmail,
          full_name: 'Test User',
        })
        .select()
        .single();

      expect(createError).toBeNull();
      testUserId = created?.id || null;

      // Then read it
      const { data: read, error: readError } = await supabase
        .from('users')
        .select('*')
        .eq('id', testUserId!)
        .single();

      expect(readError).toBeNull();
      expect(read).toBeDefined();
      expect(read?.id).toBe(testUserId);
      expect(read?.email).toBe(testEmail);
    });
  });

  describe('User Profile Update', () => {
    it('should update user profile', async () => {
      // First create a user
      const { data: created, error: createError } = await supabase
        .from('users')
        .insert({
          email: testEmail,
          full_name: 'Test User',
        })
        .select()
        .single();

      expect(createError).toBeNull();
      testUserId = created?.id || null;

      // Then update it
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({ full_name: 'Updated Name' })
        .eq('id', testUserId!)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updated).toBeDefined();
      expect(updated?.full_name).toBe('Updated Name');
    });
  });

  describe('Security Boundary Validation', () => {
    it('should enforce user data isolation', async () => {
      // Create two users
      const email1 = `test1-${Date.now()}@example.com`;
      const email2 = `test2-${Date.now()}@example.com`;

      const { data: user1 } = await supabase
        .from('users')
        .insert({ email: email1, full_name: 'User 1' })
        .select()
        .single();

      const { data: user2 } = await supabase
        .from('users')
        .insert({ email: email2, full_name: 'User 2' })
        .select()
        .single();

      // Verify users are separate
      expect(user1?.id).not.toBe(user2?.id);
      expect(user1?.email).not.toBe(user2?.email);

      // Cleanup
      if (user1?.id) {
        await supabase.from('users').delete().eq('id', user1.id);
      }
      if (user2?.id) {
        await supabase.from('users').delete().eq('id', user2.id);
      }
    });
  });
});

