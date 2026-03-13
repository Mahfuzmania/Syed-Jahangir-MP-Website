import { notFound } from "next/navigation";
import { GalleryTabs } from "@/components/gallery/GalleryTabs";
import { MediaCoveragePanel } from "@/components/home/MediaCoveragePanel";
import { SectionTitle } from "@/components/SectionTitle";
import { SubsectionNav } from "@/components/SubsectionNav";
import { isLang, t, translate } from "@/lib/i18n";
import { getSiteContent } from "@/lib/storage";

export default async function MediaGalleryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const copy = t(lang);
  const content = await getSiteContent();

  const galleryItems = content.gallery.map((item) => ({
    id: item.id,
    title: translate(lang, item.title),
    album: translate(lang, item.album),
    image: item.image
  }));

  const mediaItems = content.videos.map((video) => ({
    id: video.id,
    title: translate(lang, video.title),
    duration: video.duration,
    thumbnail: video.thumbnail,
    youtubeUrl: video.youtubeUrl,
    videoFileUrl: video.videoFileUrl
  }));

  return (
    <div className="space-y-6">
      <SectionTitle
        title={copy.videoMediaGallery}
        description={lang === "bn" ? "ভিডিও আপডেট ও ফটো গ্যালারি একসাথে ব্রাউজ করুন।" : "Browse video updates and photo galleries in one place."}
      />

      <SubsectionNav
        defaultActiveId="media-videos"
        items={[
          { id: "media-videos", label: lang === "bn" ? "ভিডিও আপডেট" : "Video Updates" },
          { id: "media-photos", label: lang === "bn" ? "ফটো গ্যালারি" : "Photo Gallery" }
        ]}
      />

      <section id="media-videos" className="space-y-4 scroll-mt-28">
        <SectionTitle title={copy.mediaCoverage} />
        <MediaCoveragePanel lang={lang} items={mediaItems} />
      </section>

      <section id="media-photos" className="space-y-4 scroll-mt-28">
        <SectionTitle title={copy.gallery} />
        <GalleryTabs lang={lang} items={galleryItems} />
      </section>
    </div>
  );
}
