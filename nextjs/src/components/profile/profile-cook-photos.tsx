"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Camera, ExternalLink } from "lucide-react";
import type { CookPhoto } from "@/types/profile";
import { formatDistanceToNow } from "date-fns";

interface ProfileCookPhotosProps {
  photos: CookPhoto[];
  username: string;
}

export function ProfileCookPhotos({ photos, username }: ProfileCookPhotosProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<CookPhoto | null>(null);

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            I Made It! Gallery
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {photos.length} photo{photos.length !== 1 ? "s" : ""} from the kitchen
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative aspect-square rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all"
              >
                <Image
                  src={photo.photo_url}
                  alt={photo.recipe_title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-2">
                  <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                    {photo.recipe_title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          {selectedPhoto && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>@{username} made this!</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Photo */}
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={selectedPhoto.photo_url}
                    alt={selectedPhoto.recipe_title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Recipe Info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <Link
                      href={`/app/recipes/${selectedPhoto.recipe_id}`}
                      className="text-lg font-semibold hover:text-primary flex items-center gap-2 group"
                    >
                      {selectedPhoto.recipe_title}
                      <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(selectedPhoto.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                {/* Caption */}
                {selectedPhoto.caption && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm italic">{selectedPhoto.caption}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
