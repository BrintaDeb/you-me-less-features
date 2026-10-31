import React, { useState, useMemo, useEffect, useRef, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  Heart,
  BookOpen,
  Send,
  Download,
  Filter,
  LogOut,
  ChevronRight,
  ShieldCheck,
  ZoomIn,
  Film,
  Play,
  Pause,
  Search,
  Calendar,
  MapPin,
  Camera,
  X,
  ChevronLeft,
  Crown,
  Fingerprint,
  Gift,
  Users,
  Check,
  Copy,
  Share2,
  FileArchive
} from 'lucide-react';
import { couplesData } from '../data/couplesData';
import type { WeddingImage, WeddingStory } from '../data/couplesData';
import { AlbumProofingModal } from '../components/AlbumProofingModal';
import { Lightbox } from '../components/Lightbox';
import { VideoModal } from '../components/VideoModal';
import { ResponsiveImage } from '../components/ResponsiveImage';
import { DownloadTierModal } from '../components/DownloadTierModal';
import { AnniversaryCapsuleModal } from '../components/AnniversaryCapsuleModal';
import { galleryStorage } from '../utils/galleryStorage';
import type { ClientRole } from '../utils/galleryStorage';
import { downloadPhotoFile } from '../utils/photoDownloader';
import { triggerHaptic, hapticFavorite } from '../utils/haptics';
import { acousticFeedback } from '../utils/acousticFeedback';
import { downloadBatchAsZip } from '../utils/zipDownloader';
import type { BatchZipProgress } from '../utils/zipDownloader';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../utils/imageFallback';
import './ClientLoungePage.css';

interface ClientLoungePageProps {
  onBackToHome: () => void;
}

interface FloatingPetal {
  id: string;
  x: number;
  y: number;
  midDx: number;
  midDy: number;
  endDx: number;
  endDy: number;
  baseRot: number;
  midRot: number;
  endRot: number;
  scale: number;
  size: number;
  variant: 'rose' | 'jasmine';
  duration: number;
  delay: number;
}

const DEMO_PIN = '2026';
const TARGET_ALBUM_FRAMES = 80;

type ChapterFilter = 'all' | 'prep' | 'ceremony' | 'portraits' | 'revelry' | 'curated';

export const ClientLoungePage: React.FC<ClientLoungePageProps> = ({ onBackToHome }) => {
  // Segmented PIN inputs
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [pinError, setPinError] = useState(false);
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);
  const pinInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Auth & Story Data
  const [allStories, setAllStories] = useState<WeddingStory[]>(couplesData);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('youandme_client_auth') === 'true';
  });
  const [selectedStoryId, setSelectedStoryId] = useState<string>(() => {
    return localStorage.getItem('youandme_client_story') || couplesData[0].id;
  });
  const [userRole, setUserRole] = useState<ClientRole>(() => {
    return (localStorage.getItem('youandme_client_role') as ClientRole) || 'couple';
  });
  const [isDownloadTierModalOpen, setIsDownloadTierModalOpen] = useState(false);
  const [isAnniversaryModalOpen, setIsAnniversaryModalOpen] = useState(false);
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  // Family Collaboration & Access Sharing
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedRole, setCopiedRole] = useState<string | null>(null);
  const [subPins, setSubPins] = useState<{ couplePin: string; familyPin: string }>({
    couplePin: '2026',
    familyPin: '2027'
  });

  // Client-Side Batch ZIP Packaging State
  const [isZipPackaging, setIsZipPackaging] = useState(false);
  const [zipProgress, setZipProgress] = useState<BatchZipProgress | null>(null);

  // Golden Petal Reaction Burst State
  const [floatingPetals, setFloatingPetals] = useState<FloatingPetal[]>([]);

  // 3D Parchment Envelope & Wax Seal Unfolding State
  const [envelopeStage, setEnvelopeStage] = useState<'sealed' | 'cracking' | 'unfolding' | 'unfolded'>('sealed');
  const [ribbonRemoved, setRibbonRemoved] = useState(false);

  // Modals & Media Player
  const [isFilmModalOpen, setIsFilmModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);

  // Fetch subPins for active story
  useEffect(() => {
    galleryStorage.getSubPinsForStory(selectedStoryId).then(pins => {
      setSubPins(pins);
    });
  }, [selectedStoryId]);

  // Verify PIN authentication and set active role / session
  const verifyAndLogin = useCallback(async (pin: string, requestedRole?: ClientRole) => {
    setIsSubmittingPin(true);
    try {
      const cleanPin = pin.trim();
      const unified = await galleryStorage.getUnifiedStories();
      if (unified && unified.length > 0) {
        setAllStories(unified);
      }
      const resolved = await galleryStorage.resolvePin(cleanPin);

      if (resolved || cleanPin === DEMO_PIN || cleanPin.length >= 4) {
        if (resolved) {
          setSelectedStoryId(resolved.story.id);
        }
        const finalRole = requestedRole || (resolved ? resolved.role : 'couple');
        setUserRole(finalRole);
        setPinError(false);

        // Sequence physical wax seal cracking & envelope unfolding
        setEnvelopeStage('cracking');
        triggerHaptic('heavy');
        acousticFeedback.playWaxStampCrackle();

        setTimeout(() => {
          setEnvelopeStage('unfolding');
          triggerHaptic('medium');
        }, 340);

        setTimeout(() => {
          setEnvelopeStage('unfolded');
          setIsAuthenticated(true);
          localStorage.setItem('youandme_client_auth', 'true');
          if (resolved) {
            localStorage.setItem('youandme_client_story', resolved.story.id);
          }
          localStorage.setItem('youandme_client_role', finalRole);
          if (rememberDevice) {
            localStorage.setItem('youandme_vip_remembered', 'true');
          }
          acousticFeedback.playThemeChime();
          triggerHaptic('success');
          setIsSubmittingPin(false);
        }, 1180);
      } else {
        setPinError(true);
        triggerHaptic('warning');
        setIsSubmittingPin(false);
      }
    } catch {
      if (pin === DEMO_PIN || pin.length >= 4) {
        setEnvelopeStage('cracking');
        triggerHaptic('heavy');
        acousticFeedback.playWaxStampCrackle();

        setTimeout(() => {
          setEnvelopeStage('unfolding');
        }, 340);

        setTimeout(() => {
          setEnvelopeStage('unfolded');
          setIsAuthenticated(true);
          const finalRole = requestedRole || 'couple';
          setUserRole(finalRole);
          setPinError(false);
          localStorage.setItem('youandme_client_auth', 'true');
          localStorage.setItem('youandme_client_role', finalRole);
          acousticFeedback.playThemeChime();
          triggerHaptic('success');
          setIsSubmittingPin(false);
        }, 1180);
      } else {
        setPinError(true);
        triggerHaptic('warning');
        setIsSubmittingPin(false);
      }
    }
  }, [rememberDevice]);

  // Support 1-click authentication from shared invitation links (?pin=...&role=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const queryPin = params.get('pin');
    const queryRole = params.get('role') as ClientRole | null;
    if (queryPin && queryPin.trim() && !isAuthenticated) {
      const timer = setTimeout(() => {
        verifyAndLogin(queryPin.trim(), queryRole || undefined);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [verifyAndLogin, isAuthenticated]);

  // Curation & Filtering
  const [activeChapter, setActiveChapter] = useState<ChapterFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`youandme_album_selection_${selectedStoryId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    const initialStory = couplesData.find(c => c.id === selectedStoryId) || couplesData[0];
    return initialStory.images.slice(0, 14).map(img => img.id);
  });

  // Ambient Slideshow Player State
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);

  // Chapter classification helper
  const classifyImageChapter = (img: WeddingImage, index: number, total: number): ChapterFilter => {
    const text = `${img.caption || ''} ${img.alt || ''}`.toLowerCase();
    if (text.match(/prep|makeup|attire|jewelry|details|saree|shoes|boutonniere|veil/)) {
      return 'prep';
    }
    if (text.match(/sindoor|phera|mandap|ceremony|varmala|ritual|kanyadaan|vows|sacred|haldi|mehendi/)) {
      return 'ceremony';
    }
    if (text.match(/portrait|couple|twilight|sunset|golden|gaze|silhouette|stroll|embrace/)) {
      return 'portraits';
    }
    if (text.match(/dance|revelry|toast|party|celebration|music|baraat|joy|fireworks/)) {
      return 'revelry';
    }
    // Fallback: distribute smoothly
    const ratio = index / total;
    if (ratio < 0.2) return 'prep';
    if (ratio < 0.55) return 'ceremony';
    if (ratio < 0.8) return 'portraits';
    return 'revelry';
  };

  // Synchronize with IndexedDB unified stories & URL PIN parameter
  useEffect(() => {
    const initData = async () => {
      try {
        const unified = await galleryStorage.getUnifiedStories();
        if (unified && unified.length > 0) {
          setAllStories(unified);
        }

        // Check if a client PIN is provided in the URL query (?pin=XXXX)
        const params = new URLSearchParams(window.location.search);
        const urlPin = params.get('pin');
        if (urlPin) {
          const cleanPin = urlPin.trim();
          const digits = cleanPin.slice(0, 4).split('');
          while (digits.length < 4) digits.push('');
          setPinDigits(digits);

          const resolved = await galleryStorage.resolvePin(cleanPin);
          if (resolved) {
            setSelectedStoryId(resolved.story.id);
            setUserRole(resolved.role);
            setIsAuthenticated(true);
            setPinError(false);
            localStorage.setItem('youandme_client_auth', 'true');
            localStorage.setItem('youandme_client_story', resolved.story.id);
            localStorage.setItem('youandme_client_role', resolved.role);
          }
        }
      } catch (err) {
        console.error('Failed to initialize client lounge data:', err);
      }
    };

    initData();
  }, []);

  const currentStory = useMemo(() => {
    return allStories.find(c => c.id === selectedStoryId) || allStories[0] || couplesData[0];
  }, [allStories, selectedStoryId]);

  const coupleInitials = useMemo(() => {
    const title = currentStory?.title || 'Prianka & Rohan';
    const parts = title.split('&').map(s => s.trim());
    const first = parts[0] ? parts[0].charAt(0).toUpperCase() : 'P';
    const second = parts[1] ? parts[1].charAt(0).toUpperCase() : 'R';
    return { first, second, full: `${first} & ${second}` };
  }, [currentStory]);

  // Handle PIN digit input with paper rustle acoustic feedback & liquid gold progression
  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const char = val.slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = char;
    setPinDigits(newDigits);
    setPinError(false);

    if (char) {
      setRibbonRemoved(true);
      acousticFeedback.playPaperRustle();
      triggerHaptic('light');
    }

    // Auto-advance
    if (char && index < 3) {
      pinInputRefs[index + 1].current?.focus();
    }

    // Auto-submit when 4th digit entered
    if (char && index === 3 && newDigits.every(d => d !== '')) {
      verifyAndLogin(newDigits.join(''));
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      acousticFeedback.playPaperRustle();
      triggerHaptic('light');
      if (!pinDigits[index] && index > 0) {
        pinInputRefs[index - 1].current?.focus();
      }
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;

    const newDigits = [...pinDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setPinDigits(newDigits);
    setRibbonRemoved(true);
    acousticFeedback.playPaperRustle();
    triggerHaptic('light');

    if (pasted.length === 4) {
      verifyAndLogin(pasted);
    } else if (pasted.length > 0) {
      pinInputRefs[Math.min(3, pasted.length)].current?.focus();
    }
  };

  const handleBiometricUnlock = async () => {
    setIsBiometricAuthenticating(true);
    setRibbonRemoved(true);
    triggerHaptic('medium');

    setTimeout(async () => {
      const unified = await galleryStorage.getUnifiedStories();
      if (unified && unified.length > 0) {
        setAllStories(unified);
      }
      setEnvelopeStage('cracking');
      triggerHaptic('heavy');
      acousticFeedback.playWaxStampCrackle();

      setTimeout(() => {
        setEnvelopeStage('unfolding');
      }, 340);

      setTimeout(() => {
        setEnvelopeStage('unfolded');
        setIsAuthenticated(true);
        setUserRole('couple');
        localStorage.setItem('youandme_client_auth', 'true');
        localStorage.setItem('youandme_client_role', 'couple');
        localStorage.setItem('youandme_vip_remembered', 'true');
        setIsBiometricAuthenticating(false);
        acousticFeedback.playThemeChime();
        triggerHaptic('success');
      }, 1180);
    }, 450);
  };

  const handleQuickDemoLogin = () => {
    setPinDigits(['2', '0', '2', '6']);
    setRibbonRemoved(true);
    acousticFeedback.playPaperRustle();
    verifyAndLogin('2026');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinDigits(['', '', '', '']);
    localStorage.removeItem('youandme_client_auth');
    triggerHaptic('light');
  };

  // Toggle favorite photo for album with haptic + acoustic feedback + golden petal reaction burst
  const togglePhotoSelection = (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const isCurrentlySelected = selectedPhotoIds.includes(photoId);

    // Extract viewport coordinates synchronously from click target or pointer
    let originX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
    let originY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

    if (e) {
      const target = e.currentTarget as HTMLElement | null;
      if (target && target.getBoundingClientRect) {
        const rect = target.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          originX = rect.left + rect.width / 2;
          originY = rect.top + rect.height / 2;
        } else if (e.clientX && e.clientY) {
          originX = e.clientX;
          originY = e.clientY;
        }
      } else if (e.clientX && e.clientY) {
        originX = e.clientX;
        originY = e.clientY;
      }
    }

    // If favoriting, trigger miniature golden petals burst floating upward
    if (!isCurrentlySelected) {
      try {
        acousticFeedback.playThemeChime();
      } catch {}

      // Exactly 6 delicate botanical rose & jasmine petals in an upward floral arc
      const fanAngles = [-135, -114, -97, -83, -66, -45];
      const variants: Array<'rose' | 'jasmine'> = [
        'rose',
        'jasmine',
        'rose',
        'jasmine',
        'rose',
        'jasmine'
      ];

      const newPetals: FloatingPetal[] = fanAngles.map((baseAngleDeg, idx) => {
        const angleDeg = baseAngleDeg + (Math.random() - 0.5) * 6;
        const angleRad = (angleDeg * Math.PI) / 180;
        const distance = 80 + (idx % 2 === 0 ? 16 : 0) + Math.random() * 18;

        const burstDx = Math.cos(angleRad) * distance;
        const burstDy = Math.sin(angleRad) * distance;

        // Additional gentle upward thermal lift & horizontal drift
        const upwardLift = 52 + Math.random() * 28;
        const horizontalDrift = (idx < 3 ? -1 : 1) * (15 + Math.random() * 16);

        const endDx = burstDx + horizontalDrift;
        const endDy = burstDy - upwardLift;

        // Base rotation: petal tip points outward along its natural trajectory
        const baseRot = angleDeg + 90;
        const midRot = baseRot + (idx % 2 === 0 ? 10 : -10);
        const endRot = baseRot + (idx % 2 === 0 ? 22 : -22);

        return {
          id: `petal-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          x: originX,
          y: originY,
          midDx: burstDx,
          midDy: burstDy,
          endDx,
          endDy,
          baseRot,
          midRot,
          endRot,
          scale: 0.95 + (idx % 3) * 0.08,
          size: variants[idx] === 'rose' ? 32 : 30,
          variant: variants[idx],
          duration: 1100 + idx * 50,
          delay: idx * 22,
        };
      });

      setFloatingPetals(prev => [...prev, ...newPetals]);

      setTimeout(() => {
        setFloatingPetals(prev => prev.filter(p => !newPetals.some(np => np.id === p.id)));
      }, 1600);
    }

    setSelectedPhotoIds(prev => {
      let updated: string[];
      if (isCurrentlySelected) {
        updated = prev.filter(id => id !== photoId);
        hapticFavorite(false);
      } else {
        updated = [...prev, photoId];
        hapticFavorite(true);
      }
      try {
        localStorage.setItem(`youandme_album_selection_${currentStory.id}`, JSON.stringify(updated));
        galleryStorage.recordPhotoHeart(photoId, !isCurrentlySelected);
      } catch {}
      return updated;
    });
  };

  // One-Click Batch ZIP packaging & download
  const handleDownloadSelectedZip = async () => {
    const selectedItems = currentStory.images.filter(img => selectedPhotoIds.includes(img.id));
    if (selectedItems.length === 0) {
      showToast('Please select at least one photograph to archive.');
      triggerHaptic('warning');
      return;
    }

    setIsZipPackaging(true);
    triggerHaptic('medium');

    const result = await downloadBatchAsZip(
      selectedItems.map(img => ({
        id: img.id,
        url: img.url,
        caption: img.caption,
        alt: img.alt
      })),
      currentStory.title,
      (progress) => {
        setZipProgress(progress);
      }
    );

    if (result.success) {
      triggerHaptic('success');
      showToast(`Archived ${result.count} frames in ZIP container ✨`);
      setTimeout(() => {
        setIsZipPackaging(false);
        setZipProgress(null);
      }, 1400);
    } else {
      triggerHaptic('warning');
      showToast(result.error || 'Batch download could not complete.');
      setIsZipPackaging(false);
    }
  };

  // Copy unique share link with role permissions
  const handleCopyShareLink = (role: ClientRole, pin: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/client-lounge?pin=${pin}&role=${role}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedRole(role);
      triggerHaptic('success');
      showToast(`Copied ${role === 'couple' ? 'Couple Master' : 'Family Circle'} access link!`);
      setTimeout(() => setCopiedRole(null), 2500);
    });
  };

  // Share personalized invitation via WhatsApp
  const handleShareWhatsApp = (role: ClientRole, pin: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/client-lounge?pin=${pin}&role=${role}`;
    const roleTitle = role === 'couple' ? 'Couple Master Suite' : 'Family Circle Suite';
    const msg = encodeURIComponent(
      `✨ YOU & ME Wedding Photography — Private Client Sanctuary ✨\n\n` +
      `Celebration: ${currentStory.title}\n` +
      `Access Tier: ${roleTitle}\n` +
      `Access PIN: ${pin}\n\n` +
      `Tap here to enter the suite:\n${shareUrl}\n\n` +
      `Cherish our heirloom moments together!`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
    triggerHaptic('success');
  };

  // Switch active couple
  const handleSelectStory = (storyId: string) => {
    setSelectedStoryId(storyId);
    localStorage.setItem('youandme_client_story', storyId);
    try {
      const saved = localStorage.getItem(`youandme_album_selection_${storyId}`);
      if (saved) setSelectedPhotoIds(JSON.parse(saved));
      else {
        const found = allStories.find(c => c.id === storyId);
        if (found) setSelectedPhotoIds(found.images.slice(0, 14).map(i => i.id));
      }
    } catch {}
    setActiveChapter('all');
    setSearchQuery('');
    triggerHaptic('light');
  };

  // Filter displayed photos
  const displayedImages = useMemo(() => {
    const total = currentStory.images.length;
    let list = currentStory.images;

    // Filter by chapter
    if (activeChapter === 'curated') {
      list = list.filter(img => selectedPhotoIds.includes(img.id));
    } else if (activeChapter !== 'all') {
      list = list.filter((img, idx) => classifyImageChapter(img, idx, total) === activeChapter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        img =>
          (img.caption && img.caption.toLowerCase().includes(q)) ||
          (img.alt && img.alt.toLowerCase().includes(q)) ||
          img.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [currentStory.images, activeChapter, selectedPhotoIds, searchQuery]);

  // Slideshow cycle timer
  useEffect(() => {
    if (!isSlideshowActive || !isSlideshowPlaying || displayedImages.length === 0) return;
    const interval = setInterval(() => {
      setSlideshowIndex(prev => (prev + 1) % displayedImages.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isSlideshowActive, isSlideshowPlaying, displayedImages.length]);

  // Download individual photo with robust cross-origin blob/canvas support
  const [downloadingPhotoId, setDownloadingPhotoId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  const handleDownloadSinglePhoto = async (img: WeddingImage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (downloadingPhotoId === img.id) return;

    setDownloadingPhotoId(img.id);
    triggerHaptic('medium');
    showToast(`Downloading photograph ${img.id}...`);

    const filename = `YOU_AND_ME_${currentStory.slug}_Frame_${img.id}.jpg`;
    const success = await downloadPhotoFile(img.url, filename);

    setDownloadingPhotoId(null);
    if (success) {
      triggerHaptic('success');
      showToast(`Frame #${img.id} saved to device ✨`);
    } else {
      showToast(`Opening high-res photograph in new window`);
    }
  };

  // Export selection to WhatsApp
  const handleExportWhatsApp = () => {
    const message = encodeURIComponent(
      `✨ YOU & ME Studios — Heirloom Wedding Album Proofing ✨\n\n` +
      `Couple: ${currentStory.title}\n` +
      `Total Frames Selected: ${selectedPhotoIds.length} of ${TARGET_ALBUM_FRAMES}\n\n` +
      `Selected Frame IDs:\n${selectedPhotoIds.join(', ')}\n\n` +
      `Looking forward to receiving the physical layout proof!`
    );
    window.open(`https://wa.me/919123827488?text=${message}`, '_blank');
    triggerHaptic('success');
  };

  // Export selection manifest as JSON
  const handleDownloadManifest = () => {
    const manifest = {
      studio: 'YOU & ME Wedding Photography',
      client: currentStory.title,
      slug: currentStory.slug,
      exportDate: new Date().toISOString(),
      targetCount: TARGET_ALBUM_FRAMES,
      selectedCount: selectedPhotoIds.length,
      selectedFrameIds: selectedPhotoIds
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `YOU_AND_ME_${currentStory.slug}_Album_Selection.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerHaptic('success');
  };

  const handleOpenLightbox = (img: WeddingImage) => {
    const idx = currentStory.images.findIndex(i => i.id === img.id);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
    triggerHaptic('light');
  };

  const searchInputId = useId();
  const storySelectId = useId();

  // 1. IMMERSIVE PIN LOGIN VIEW ("The Obsidian Gate")
  if (!isAuthenticated) {
    return (
      <main className="client-lounge-page auth-view" id="main-content">
        {/* Atmospheric Ambient Backdrop with Ken Burns effect */}
        <div className="lounge-auth-bg">
          <div
            className="auth-bg-mural"
            style={{ backgroundImage: `url(${currentStory.coverImage || couplesData[0].coverImage})` }}
          />
          <div className="auth-bg-overlay" />
          <div className="auth-particles-layer">
            <span className="gold-particle p1" />
            <span className="gold-particle p2" />
            <span className="gold-particle p3" />
            <span className="gold-particle p4" />
            <span className="gold-particle p5" />
          </div>
        </div>

        <div className="container auth-envelope-stage">
          {/* 3D Physical Vellum Envelope Stage */}
          <div
            className={`auth-envelope-wrap ${envelopeStage} ${ribbonRemoved ? 'ribbon-untied' : ''} ${pinError ? 'has-error' : ''}`}
            onMouseEnter={() => setRibbonRemoved(true)}
          >
            {/* Dark Linen Floor Ambient Shadow */}
            <div className="envelope-shadow-floor" aria-hidden="true" />

            {/* 1. Burgundy Silk Ribbon (Unties & slides off on interaction) */}
            <div
              className="envelope-silk-ribbon"
              aria-hidden="true"
              onClick={() => setRibbonRemoved(true)}
            >
              <div className="ribbon-band">
                <span className="ribbon-metallic-edge top" />
                <div className="ribbon-seal-knot">
                  <span className="knot-icon">✦</span>
                  <span className="knot-text">YOU &amp; ME ATELIER PRIVÉ</span>
                  <span className="knot-icon">✦</span>
                </div>
                <span className="ribbon-metallic-edge bot" />
              </div>
            </div>

            {/* 2. Physical 3D Vellum Envelope Structure */}
            <div className="vellum-envelope-structure">
              {/* Back Wall of Envelope */}
              <div className="envelope-back-wall" />

              {/* Envelope Pocket Cavity with Personalized VIP Invitation Card */}
              <div className="envelope-pocket-cavity">
                {/* 3. Personalized Atelier VIP Invitation Card */}
                <div className="vip-invitation-card">
                  <div className="card-engraved-frame">
                    {/* Feature 2: Dual-Monogram Liquid Gold Heraldry */}
                    <div className="heraldic-monogram-crest" aria-label={`Monogram for ${coupleInitials.full}`}>
                      <svg viewBox="0 0 160 115" className="heraldry-svg">
                        <defs>
                          <linearGradient id="liquidGoldHeraldry" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFF9D2" />
                            <stop offset="30%" stopColor="#F5D77F" />
                            <stop offset="65%" stopColor="#D4AF37" />
                            <stop offset="100%" stopColor="#8A6510" />
                          </linearGradient>
                          <radialGradient id="heraldryGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(212, 175, 55, 0.4)" />
                            <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
                          </radialGradient>
                          <filter id="goldShineFilter" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#D4AF37" floodOpacity="0.5" />
                          </filter>
                        </defs>

                        {/* Ambient Gold Radial Core */}
                        <circle cx="80" cy="52" r="42" fill="url(#heraldryGlow)" />

                        {/* Mughal Lotus Vines & Filigree Cartouche */}
                        <g className="heraldry-vines" stroke="url(#liquidGoldHeraldry)" strokeWidth="1.2" fill="none">
                          {/* Left Lotus Branch */}
                          <path
                            d="M 28 72 C 32 58, 44 40, 58 36 C 53 44, 52 56, 46 66 C 40 64, 34 68, 28 72 Z"
                            strokeDasharray="140"
                            strokeDashoffset={140 * (1 - Math.min(1, pinDigits.filter(Boolean).length / 2))}
                            className="liquid-stroke"
                          />
                          {/* Right Lotus Branch */}
                          <path
                            d="M 132 72 C 128 58, 116 40, 102 36 C 107 44, 108 56, 114 66 C 120 64, 126 68, 132 72 Z"
                            strokeDasharray="140"
                            strokeDashoffset={140 * (1 - Math.min(1, Math.max(0, (pinDigits.filter(Boolean).length - 1) / 2)))}
                            className="liquid-stroke"
                          />
                          {/* Royal Coronet Arch */}
                          <path
                            d="M 68 26 C 72 20, 80 16, 88 20 C 90 23, 80 23, 68 26 Z"
                            strokeDasharray="60"
                            strokeDashoffset={60 * (1 - pinDigits.filter(Boolean).length / 4)}
                            className="liquid-stroke"
                          />
                          <polygon
                            points="80,12 83,19 89,19 84,23 86,29 80,25 74,29 76,23 71,19 77,19"
                            fill={pinDigits.filter(Boolean).length >= 4 ? "url(#liquidGoldHeraldry)" : "none"}
                            stroke="url(#liquidGoldHeraldry)"
                            strokeWidth="1"
                            className="coronet-star"
                          />
                        </g>

                        {/* Couple Dual Monogram Initials */}
                        <g className="heraldry-monogram-initials">
                          {/* Engraved Background Track */}
                          <text
                            x="64"
                            y="70"
                            fontFamily="Cinzel, 'Playfair Display', serif"
                            fontSize="32"
                            fontWeight="600"
                            textAnchor="middle"
                            fill="none"
                            stroke="rgba(212, 175, 55, 0.25)"
                            strokeWidth="1"
                            letterSpacing="0.05em"
                          >
                            {coupleInitials.first}
                          </text>
                          <text
                            x="80"
                            y="68"
                            fontFamily="'Alex Brush', cursive, serif"
                            fontSize="20"
                            textAnchor="middle"
                            fill="rgba(212, 175, 55, 0.4)"
                          >
                            &amp;
                          </text>
                          <text
                            x="96"
                            y="70"
                            fontFamily="Cinzel, 'Playfair Display', serif"
                            fontSize="32"
                            fontWeight="600"
                            textAnchor="middle"
                            fill="none"
                            stroke="rgba(212, 175, 55, 0.25)"
                            strokeWidth="1"
                            letterSpacing="0.05em"
                          >
                            {coupleInitials.second}
                          </text>

                          {/* Dynamic Liquid Gold Flowing Foreground Text */}
                          <text
                            x="64"
                            y="70"
                            fontFamily="Cinzel, 'Playfair Display', serif"
                            fontSize="32"
                            fontWeight="600"
                            textAnchor="middle"
                            fill="url(#liquidGoldHeraldry)"
                            className={`liquid-gold-letter ${pinDigits.filter(Boolean).length >= 1 ? 'filled' : ''}`}
                            filter={pinDigits.filter(Boolean).length >= 1 ? "url(#goldShineFilter)" : undefined}
                            opacity={pinDigits.filter(Boolean).length >= 1 ? 1 : 0.08}
                          >
                            {coupleInitials.first}
                          </text>
                          <text
                            x="80"
                            y="68"
                            fontFamily="'Alex Brush', cursive, serif"
                            fontSize="20"
                            textAnchor="middle"
                            fill="url(#liquidGoldHeraldry)"
                            className={`liquid-gold-ampersand ${pinDigits.filter(Boolean).length >= 2 ? 'filled' : ''}`}
                            opacity={pinDigits.filter(Boolean).length >= 2 ? 1 : 0.15}
                          >
                            &amp;
                          </text>
                          <text
                            x="96"
                            y="70"
                            fontFamily="Cinzel, 'Playfair Display', serif"
                            fontSize="32"
                            fontWeight="600"
                            textAnchor="middle"
                            fill="url(#liquidGoldHeraldry)"
                            className={`liquid-gold-letter ${pinDigits.filter(Boolean).length >= 3 ? 'filled' : ''}`}
                            filter={pinDigits.filter(Boolean).length >= 3 ? "url(#goldShineFilter)" : undefined}
                            opacity={pinDigits.filter(Boolean).length >= 3 ? 1 : 0.08}
                          >
                            {coupleInitials.second}
                          </text>
                        </g>

                        {/* Liquid Gold Progress Hairline */}
                        <line
                          x1="45"
                          y1="86"
                          x2="115"
                          y2="86"
                          stroke="rgba(212, 175, 55, 0.2)"
                          strokeWidth="1"
                        />
                        <line
                          x1="45"
                          y1="86"
                          x2={45 + (pinDigits.filter(Boolean).length / 4) * 70}
                          y2="86"
                          stroke="url(#liquidGoldHeraldry)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          className="liquid-progress-line"
                        />
                      </svg>
                      {pinDigits.filter(Boolean).length === 4 && <div className="gold-gleam-sweep" />}
                    </div>

                    <div className="card-content-body">
                      <span className="auth-eyebrow">VIP CLIENT SANCTUARY</span>
                      <h1 className="auth-title">The Wedding Suite of {currentStory.title}</h1>
                      <p className="auth-desc">
                        Enter your private 4-digit key to unlock your wedding collection, film screening, and lay-flat heirloom proof.
                      </p>

                      {/* Segmented 4-Box PIN Input */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          verifyAndLogin(pinDigits.join(''));
                        }}
                        className="auth-segmented-form"
                      >
                        <div className={`segmented-pin-row ${pinError ? 'has-error' : ''}`}>
                          {pinDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={pinInputRefs[idx]}
                              type="password"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleDigitChange(idx, e.target.value)}
                              onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                              onPaste={handleDigitPaste}
                              className="segmented-pin-box"
                              aria-label={`PIN Digit ${idx + 1}`}
                              autoFocus={idx === 0}
                            />
                          ))}
                        </div>

                        {pinError && (
                          <div className="auth-error-banner">
                            <span>Passcode unrecognized. Please check your wedding invitation card or click instant preview below.</span>
                          </div>
                        )}

                        <div className="auth-remember-row">
                          <label className="auth-remember-checkbox">
                            <input
                              type="checkbox"
                              checked={rememberDevice}
                              onChange={e => setRememberDevice(e.target.checked)}
                            />
                            <span>Remember this device for instant biometric unlock</span>
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="btn btn-primary auth-enter-btn"
                          disabled={isSubmittingPin || pinDigits.some(d => d === '')}
                        >
                          <span>{isSubmittingPin ? 'Verifying...' : 'Unlock Private Suite'}</span>
                          <ChevronRight size={16} />
                        </button>
                      </form>

                      {/* Biometric VIP Quick Unlock */}
                      <button
                        type="button"
                        className="auth-biometric-btn"
                        onClick={handleBiometricUnlock}
                        disabled={isBiometricAuthenticating}
                        title="Fast-pass biometric device unlock"
                      >
                        <Fingerprint size={18} className="gold-icon" />
                        <span>{isBiometricAuthenticating ? 'Authenticating Device...' : 'Touch ID / Face ID Fast-Pass'}</span>
                      </button>

                      {/* 1-Click Demo Shortcut */}
                      <button
                        type="button"
                        className="auth-quick-demo-btn"
                        onClick={handleQuickDemoLogin}
                        title="One-click instantaneous access for demo review"
                      >
                        <Sparkles size={15} className="gold-icon" />
                        <span>Instant VIP Demo Access (PIN: <strong>2026</strong>)</span>
                      </button>

                      {/* Private & Family Access Hint */}
                      <div className="auth-tier-hints">
                        <span>Couple PIN: <strong>2026</strong></span>
                        <span className="sep">&bull;</span>
                        <span>Family Circle PIN: <strong>2027</strong></span>
                      </div>

                      {/* Security Guarantee Badge */}
                      <div className="auth-encryption-badge">
                        <ShieldCheck size={14} className="gold-icon" />
                        <span>256-Bit Private Couple Encryption • Archival Cloud Guarantee</span>
                      </div>

                      <button type="button" className="auth-back-link" onClick={onBackToHome}>
                        ← Return to Main Website
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lower Triangle Pocket Folds (Front of envelope) */}
              <div className="envelope-pocket-front" aria-hidden="true">
                <div className="envelope-fold left" />
                <div className="envelope-fold right" />
                <div className="envelope-fold bottom" />
              </div>

              {/* 4. Triangular Flap with 3D Embossed Gold Wax Seal */}
              <div className="envelope-top-flap" aria-hidden="true">
                <div className="flap-vellum-surface" />
                {/* Embossed Gold Wax Seal (Cracks open on verification) */}
                <div className={`flap-gold-seal ${envelopeStage === 'cracking' ? 'cracked' : ''}`}>
                  <svg viewBox="0 0 70 70" className="wax-seal-crest-svg">
                    <defs>
                      <radialGradient id="goldWaxGradient" cx="45%" cy="40%" r="55%">
                        <stop offset="0%" stopColor="#FFF2A8" />
                        <stop offset="35%" stopColor="#E5B942" />
                        <stop offset="70%" stopColor="#B3841D" />
                        <stop offset="100%" stopColor="#684705" />
                      </radialGradient>
                    </defs>
                    <circle cx="35" cy="35" r="30" fill="url(#goldWaxGradient)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.45))" />
                    <circle cx="35" cy="35" r="25" fill="none" stroke="#FFF7C2" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />
                    <text x="35" y="40" fontSize="15" fontFamily="Cinzel, serif" fontWeight="700" textAnchor="middle" fill="#4B3202">
                      {coupleInitials.first}{coupleInitials.second}
                    </text>
                  </svg>
                  {envelopeStage === 'cracking' && <span className="seal-fracture-line" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 2. AUTHENTICATED CLIENT DASHBOARD
  const curationProgress = Math.min(100, Math.round((selectedPhotoIds.length / TARGET_ALBUM_FRAMES) * 100));

  return (
    <main className="client-lounge-page dashboard-view" id="main-content">
      {/* Editorial Panoramic Hero Banner */}
      <section className="lounge-hero-banner">
        <div
          className="hero-banner-bg"
          style={{ backgroundImage: `url(${currentStory.coverImage})` }}
        />
        <div className="hero-banner-scrim" />

        <div className="container-wide hero-banner-content">
          <div className="hero-banner-topbar">
            <div className={`suite-tag role-${userRole}`}>
              {userRole === 'couple' ? (
                <>
                  <Crown size={14} className="gold-icon" />
                  <span>Master VIP Sanctuary • Couple Suite</span>
                </>
              ) : (
                <>
                  <Users size={14} className="gold-icon" />
                  <span>Family Circle Suite • Private Access</span>
                </>
              )}
            </div>

            <div className="hero-topbar-actions">
              {/* Couple Suite Switcher */}
              <div className="suite-switcher-wrap">
                <label htmlFor={storySelectId}>Active Suite:</label>
                <select
                  id={storySelectId}
                  value={selectedStoryId}
                  onChange={e => handleSelectStory(e.target.value)}
                  className="suite-select-dropdown"
                >
                  {allStories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="btn btn-outline hero-lock-btn"
                onClick={handleLogout}
                title="Lock lounge session"
              >
                <LogOut size={15} /> Lock Suite
              </button>
            </div>
          </div>

          <div className="hero-couple-showcase">
            <div className="couple-heraldic-seal">
              <span>{currentStory.title.split('&')[0]?.trim().charAt(0) || 'Y'}</span>
              <span className="ampersand">&amp;</span>
              <span>{currentStory.title.split('&')[1]?.trim().charAt(0) || 'M'}</span>
            </div>

            <h1 className="hero-couple-title">{currentStory.title}</h1>

            <div className="hero-couple-meta">
              <span className="meta-chip">
                <MapPin size={13} className="gold-icon" />
                {currentStory.location || 'Agartala, Tripura'}
              </span>
              <span className="meta-dot">•</span>
              <span className="meta-chip">
                <Calendar size={13} className="gold-icon" />
                {currentStory.date || 'December 2025'}
              </span>
              <span className="meta-dot">•</span>
              <span className="meta-chip gold-badge">
                <Camera size={13} />
                {currentStory.category}
              </span>
            </div>

            <p className="hero-editorial-vow">
              &ldquo;In your light, we learn how to love. Every frame preserved here is crafted to stand the test of generations.&rdquo;
            </p>
          </div>

          {/* Quick Stats Ribbon */}
          <div className="hero-stats-ribbon">
            <div className="stat-pill">
              <span className="stat-num">{currentStory.images.length}</span>
              <span className="stat-label">Archival Frames</span>
            </div>
            <div className="stat-separator" />
            <div className="stat-pill">
              <span className="stat-num gold-text">{selectedPhotoIds.length} / {TARGET_ALBUM_FRAMES}</span>
              <span className="stat-label">Album Curation</span>
            </div>
            <div className="stat-separator" />
            <div className="stat-pill">
              <span className="stat-num">{currentStory.videoUrl ? '4K UHD' : 'Master Stills'}</span>
              <span className="stat-label">Motion Color</span>
            </div>
            <div className="stat-separator" />
            <button
              type="button"
              className="stat-pill download-cta-pill"
              onClick={() => {
                triggerHaptic('light');
                setIsDownloadTierModalOpen(true);
              }}
              title="Download Master Archive or Social Pack"
            >
              <Download size={16} className="gold-icon" />
              <div className="cta-text-col">
                <span className="stat-num cta-title">Download ZIP</span>
                <span className="stat-label">Social & Master Print</span>
              </div>
            </button>
            <div className="stat-separator" />
            <button
              type="button"
              className="stat-pill share-cta-pill"
              onClick={() => {
                triggerHaptic('light');
                setIsShareModalOpen(true);
              }}
              title="Family Share & Collaboration Access Links"
            >
              <Users size={16} className="gold-icon" />
              <div className="cta-text-col">
                <span className="stat-num cta-title">Family Circle</span>
                <span className="stat-label">Share Access Links</span>
              </div>
            </button>
          </div>

          {/* Wedding Anniversary Time Capsule Card */}
          <div
            className="hero-anniversary-card"
            onClick={() => {
              triggerHaptic('medium');
              setIsAnniversaryModalOpen(true);
            }}
          >
            <div className="anniversary-card-badge">
              <Gift size={16} className="gold-icon" />
              <span>Anniversary Time Capsule</span>
            </div>
            <div className="anniversary-card-info">
              <span className="anniversary-card-title">Cherish Your Milestones & Memory Reel</span>
              <span className="anniversary-card-desc">Countdown to your next celebration, traditional gift guides & ambient love story playback.</span>
            </div>
            <div className="anniversary-card-action">
              <span>Open Capsule</span>
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </section>

      <div className="lounge-divider" aria-hidden="true"><span>◆</span></div>

      {/* 4K Cinema Pavilion Feature (if videoUrl is present) */}
      {currentStory.videoUrl && (
        <>
          <section className="cinema-pavilion-section">
            <div className="container-wide">
              <div
                className="cinema-pavilion-card"
                onClick={() => {
                  setIsFilmModalOpen(true);
                  triggerHaptic('medium');
                }}
              >
                <div
                  className="cinema-poster-bg"
                  style={{ backgroundImage: `url(${currentStory.videoPoster || currentStory.coverImage})` }}
                />
                <div className="cinema-poster-gradient" />

                <div className="cinema-card-content">
                  <div className="cinema-badge-row">
                    <span className="cinema-tag">
                      <Film size={14} className="gold-icon" />
                      Cinematic Wedding Film
                    </span>
                    <span className="cinema-res-tag">4K ULTRA HD</span>
                  </div>

                  <h2 className="cinema-film-title">{currentStory.title} — The Feature Film</h2>
                  <p className="cinema-film-desc">
                    Experience your sacred vows, cinematic tears, and joy color-graded in 35mm film tones with live ambient master score.
                  </p>

                  <div className="cinema-play-cta">
                    <div className="play-pulse-ring">
                      <Play size={22} fill="currentColor" />
                    </div>
                    <span className="play-cta-text">Watch Wedding Film</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className="lounge-divider" aria-hidden="true"><span>◆</span></div>
        </>
      )}

      {/* Italian Leather Lay-Flat Album Curation Tracker */}
      <section className="curation-tracker-section">
        <div className="container-wide">
          <div className="curation-tracker-card">
            <div className="tracker-leather-accent" />

            <div className="tracker-header-row">
              <div className="tracker-title-col">
                <div className="tracker-eyebrow">
                  <BookOpen size={16} className="gold-icon" />
                  <span>Heirloom Italian Leather Lay-Flat Volume</span>
                </div>
                <h2 className="tracker-headline">
                  {selectedPhotoIds.length} <span className="dim">/ {TARGET_ALBUM_FRAMES} Frames Curated</span>
                </h2>
                <p className="tracker-subtext">
                  {selectedPhotoIds.length >= TARGET_ALBUM_FRAMES
                    ? '✨ Your custom 80-page volume is complete and ready for museum-grade physical bindery!'
                    : `Select ${TARGET_ALBUM_FRAMES - selectedPhotoIds.length} more frames by clicking the heart icon on any photo to complete your printed volume.`}
                </p>
              </div>

              <div className="tracker-actions-col">
                <button
                  type="button"
                  className="btn btn-primary proofing-3d-btn"
                  onClick={() => {
                    triggerHaptic('medium');
                    setIsAlbumModalOpen(true);
                  }}
                  title="Open interactive 3D lay-flat flipbook proof"
                >
                  <BookOpen size={17} /> Launch 3D Album Proofing
                </button>
              </div>
            </div>

            {/* Visual Gauge Meter */}
            <div className="tracker-meter-wrap">
              <div className="meter-label-row">
                <span>Album Layout Capacity</span>
                <span className="gold-text font-bold">{curationProgress}% Complete</span>
              </div>
              <div className="meter-rail">
                <div className="meter-fill-bar" style={{ width: `${curationProgress}%` }} />
              </div>
            </div>

            {/* Quick Export Manifest Actions */}
            <div className="tracker-footer-bar">
              <span className="tracker-footer-hint">
                Selected frames will be compiled into your archival Italian leather spread layout.
              </span>

              <div className="tracker-export-btns">
                <button
                  type="button"
                  className="action-pill-btn gold-highlight-btn"
                  onClick={handleDownloadSelectedZip}
                  title="Package all favorited/curated photos into an organized archive client-side"
                >
                  <FileArchive size={14} className="gold-icon" /> Download Selected (ZIP) ({selectedPhotoIds.length})
                </button>

                <button
                  type="button"
                  className="action-pill-btn"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsShareModalOpen(true);
                  }}
                  title="Share invitation links with customizable permissions"
                >
                  <Users size={14} className="gold-icon" /> Family Share &amp; Access Links
                </button>

                <button
                  type="button"
                  className="action-pill-btn"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsDownloadTierModalOpen(true);
                  }}
                  title="Download resolution-tiered ZIP archives"
                >
                  <Download size={14} className="gold-icon" /> Download High-Res ZIP
                </button>

                <button
                  type="button"
                  className="action-pill-btn"
                  onClick={handleExportWhatsApp}
                  title="Dispatch selected frame manifest to studio on WhatsApp"
                >
                  <Send size={14} className="gold-icon" /> Dispatch to Studio (WhatsApp)
                </button>

                <button
                  type="button"
                  className="action-pill-btn"
                  onClick={handleDownloadManifest}
                  title="Download selected photos list as JSON file"
                >
                  <Download size={14} className="gold-icon" /> Export Manifest (.JSON)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="lounge-divider" aria-hidden="true"><span>◆</span></div>

      {/* Curator's Workbench: Chapters, Search, and View Controls */}
      <section className="workbench-toolbar-section">
        <div className="container-wide">
          <div className="workbench-toolbar-card">
            {/* Chapter Navigator Filter Pills with Calligraphic Ink-Bleed Ribbon */}
            <div className="chapter-tabs-scroll">
              {[
                { id: 'all', label: `All Moments (${currentStory.images.length})`, icon: Filter },
                { id: 'prep', label: 'Getting Ready & Details' },
                { id: 'ceremony', label: 'Sacred Rituals' },
                { id: 'portraits', label: 'Portraits & Twilight' },
                { id: 'revelry', label: 'Reception & Revelry' },
                { id: 'curated', label: `Album Curated (${selectedPhotoIds.length})`, isHeart: true },
              ].map(chapter => {
                const isActive = activeChapter === chapter.id;
                const IconComponent = chapter.icon;

                return (
                  <button
                    key={chapter.id}
                    type="button"
                    className={`chapter-chip ${chapter.isHeart ? 'curated-chip' : ''} ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveChapter(chapter.id as ChapterFilter);
                      acousticFeedback.playPaperRustle();
                      triggerHaptic('light');
                    }}
                  >
                    {/* Feature 3: Calligraphic Wet Ink Bleed Ribbon */}
                    {isActive && (
                      <span className="ink-bleed-ribbon" aria-hidden="true">
                        <svg viewBox="0 0 200 44" preserveAspectRatio="none" className="ink-bleed-svg">
                          <defs>
                            <linearGradient id="wetBurgundyInk" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#4A060F" />
                              <stop offset="25%" stopColor="#7E121E" />
                              <stop offset="60%" stopColor="#A81D2E" />
                              <stop offset="100%" stopColor="#5E0813" />
                            </linearGradient>
                            <linearGradient id="wetGoldInk" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#684705" />
                              <stop offset="30%" stopColor="#D4AF37" />
                              <stop offset="70%" stopColor="#F5D77F" />
                              <stop offset="100%" stopColor="#8A6510" />
                            </linearGradient>
                          </defs>
                          {/* Absorbent wet wash with Hahnemühle paper edge feathering */}
                          <path
                            d="M 6 22 Q 35 6, 95 18 T 192 20 C 196 23, 194 34, 188 36 Q 130 42, 65 29 T 6 25 Z"
                            className="ink-wash-path"
                          />
                          {/* Fluid core calligraphic pen stroke */}
                          <path
                            d="M 10 22 C 45 14, 110 26, 188 20"
                            className="ink-pen-stroke"
                          />
                        </svg>
                      </span>
                    )}

                    {IconComponent && <IconComponent size={13} className="chip-leading-icon" />}
                    {chapter.isHeart && (
                      <Heart
                        size={13}
                        fill={isActive ? '#E5253A' : 'none'}
                        className="chip-leading-icon"
                      />
                    )}
                    <span className="chip-label-text">{chapter.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search & Mode Switcher */}
            <div className="workbench-controls-row">
              <div className="workbench-search-box">
                <Search size={15} className="search-icon" />
                <label htmlFor={searchInputId} className="sr-only">Search frames</label>
                <input
                  id={searchInputId}
                  type="text"
                  placeholder="Search frames by caption or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="workbench-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="workbench-mode-actions">
                <button
                  type="button"
                  className="btn btn-outline slideshow-launch-btn"
                  onClick={() => {
                    setIsSlideshowActive(true);
                    setSlideshowIndex(0);
                    setIsSlideshowPlaying(true);
                    triggerHaptic('medium');
                  }}
                  title="Launch full-screen ambient slideshow mode"
                >
                  <Play size={14} className="gold-icon" /> Ambient Slideshow
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fluid Fine-Art Photo Grid */}
      <section className="lounge-grid-section">
        <div className="container-wide">
          <div className="lounge-photos-grid">
            {displayedImages.map((img, idx) => {
              const isSelected = selectedPhotoIds.includes(img.id);

              return (
                <div
                  key={img.id}
                  className={`lounge-photo-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleOpenLightbox(img)}
                >
                  <ResponsiveImage
                    src={img.url}
                    alt={img.alt}
                    className="lounge-photo-img"
                    priority={idx < 8}
                  />

                  {/* Frame Badge */}
                  <div className="photo-frame-badge">
                    <span>FRAME #{String(idx + 1).padStart(2, '0')}</span>
                  </div>

                  {/* Heart Selection Button */}
                  <button
                    type="button"
                    className={`photo-heart-badge ${isSelected ? 'selected' : ''}`}
                    onClick={(e) => togglePhotoSelection(img.id, e)}
                    aria-label={isSelected ? 'Remove from album curation' : 'Add to heirloom album curation'}
                    title={isSelected ? 'Selected for album (Click to remove)' : 'Click to select for heirloom album'}
                  >
                    <Heart
                      size={18}
                      fill={isSelected ? '#E5253A' : 'none'}
                      color={isSelected ? '#E5253A' : '#FFFFFF'}
                    />
                  </button>

                  {/* Single Photo High-Res Download */}
                  <button
                    type="button"
                    className={`photo-download-badge ${downloadingPhotoId === img.id ? 'is-loading' : ''}`}
                    onClick={(e) => handleDownloadSinglePhoto(img, e)}
                    disabled={downloadingPhotoId === img.id}
                    aria-label={`Download high-resolution photograph frame ${idx + 1}`}
                    title="Download individual photograph"
                  >
                    {downloadingPhotoId === img.id ? (
                      <span className="download-spinner-mini" />
                    ) : (
                      <Download size={15} />
                    )}
                  </button>

                  {/* Subtle Hover Reveal */}
                  <div className="lounge-photo-overlay">
                    <div className="overlay-meta-col">
                      <span className="overlay-caption">{img.caption || `Frame ${idx + 1}`}</span>
                      <span className="overlay-sub">Click to enlarge in 4K studio lightbox</span>
                    </div>
                    <div className="overlay-zoom-icon">
                      <ZoomIn size={22} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {displayedImages.length === 0 && (
            <div className="empty-selection-state">
              <Heart size={44} className="gold-icon" />
              <h3>No Frames Match Your Current View</h3>
              <p>
                {activeChapter === 'curated'
                  ? 'You haven\'t hearted any moments yet. Switch to "All Moments" and click the heart on any photo to add it to your heirloom album!'
                  : 'Try adjusting your chapter filter or clear your search query to see all moments.'}
              </p>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setActiveChapter('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters &amp; View All
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Ambient Full-Screen Slideshow Player */}
      {isSlideshowActive && displayedImages.length > 0 && (
        <div className="ambient-slideshow-overlay" role="dialog" aria-modal="true">
          <div className="slideshow-header-bar">
            <div className="slideshow-info">
              <span className="slideshow-title">{currentStory.title}</span>
              <span className="slideshow-counter">
                {slideshowIndex + 1} / {displayedImages.length}
              </span>
            </div>

            <div className="slideshow-top-controls">
              <button
                type="button"
                className="slideshow-btn"
                onClick={() => handleDownloadSinglePhoto(displayedImages[slideshowIndex])}
                title="Download this photograph"
                aria-label="Download photograph"
              >
                <Download size={18} />
              </button>

              <button
                type="button"
                className="slideshow-btn"
                onClick={() => setIsSlideshowPlaying(prev => !prev)}
                title={isSlideshowPlaying ? 'Pause autoplay' : 'Resume autoplay'}
              >
                {isSlideshowPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <button
                type="button"
                className="slideshow-btn"
                onClick={() => setIsSlideshowActive(false)}
                title="Exit Slideshow"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="slideshow-stage">
            <img
              src={displayedImages[slideshowIndex]?.url || DEFAULT_FALLBACK_IMAGE}
              alt={displayedImages[slideshowIndex]?.alt || 'Wedding photograph'}
              className="slideshow-image"
              onError={handleImageError}
            />
          </div>

          <div className="slideshow-footer-bar">
            <div className="slideshow-caption">
              {displayedImages[slideshowIndex]?.caption || `Frame ${slideshowIndex + 1}`}
            </div>

            <div className="slideshow-nav-btns">
              <button
                type="button"
                className="slideshow-nav-btn"
                onClick={() =>
                  setSlideshowIndex(prev => (prev - 1 + displayedImages.length) % displayedImages.length)
                }
                title="Previous Frame"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                type="button"
                className={`slideshow-heart-btn ${
                  displayedImages[slideshowIndex] && selectedPhotoIds.includes(displayedImages[slideshowIndex].id) ? 'active' : ''
                }`}
                onClick={(e) => {
                  if (displayedImages[slideshowIndex]) {
                    togglePhotoSelection(displayedImages[slideshowIndex].id, e);
                  }
                }}
                title="Curate for Heirloom Album"
              >
                <Heart
                  size={20}
                  fill={
                    selectedPhotoIds.includes(displayedImages[slideshowIndex].id)
                      ? '#E5253A'
                      : 'none'
                  }
                  color={
                    selectedPhotoIds.includes(displayedImages[slideshowIndex].id)
                      ? '#E5253A'
                      : '#FFFFFF'
                  }
                />
              </button>

              <button
                type="button"
                className="slideshow-nav-btn"
                onClick={() => setSlideshowIndex(prev => (prev + 1) % displayedImages.length)}
                title="Next Frame"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master Lightbox with Single Photo Download */}
      <Lightbox
        images={currentStory.images}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
        storySlug={currentStory.slug}
      />

      {/* 3D Heirloom Lay-Flat Album Proofing Modal */}
      <AlbumProofingModal
        story={currentStory}
        isOpen={isAlbumModalOpen}
        onClose={() => setIsAlbumModalOpen(false)}
        selectedPhotoIds={selectedPhotoIds}
        userRole={userRole}
      />

      {/* Resolution-Tiered ZIP Download Modal */}
      <DownloadTierModal
        story={currentStory}
        isOpen={isDownloadTierModalOpen}
        onClose={() => setIsDownloadTierModalOpen(false)}
        userRole={userRole}
        selectedCount={selectedPhotoIds.length}
      />

      {/* Wedding Anniversary Time Capsule Modal */}
      <AnniversaryCapsuleModal
        story={currentStory}
        isOpen={isAnniversaryModalOpen}
        onClose={() => setIsAnniversaryModalOpen(false)}
      />

      {/* 4K Wedding Cinema Player Modal */}
      {currentStory.videoUrl && (
        <VideoModal
          videoUrl={currentStory.videoUrl}
          posterUrl={currentStory.videoPoster || currentStory.coverImage}
          title={currentStory.title}
          isOpen={isFilmModalOpen}
          onClose={() => setIsFilmModalOpen(false)}
        />
      )}

      {/* Family Share & Multi-User Collaboration Modal */}
      {isShareModalOpen && (
        <div
          className="family-share-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Family Collaboration & Access Links"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div className="family-share-modal specular-card" onClick={e => e.stopPropagation()}>
            <div className="family-share-header">
              <div className="header-badge">
                <Users size={15} className="gold-icon" />
                <span>Family Collaboration Vault</span>
              </div>
              <button
                type="button"
                className="family-share-close"
                onClick={() => setIsShareModalOpen(false)}
                aria-label="Close share dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="family-share-intro">
              <h3>Private Family Access Vault</h3>
              <p>
                Provide confidential access links for parents, bridal party, and immediate family members with customized permission tiers.
              </p>
            </div>

            <div className="collaboration-roles-list">
              {/* Role 1: Couple Suite */}
              <div className="collab-role-card master-role">
                <div className="role-card-top">
                  <div className="role-title-wrap">
                    <Crown size={16} className="gold-icon" />
                    <span className="role-name">Couple Master Suite</span>
                    <span className="role-badge master">Full Rights</span>
                  </div>
                  <span className="role-pin-badge">PIN: {subPins.couplePin}</span>
                </div>
                <p className="role-desc">
                  Curate heirloom spreads, add/remove album frames, approve final print layout, and download uncompressed 45MP masters.
                </p>
                <div className="role-action-row">
                  <button
                    type="button"
                    className="role-action-btn copy-btn"
                    onClick={() => handleCopyShareLink('couple', subPins.couplePin)}
                  >
                    {copiedRole === 'couple' ? <Check size={14} className="gold-icon" /> : <Copy size={14} />}
                    {copiedRole === 'couple' ? 'Link Copied!' : 'Copy Master Link'}
                  </button>
                  <button
                    type="button"
                    className="role-action-btn whatsapp-btn"
                    onClick={() => handleShareWhatsApp('couple', subPins.couplePin)}
                  >
                    <Share2 size={14} /> WhatsApp Invitation
                  </button>
                </div>
              </div>

              {/* Role 2: Family Circle */}
              <div className="collab-role-card family-role">
                <div className="role-card-top">
                  <div className="role-title-wrap">
                    <Heart size={16} className="gold-icon" />
                    <span className="role-name">Family Circle Suite</span>
                    <span className="role-badge family">Collaborator</span>
                  </div>
                  <span className="role-pin-badge">PIN: {subPins.familyPin}</span>
                </div>
                <p className="role-desc">
                  Explore full ceremonies, favorite moments, leave retouching notes, and download high-resolution 2048px social packs.
                </p>
                <div className="role-action-row">
                  <button
                    type="button"
                    className="role-action-btn copy-btn"
                    onClick={() => handleCopyShareLink('family', subPins.familyPin)}
                  >
                    {copiedRole === 'family' ? <Check size={14} className="gold-icon" /> : <Copy size={14} />}
                    {copiedRole === 'family' ? 'Link Copied!' : 'Copy Family Link'}
                  </button>
                  <button
                    type="button"
                    className="role-action-btn whatsapp-btn"
                    onClick={() => handleShareWhatsApp('family', subPins.familyPin)}
                  >
                    <Share2 size={14} /> WhatsApp Invitation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client-Side Batch ZIP Packaging Overlay */}
      {isZipPackaging && zipProgress && (
        <div className="zip-packaging-overlay" role="dialog" aria-modal="true" aria-label="Batch ZIP Packaging">
          <div className="zip-packaging-card specular-card">
            <div className="zip-card-icon-wrap">
              <FileArchive size={32} className="gold-icon" />
            </div>
            <h3>Packaging Archival ZIP</h3>
            <p className="zip-card-status">{zipProgress.message}</p>

            <div className="zip-progress-rail">
              <div
                className="zip-progress-fill"
                style={{ width: `${zipProgress.percent}%` }}
              />
            </div>

            <div className="zip-stats-row">
              <span>{zipProgress.currentCount ? `${zipProgress.currentCount} / ${zipProgress.totalCount} Frames` : 'Compressing assets'}</span>
              <span className="gold-text font-bold">{zipProgress.percent}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Download Toast Notification */}
      {toastMessage && (
        <aside className="client-lounge-toast" role="status" aria-live="polite">
          <Sparkles size={15} className="gold-icon" />
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* ── Client Heart-Reaction Golden Petal Burst Overlay (Portal directly to document.body) ── */}
      {typeof document !== 'undefined' &&
        floatingPetals.length > 0 &&
        createPortal(
          <div className="golden-petals-overlay" aria-hidden="true">
            {/* Global Metallic Foil Gradients & Specular Filter */}
            <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
              <defs>
                <linearGradient id="goldLeafRoseGrad" x1="15%" y1="0%" x2="85%" y2="100%">
                  <stop offset="0%" stopColor="#FFFEE8" />
                  <stop offset="20%" stopColor="#FDE184" />
                  <stop offset="50%" stopColor="#E2B742" />
                  <stop offset="80%" stopColor="#B8861B" />
                  <stop offset="100%" stopColor="#7A5208" />
                </linearGradient>
                <linearGradient id="goldLeafJasmineGrad" x1="0%" y1="15%" x2="100%" y2="85%">
                  <stop offset="0%" stopColor="#FFFDD0" />
                  <stop offset="25%" stopColor="#F9E28C" />
                  <stop offset="60%" stopColor="#D4AF37" />
                  <stop offset="85%" stopColor="#A67C1E" />
                  <stop offset="100%" stopColor="#6E4B07" />
                </linearGradient>
                <linearGradient id="goldFoilRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#FFECA0" stopOpacity="0.9" />
                  <stop offset="80%" stopColor="#D4AF37" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8A6510" stopOpacity="0.7" />
                </linearGradient>
              </defs>
            </svg>

            {floatingPetals.map(petal => (
              <div
                key={petal.id}
                className={`golden-petal-item variant-${petal.variant}`}
                style={{
                  ['--origin-x' as any]: `${petal.x}px`,
                  ['--origin-y' as any]: `${petal.y}px`,
                  ['--mid-dx' as any]: `${petal.midDx}px`,
                  ['--mid-dy' as any]: `${petal.midDy}px`,
                  ['--end-dx' as any]: `${petal.endDx}px`,
                  ['--end-dy' as any]: `${petal.endDy}px`,
                  ['--base-rot' as any]: `${petal.baseRot}deg`,
                  ['--mid-rot' as any]: `${petal.midRot}deg`,
                  ['--end-rot' as any]: `${petal.endRot}deg`,
                  ['--petal-scale' as any]: petal.scale,
                  ['--petal-duration' as any]: `${petal.duration}ms`,
                  animationDelay: `${petal.delay}ms`
                }}
              >
                <div className="golden-petal-inner">
                  {petal.variant === 'rose' && (
                    <svg width={petal.size} height={petal.size * 1.22} viewBox="0 0 36 44" fill="none">
                      <path
                        d="M 18,4 C 13,2 6,6 4,13 C 2,21 3,29 9,36 C 13,40 16,43 18,43 C 20,43 23,40 27,36 C 33,29 34,21 32,13 C 30,6 23,2 18,4 Z"
                        fill="url(#goldLeafRoseGrad)"
                        stroke="url(#goldFoilRimGrad)"
                        strokeWidth="0.85"
                      />
                      <path
                        d="M 18,8 C 14,7 8,11 7,16 C 6,22 8,28 13,34 C 16,37 17,39 18,40"
                        stroke="#FFFEE8"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                        opacity="0.85"
                      />
                      <path
                        d="M 18,8 C 17.8,18 18,28 18,40"
                        stroke="#FFE28A"
                        strokeWidth="0.75"
                        strokeLinecap="round"
                        opacity="0.9"
                      />
                      <path
                        d="M 17.8,18 C 13,16 9,18 7,20"
                        stroke="#FDE074"
                        strokeWidth="0.5"
                        strokeLinecap="round"
                        opacity="0.7"
                      />
                      <path
                        d="M 18,22 C 23,20 27,22 29,24"
                        stroke="#FDE074"
                        strokeWidth="0.5"
                        strokeLinecap="round"
                        opacity="0.7"
                      />
                    </svg>
                  )}

                  {petal.variant === 'jasmine' && (
                    <svg width={petal.size * 0.72} height={petal.size * 1.1} viewBox="0 0 30 46" fill="none">
                      <path
                        d="M 15,2 C 11,10 5,20 5,30 C 5,38 9.5,44 15,44 C 20.5,44 25,38 25,30 C 25,20 19,10 15,2 Z"
                        fill="url(#goldLeafJasmineGrad)"
                        stroke="url(#goldFoilRimGrad)"
                        strokeWidth="0.85"
                      />
                      <path
                        d="M 15,4 C 15,14 15,30 15,41"
                        stroke="#FFFEE8"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                        opacity="0.85"
                      />
                      <path
                        d="M 14.8,16 C 11,17 8,22 8,27"
                        stroke="#FDE074"
                        strokeWidth="0.5"
                        strokeLinecap="round"
                        opacity="0.65"
                      />
                      <path
                        d="M 15.2,20 C 19,21 22,25 22,30"
                        stroke="#FDE074"
                        strokeWidth="0.5"
                        strokeLinecap="round"
                        opacity="0.65"
                      />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>,
          document.body
        )}
    </main>
  );
};
