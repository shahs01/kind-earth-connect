
import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> & { 
    sanitize?: boolean 
  }
>(({ className, src, sanitize = true, ...props }, ref) => {
  // Security improvement: Simple URL sanitization for avatar images
  const sanitizedSrc = React.useMemo(() => {
    if (!sanitize || !src || typeof src !== 'string') return src;
    
    try {
      // Only allow http/https URLs or data URLs
      if (src.startsWith('data:image/') || 
          src.startsWith('https://') || 
          src.startsWith('http://')) {
        return src;
      }
      
      // Fall back to placeholder for suspicious URLs
      console.warn('Suspicious image URL sanitized:', src);
      return 'https://ui-avatars.com/api/?name=User';
    } catch (e) {
      console.error('Error sanitizing avatar URL:', e);
      return 'https://ui-avatars.com/api/?name=User';
    }
  }, [src, sanitize]);

  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      src={sanitizedSrc}
      {...props}
    />
  );
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
