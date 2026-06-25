import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user:        null,
  profile:     null,
  supplier:    null,
  loading:     true,
  initialized: false,

  setUser:     (user)     => set({ user }),
  setProfile:  (profile)  => set({ profile }),
  setSupplier: (supplier) => set({ supplier }),

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await get().fetchProfile(session.user)
      }
      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await get().fetchProfile(session.user)
        } else {
          set({ user: null, profile: null, supplier: null })
        }
      })
    } catch (err) {
      console.error('Auth init error:', err)
    } finally {
      set({ loading: false, initialized: true })
    }
  },

  fetchProfile: async (user) => {
    if (!user) return
    set({ user })

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    set({ profile })

    if (profile?.role === 'supplier') {
      const { data: supplier } = await supabase
        .from('suppliers')
        .select('*, supplier_categories(category_id, categories(name,slug,icon)), supplier_locations(*)')
        .eq('profile_id', user.id)
        .single()
      set({ supplier })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, supplier: null })
  },

  isAdmin:    () => get().profile?.role === 'admin',
  isSupplier: () => get().profile?.role === 'supplier',
  isCustomer: () => get().profile?.role === 'customer',
  isActive:   () => get().supplier?.status === 'active',
}))
