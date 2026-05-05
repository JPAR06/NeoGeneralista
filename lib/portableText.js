// Shared PortableText components used by blog post detail pages.
// Renders Sanity image assets via direct CDN URL (no urlFor builder).

export function makePtComponents(imgClassName = "blog-content-img") {
  return {
    types: {
      image: ({ value }) => {
        if (!value?.asset?._ref) return null;
        const ref = value.asset._ref
          .replace("image-", "")
          .replace(/-(\w+)$/, ".$1");
        const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
        const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
        const src = `https://cdn.sanity.io/images/${projectId}/${dataset}/${ref}`;
        return <img src={src} alt={value.alt || ""} className={imgClassName} loading="lazy" />;
      },
    },
  };
}
