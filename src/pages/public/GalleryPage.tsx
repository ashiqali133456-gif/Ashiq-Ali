/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GalleryAlbum, GalleryImage } from '../../types.js';
import { Image as ImageIcon, Maximize2, X } from 'lucide-react';

interface GalleryPageProps {
  albums: GalleryAlbum[];
  images: GalleryImage[];
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ albums, images }) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('All');
  const [activeLightBoxImage, setActiveLightBoxImage] = useState<GalleryImage | null>(null);

  const filteredImages = images.filter(
    (img) => selectedAlbumId === 'All' || img.albumId === selectedAlbumId
  );

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-8 sm:p-10 shadow-md">
          <div className="max-w-3xl space-y-2">
            <span className="bg-orange-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Visual Highlights
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Campus &amp; Laboratories Photo Gallery
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Explore photographs of our practical workshops, high-voltage laboratories, surveying exercises, robotics exhibitions, and campus life.
            </p>
          </div>
        </div>

        {/* Album Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedAlbumId('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedAlbumId === 'All'
                ? 'bg-blue-950 text-white border-blue-900 shadow'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Campus Photos ({images.length})
          </button>
          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => setSelectedAlbumId(album.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedAlbumId === album.id
                  ? 'bg-blue-950 text-white border-blue-900 shadow'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {album.name}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              onClick={() => setActiveLightBoxImage(img)}
              className="group relative rounded-xl overflow-hidden bg-slate-200 aspect-4/3 cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={img.imageUrl}
                alt={img.altText || img.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                  {img.albumName}
                </span>
                <h4 className="font-bold text-xs truncate">{img.title}</h4>
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-sm text-white flex items-center justify-center">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {activeLightBoxImage && (
          <div
            onClick={() => setActiveLightBoxImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
            >
              <button
                onClick={() => setActiveLightBoxImage(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-h-[75vh] overflow-hidden flex items-center justify-center bg-black">
                <img
                  src={activeLightBoxImage.imageUrl}
                  alt={activeLightBoxImage.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full max-h-[75vh] object-contain"
                />
              </div>

              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-white">{activeLightBoxImage.title}</h3>
                  <p className="text-xs text-slate-400">{activeLightBoxImage.caption || activeLightBoxImage.albumName}</p>
                </div>
                <span className="text-xs text-slate-500">{activeLightBoxImage.date}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
