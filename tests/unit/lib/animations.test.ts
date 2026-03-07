import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fadeIn,
  fadeInUp,
  fadeInDown,
  slideInLeft,
  slideInRight,
  scaleIn,
  scaleOut,
  staggerContainer,
  staggerItem,
  pageTransition,
  mobileMenuVariants,
  mobileMenuItemVariants,
  cardHoverVariants,
  transitions,
  cssKeyframes,
  getReducedMotionVariant,
  createStaggerContainer,
  createFadeInVariant,
} from '@/lib/animations';

describe('animations', () => {
  describe('Framer Motion Variants', () => {
    describe('fadeIn', () => {
      it('should have correct hidden state', () => {
        expect(fadeIn.hidden).toEqual({ opacity: 0 });
      });

      it('should have correct visible state with transition', () => {
        expect(fadeIn.visible).toEqual({
          opacity: 1,
          transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
        });
      });

      it('should have correct exit state', () => {
        expect(fadeIn.exit).toEqual({
          opacity: 0,
          transition: { duration: 0.2 },
        });
      });
    });

    describe('fadeInUp', () => {
      it('should have correct hidden state with y offset', () => {
        expect(fadeInUp.hidden).toEqual({ opacity: 0, y: 20 });
      });

      it('should have correct visible state', () => {
        expect(fadeInUp.visible).toEqual({
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
        });
      });

      it('should have correct exit state with y offset', () => {
        expect(fadeInUp.exit).toEqual({
          opacity: 0,
          y: -10,
          transition: { duration: 0.2 },
        });
      });
    });

    describe('fadeInDown', () => {
      it('should have correct hidden state with negative y offset', () => {
        expect(fadeInDown.hidden).toEqual({ opacity: 0, y: -20 });
      });

      it('should have correct visible state', () => {
        expect(fadeInDown.visible).toEqual({
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
        });
      });

      it('should have correct exit state with positive y offset', () => {
        expect(fadeInDown.exit).toEqual({
          opacity: 0,
          y: 10,
          transition: { duration: 0.2 },
        });
      });
    });

    describe('slideInLeft', () => {
      it('should have correct hidden state with negative x offset', () => {
        expect(slideInLeft.hidden).toEqual({ opacity: 0, x: -30 });
      });

      it('should have correct visible state', () => {
        expect(slideInLeft.visible).toEqual({
          opacity: 1,
          x: 0,
          transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
        });
      });

      it('should have correct exit state with negative x offset', () => {
        expect(slideInLeft.exit).toEqual({
          opacity: 0,
          x: -20,
          transition: { duration: 0.2 },
        });
      });
    });

    describe('slideInRight', () => {
      it('should have correct hidden state with positive x offset', () => {
        expect(slideInRight.hidden).toEqual({ opacity: 0, x: 30 });
      });

      it('should have correct visible state', () => {
        expect(slideInRight.visible).toEqual({
          opacity: 1,
          x: 0,
          transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
        });
      });

      it('should have correct exit state with positive x offset', () => {
        expect(slideInRight.exit).toEqual({
          opacity: 0,
          x: 20,
          transition: { duration: 0.2 },
        });
      });
    });

    describe('scaleIn', () => {
      it('should have correct hidden state with scale 0.9', () => {
        expect(scaleIn.hidden).toEqual({ opacity: 0, scale: 0.9 });
      });

      it('should have correct visible state with scale 1', () => {
        expect(scaleIn.visible).toEqual({
          opacity: 1,
          scale: 1,
          transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
        });
      });

      it('should have correct exit state with scale 0.95', () => {
        expect(scaleIn.exit).toEqual({
          opacity: 0,
          scale: 0.95,
          transition: { duration: 0.2 },
        });
      });
    });

    describe('scaleOut', () => {
      it('should have correct hidden state with scale 1.1', () => {
        expect(scaleOut.hidden).toEqual({ opacity: 0, scale: 1.1 });
      });

      it('should have correct visible state with scale 1', () => {
        expect(scaleOut.visible).toEqual({
          opacity: 1,
          scale: 1,
          transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
        });
      });

      it('should have correct exit state with scale 1.05', () => {
        expect(scaleOut.exit).toEqual({
          opacity: 0,
          scale: 1.05,
          transition: { duration: 0.2 },
        });
      });
    });

    describe('staggerContainer', () => {
      it('should have correct hidden state', () => {
        expect(staggerContainer.hidden).toEqual({ opacity: 0 });
      });

      it('should have correct visible state with staggerChildren and delayChildren', () => {
        expect(staggerContainer.visible).toEqual({
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
          },
        });
      });

      it('should have correct exit state with staggerChildren and staggerDirection', () => {
        expect(staggerContainer.exit).toEqual({
          opacity: 0,
          transition: {
            staggerChildren: 0.05,
            staggerDirection: -1,
          },
        });
      });
    });

    describe('staggerItem', () => {
      it('should have correct hidden state', () => {
        expect(staggerItem.hidden).toEqual({ opacity: 0, y: 20 });
      });

      it('should have correct visible state', () => {
        expect(staggerItem.visible).toEqual({
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
        });
      });

      it('should have correct exit state', () => {
        expect(staggerItem.exit).toEqual({
          opacity: 0,
          y: -10,
          transition: { duration: 0.2 },
        });
      });
    });

    describe('pageTransition', () => {
      it('should have correct initial state with y offset', () => {
        expect(pageTransition.initial).toEqual({ opacity: 0, y: 10 });
      });

      it('should have correct animate state', () => {
        expect(pageTransition.animate).toEqual({
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
        });
      });

      it('should have correct exit state', () => {
        expect(pageTransition.exit).toEqual({
          opacity: 0,
          y: -10,
          transition: { duration: 0.2 },
        });
      });
    });

    describe('mobileMenuVariants', () => {
      it('should have correct closed state with height 0', () => {
        expect(mobileMenuVariants.closed).toEqual({
          opacity: 0,
          height: 0,
          transition: {
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1],
            when: 'afterChildren',
          },
        });
      });

      it('should have correct open state with auto height', () => {
        expect(mobileMenuVariants.open).toEqual({
          opacity: 1,
          height: 'auto',
          transition: {
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1],
            when: 'beforeChildren',
            staggerChildren: 0.05,
          },
        });
      });
    });

    describe('mobileMenuItemVariants', () => {
      it('should have correct closed state with x offset', () => {
        expect(mobileMenuItemVariants.closed).toEqual({ opacity: 0, x: -10 });
      });

      it('should have correct open state', () => {
        expect(mobileMenuItemVariants.open).toEqual({
          opacity: 1,
          x: 0,
          transition: { duration: 0.2 },
        });
      });
    });

    describe('cardHoverVariants', () => {
      it('should have correct initial state with default shadow', () => {
        expect(cardHoverVariants.initial).toEqual({
          y: 0,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        });
      });

      it('should have correct hover state with lifted effect', () => {
        expect(cardHoverVariants.hover).toEqual({
          y: -4,
          boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          transition: { duration: 0.2, ease: 'easeOut' },
        });
      });

      it('should have correct tap state returning to original', () => {
        expect(cardHoverVariants.tap).toEqual({
          y: 0,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          transition: { duration: 0.1 },
        });
      });
    });
  });

  describe('transitions', () => {
    it('should have spring transition with correct properties', () => {
      expect(transitions.spring).toEqual({
        type: 'spring',
        stiffness: 300,
        damping: 30,
      });
    });

    it('should have springSoft transition with lower stiffness', () => {
      expect(transitions.springSoft).toEqual({
        type: 'spring',
        stiffness: 200,
        damping: 25,
      });
    });

    it('should have ease transition with custom bezier', () => {
      expect(transitions.ease).toEqual({
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      });
    });

    it('should have easeInOut transition with custom bezier', () => {
      expect(transitions.easeInOut).toEqual({
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      });
    });

    it('should have easeOut transition with custom bezier', () => {
      expect(transitions.easeOut).toEqual({
        duration: 0.3,
        ease: [0, 0, 0.2, 1],
      });
    });

    it('should have fast transition with linear ease', () => {
      expect(transitions.fast).toEqual({
        duration: 0.15,
        ease: 'linear',
      });
    });

    it('should have slow transition with longer duration', () => {
      expect(transitions.slow).toEqual({
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      });
    });
  });

  describe('cssKeyframes', () => {
    it('should contain fadeIn keyframe', () => {
      expect(cssKeyframes.fadeIn).toContain('@keyframes fadeIn');
      expect(cssKeyframes.fadeIn).toContain('opacity: 0');
      expect(cssKeyframes.fadeIn).toContain('opacity: 1');
    });

    it('should contain fadeInUp keyframe with transform', () => {
      expect(cssKeyframes.fadeInUp).toContain('@keyframes fadeInUp');
      expect(cssKeyframes.fadeInUp).toContain('translateY(20px)');
      expect(cssKeyframes.fadeInUp).toContain('translateY(0)');
    });

    it('should contain fadeInDown keyframe with negative translateY', () => {
      expect(cssKeyframes.fadeInDown).toContain('@keyframes fadeInDown');
      expect(cssKeyframes.fadeInDown).toContain('translateY(-20px)');
    });

    it('should contain slideInLeft keyframe with negative translateX', () => {
      expect(cssKeyframes.slideInLeft).toContain('@keyframes slideInLeft');
      expect(cssKeyframes.slideInLeft).toContain('translateX(-30px)');
    });

    it('should contain slideInRight keyframe with positive translateX', () => {
      expect(cssKeyframes.slideInRight).toContain('@keyframes slideInRight');
      expect(cssKeyframes.slideInRight).toContain('translateX(30px)');
    });

    it('should contain pulse keyframe', () => {
      expect(cssKeyframes.pulse).toContain('@keyframes pulse');
      expect(cssKeyframes.pulse).toContain('opacity: 1');
      expect(cssKeyframes.pulse).toContain('opacity: 0.5');
    });

    it('should contain bounce keyframe', () => {
      expect(cssKeyframes.bounce).toContain('@keyframes bounce');
      expect(cssKeyframes.bounce).toContain('translateY(-25%)');
    });

    it('should contain shake keyframe', () => {
      expect(cssKeyframes.shake).toContain('@keyframes shake');
      expect(cssKeyframes.shake).toContain('translateX(-4px)');
      expect(cssKeyframes.shake).toContain('translateX(4px)');
    });

    it('should contain spin keyframe', () => {
      expect(cssKeyframes.spin).toContain('@keyframes spin');
      expect(cssKeyframes.spin).toContain('rotate(0deg)');
      expect(cssKeyframes.spin).toContain('rotate(360deg)');
    });

    it('should contain progress keyframe with background-position', () => {
      expect(cssKeyframes.progress).toContain('@keyframes progress');
      expect(cssKeyframes.progress).toContain('background-position');
    });

    it('should contain skeleton keyframe', () => {
      expect(cssKeyframes.skeleton).toContain('@keyframes skeleton');
      expect(cssKeyframes.skeleton).toContain('-200% 0');
      expect(cssKeyframes.skeleton).toContain('200% 0');
    });

    it('should contain float keyframe', () => {
      expect(cssKeyframes.float).toContain('@keyframes float');
      expect(cssKeyframes.float).toContain('translateY(-10px)');
    });
  });

  describe('createStaggerContainer', () => {
    it('should create container with default stagger values', () => {
      // Act
      const result = createStaggerContainer();

      // Assert
      expect(result.hidden).toEqual({ opacity: 0 });
      expect(result.visible).toEqual({
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.1,
        },
      });
    });

    it('should create container with custom stagger delay', () => {
      // Act
      const result = createStaggerContainer(0.2);

      // Assert
      expect(result.visible).toEqual({
        opacity: 1,
        transition: {
          staggerChildren: 0.2,
          delayChildren: 0.1,
        },
      });
    });

    it('should create container with custom stagger delay and delayChildren', () => {
      // Act
      const result = createStaggerContainer(0.15, 0.3);

      // Assert
      expect(result.visible).toEqual({
        opacity: 1,
        transition: {
          staggerChildren: 0.15,
          delayChildren: 0.3,
        },
      });
    });
  });

  describe('createFadeInVariant', () => {
    it('should create variant with default up direction', () => {
      // Act
      const result = createFadeInVariant();

      // Assert
      expect(result.hidden).toEqual({ opacity: 0, y: 20 });
      expect(result.visible).toEqual({
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
      });
    });

    it('should create variant with down direction', () => {
      // Act
      const result = createFadeInVariant('down');

      // Assert
      expect(result.hidden).toEqual({ opacity: 0, y: -20 });
      expect(result.visible).toEqual({
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
      });
    });

    it('should create variant with left direction', () => {
      // Act
      const result = createFadeInVariant('left');

      // Assert
      expect(result.hidden).toEqual({ opacity: 0, x: 20 });
      expect(result.visible).toEqual({
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
      });
    });

    it('should create variant with right direction', () => {
      // Act
      const result = createFadeInVariant('right');

      // Assert
      expect(result.hidden).toEqual({ opacity: 0, x: -20 });
      expect(result.visible).toEqual({
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
      });
    });

    it('should create variant with custom distance', () => {
      // Act
      const result = createFadeInVariant('up', 50);

      // Assert
      expect(result.hidden).toEqual({ opacity: 0, y: 50 });
    });

    it('should apply custom distance to all directions', () => {
      // Arrange & Act
      const up = createFadeInVariant('up', 30);
      const down = createFadeInVariant('down', 30);
      const left = createFadeInVariant('left', 30);
      const right = createFadeInVariant('right', 30);

      // Assert
      expect(up.hidden).toEqual({ opacity: 0, y: 30 });
      expect(down.hidden).toEqual({ opacity: 0, y: -30 });
      expect(left.hidden).toEqual({ opacity: 0, x: 30 });
      expect(right.hidden).toEqual({ opacity: 0, x: -30 });
    });
  });

  describe('getReducedMotionVariant', () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    const createMatchMediaMock = (matches: boolean) => {
      return vi.fn().mockReturnValue({
        matches,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
    };

    it('should return original variant when reduced motion is not preferred', () => {
      // Arrange
      window.matchMedia = createMatchMediaMock(false);
      const originalVariant = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
      };

      // Act
      const result = getReducedMotionVariant(originalVariant);

      // Assert
      expect(result).toBe(originalVariant);
    });

    it('should return reduced motion variant when prefers-reduced-motion is true', () => {
      // Arrange
      window.matchMedia = createMatchMediaMock(true);
      const originalVariant = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
      };

      // Act
      const result = getReducedMotionVariant(originalVariant);

      // Assert
      expect(result).toEqual({
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0 } },
        exit: { opacity: 0, transition: { duration: 0 } },
      });
    });

    it('should handle undefined window gracefully', () => {
      // Arrange - temporarily remove window
      const originalWindow = global.window;
      // @ts-expect-error - Testing undefined window scenario
      global.window = undefined;

      const originalVariant = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      };

      // Act
      const result = getReducedMotionVariant(originalVariant);

      // Assert
      expect(result).toBe(originalVariant);

      // Cleanup
      global.window = originalWindow;
    });

    it('should call matchMedia with correct query', () => {
      // Arrange
      const matchMediaMock = createMatchMediaMock(false);
      window.matchMedia = matchMediaMock;

      const originalVariant = { hidden: {}, visible: {} };

      // Act
      getReducedMotionVariant(originalVariant);

      // Assert
      expect(matchMediaMock).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });
  });
});
