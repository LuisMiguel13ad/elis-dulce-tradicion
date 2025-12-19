/**
 * React hooks for CMS data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBusinessSettings,
  getBusinessHours,
  getHolidayClosures,
  getActiveAnnouncements,
  getFAQs,
  getContentPage,
  getHomepageContent,
  getGalleryItems,
  getSEOConfig,
  getFooterConfig,
  getSocialMediaLinks,
  updateBusinessSettings,
  updateBusinessHours,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  type BusinessSettings,
  type BusinessHours,
  type FAQ,
  type GalleryItem,
  type Announcement,
} from '@/lib/cms';

// Query keys
export const cmsKeys = {
  all: ['cms'] as const,
  businessSettings: () => [...cmsKeys.all, 'business-settings'] as const,
  businessHours: () => [...cmsKeys.all, 'business-hours'] as const,
  holidayClosures: () => [...cmsKeys.all, 'holiday-closures'] as const,
  announcements: () => [...cmsKeys.all, 'announcements'] as const,
  faqs: () => [...cmsKeys.all, 'faqs'] as const,
  contentPage: (slug: string) => [...cmsKeys.all, 'content-page', slug] as const,
  homepageContent: () => [...cmsKeys.all, 'homepage-content'] as const,
  galleryItems: (category?: string) => [...cmsKeys.all, 'gallery-items', category || 'all'] as const,
  seoConfig: (path: string) => [...cmsKeys.all, 'seo-config', path] as const,
  footerConfig: () => [...cmsKeys.all, 'footer-config'] as const,
  socialMediaLinks: () => [...cmsKeys.all, 'social-media-links'] as const,
};

/**
 * Hook to fetch business settings
 */
export function useBusinessSettings() {
  return useQuery({
    queryKey: cmsKeys.businessSettings(),
    queryFn: getBusinessSettings,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch business hours
 */
export function useBusinessHours() {
  return useQuery({
    queryKey: cmsKeys.businessHours(),
    queryFn: getBusinessHours,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch active announcements
 */
export function useAnnouncements() {
  return useQuery({
    queryKey: cmsKeys.announcements(),
    queryFn: getActiveAnnouncements,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch FAQs
 */
export function useFAQs() {
  return useQuery({
    queryKey: cmsKeys.faqs(),
    queryFn: getFAQs,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch content page
 */
export function useContentPage(slug: string) {
  return useQuery({
    queryKey: cmsKeys.contentPage(slug),
    queryFn: () => getContentPage(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch homepage content
 */
export function useHomepageContent() {
  return useQuery({
    queryKey: cmsKeys.homepageContent(),
    queryFn: getHomepageContent,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch gallery items
 */
export function useGalleryItems(category?: string) {
  return useQuery({
    queryKey: cmsKeys.galleryItems(category),
    queryFn: () => getGalleryItems(category),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch SEO config
 */
export function useSEOConfig(pagePath: string) {
  return useQuery({
    queryKey: cmsKeys.seoConfig(pagePath),
    queryFn: () => getSEOConfig(pagePath),
    enabled: !!pagePath,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch footer config
 */
export function useFooterConfig() {
  return useQuery({
    queryKey: cmsKeys.footerConfig(),
    queryFn: getFooterConfig,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch social media links
 */
export function useSocialMediaLinks() {
  return useQuery({
    queryKey: cmsKeys.socialMediaLinks(),
    queryFn: getSocialMediaLinks,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Admin mutations
export function useUpdateBusinessSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<BusinessSettings>) => updateBusinessSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.businessSettings() });
    },
  });
}

export function useUpdateBusinessHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (hours: BusinessHours[]) => updateBusinessHours(hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.businessHours() });
    },
  });
}

export function useCreateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (faq: Omit<FAQ, 'id'>) => createFAQ(faq),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.faqs() });
    },
  });
}

export function useUpdateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<FAQ> }) =>
      updateFAQ(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.faqs() });
    },
  });
}

export function useDeleteFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteFAQ(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.faqs() });
    },
  });
}

export function useCreateGalleryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: Omit<GalleryItem, 'id'>) => createGalleryItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.galleryItems() });
    },
  });
}

export function useUpdateGalleryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<GalleryItem> }) =>
      updateGalleryItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.galleryItems() });
    },
  });
}

export function useDeleteGalleryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteGalleryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.galleryItems() });
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (announcement: Omit<Announcement, 'id'>) => createAnnouncement(announcement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.announcements() });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Announcement> }) =>
      updateAnnouncement(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.announcements() });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.announcements() });
    },
  });
}
